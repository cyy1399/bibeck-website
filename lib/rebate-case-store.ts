import { and, asc, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { highVolumePreReviewCases, rebateActivationCases, rebateCaseEvents, type RebateActivationCase } from "../db/schema.ts";
import { REBATE_CONSENT_VERSION, REBATE_PRIVACY_VERSION, STANDARD_REBATE_RATE, statusTransitions, type RebateActivationStatus } from "../config/rebate-activation.ts";
import { createCaseNumber, normalizeEmail, normalizeUid, type RebateActivationInput } from "./rebate-activation.ts";

export type CreateCaseResult = { kind: "created"; caseData: RebateActivationCase } | { kind: "duplicate"; status: string; caseNumber: string };

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1_000;

export async function createActivationCase(input: RebateActivationInput): Promise<CreateCaseResult> {
  const db = getDb();
  const normalizedUid = normalizeUid(input.uid);
  const normalizedEmail = normalizeEmail(input.contactEmail);
  return db.transaction(async (tx) => {
      const duplicateSince = new Date(Date.now() - DUPLICATE_WINDOW_MS);
      const existing = await tx.select({ status: rebateActivationCases.status, caseNumber: rebateActivationCases.caseNumber }).from(rebateActivationCases).where(and(eq(rebateActivationCases.exchange, "bybit"), eq(rebateActivationCases.normalizedUid, normalizedUid), eq(rebateActivationCases.normalizedEmail, normalizedEmail), gte(rebateActivationCases.createdAt, duplicateSince))).orderBy(desc(rebateActivationCases.createdAt)).limit(1);
      if (existing[0]) return { kind: "duplicate", status: existing[0].status, caseNumber: existing[0].caseNumber };
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const [created] = await tx.insert(rebateActivationCases).values({ caseNumber: createCaseNumber(), exchange: "bybit", displayName: input.displayName, uid: input.uid, normalizedUid, contactEmail: input.contactEmail, normalizedEmail, applicationType: input.applicationType, volumeRange: input.volumeRange, applicantMessage: input.message, status: "SUBMITTED", rebateRate: STANDARD_REBATE_RATE, notificationStatus: "PENDING", consentVersion: REBATE_CONSENT_VERSION, privacyVersion: REBATE_PRIVACY_VERSION, consentedAt: new Date(), source: input.source, utmSource: input.utmSource, utmMedium: input.utmMedium, utmCampaign: input.utmCampaign }).returning();
          await tx.insert(rebateCaseEvents).values({ caseId: created.id, eventType: "REQUEST_CREATED", newStatus: "SUBMITTED", actorEmail: "applicant", publicMessage: "Bybit 返傭申請已送出。" });
          return { kind: "created", caseData: created };
        } catch (error) {
          const dbError = error as { code?: string; constraint?: string; constraint_name?: string };
          const constraint = dbError.constraint || dbError.constraint_name || "";
          if (dbError.code === "23505" && constraint.includes("case_number") && attempt < 2) continue;
          throw error;
        }
      }
      throw new Error("CASE_NUMBER_COLLISION");
  });
}

export async function markReceiptEmail(caseId: string, receiptError: string | null, adminNotificationError: string | null = null) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.update(rebateActivationCases).set({ emailReceiptSentAt: receiptError ? null : new Date(), emailSentAt: receiptError ? undefined : new Date(), notificationStatus: receiptError ? "FAILED" : "SENT", notificationError: receiptError, updatedAt: new Date() }).where(eq(rebateActivationCases.id, caseId));
    await tx.insert(rebateCaseEvents).values([
      { caseId, eventType: receiptError ? "RECEIPT_EMAIL_FAILED" : "RECEIPT_EMAIL_SENT", previousStatus: "SUBMITTED", newStatus: "SUBMITTED", actorEmail: "system", internalMessage: receiptError ? "申請收件通知寄送失敗。" : "申請收件通知寄送成功。" },
      { caseId, eventType: adminNotificationError ? "ADMIN_NOTIFICATION_FAILED" : "ADMIN_NOTIFICATION_SENT", previousStatus: "SUBMITTED", newStatus: "SUBMITTED", actorEmail: "system", internalMessage: adminNotificationError ? "管理員新案件通知寄送失敗。" : "管理員新案件通知寄送成功。" },
    ]);
  });
}
export async function markCompletionEmail(caseId: string, actorEmail: string, error: string | null, retry = false) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.update(rebateActivationCases).set({ completionEmailSentAt: error ? undefined : new Date(), emailSentAt: error ? undefined : new Date(), notificationStatus: error ? "FAILED" : "SENT", notificationError: error?.slice(0, 500) ?? null, updatedAt: new Date() }).where(eq(rebateActivationCases.id, caseId));
    await tx.insert(rebateCaseEvents).values({ caseId, eventType: error ? "EMAIL_FAILED" : retry ? "EMAIL_RETRY_SENT" : "ACTIVATION_EMAIL_SENT", previousStatus: "ACTIVATED", newStatus: "ACTIVATED", actorEmail, internalMessage: error ? "開通通知寄送失敗。" : retry ? "開通通知重送成功。" : "開通通知寄送成功。" });
  });
}

export async function markStatusEmail(caseId: string, actorEmail: string, status: "APPROVED" | "REJECTED", error: string | null) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.update(rebateActivationCases).set({ emailSentAt: error ? undefined : new Date(), notificationStatus: error ? "FAILED" : "SENT", notificationError: error?.slice(0, 500) ?? null, updatedAt: new Date() }).where(eq(rebateActivationCases.id, caseId));
    await tx.insert(rebateCaseEvents).values({ caseId, eventType: error ? "STATUS_EMAIL_FAILED" : "STATUS_EMAIL_SENT", previousStatus: status, newStatus: status, actorEmail, internalMessage: error ? "狀態通知寄送失敗。" : "狀態通知寄送成功。" });
  });
}

export async function getCaseWithEvents(id: string) {
  const db = getDb(); const rows = await db.select().from(rebateActivationCases).where(eq(rebateActivationCases.id, id)).limit(1);
  if (!rows[0]) return null;
  const events = await db.select().from(rebateCaseEvents).where(eq(rebateCaseEvents.caseId, id)).orderBy(asc(rebateCaseEvents.createdAt));
  return { caseData: rows[0], events };
}

export type AdminCaseFilters = { query?: string; status?: RebateActivationStatus; page?: number };
export async function listActivationCases(filters: AdminCaseFilters) {
  const conditions = [];
  if (filters.query) conditions.push(or(ilike(rebateActivationCases.displayName, `%${filters.query}%`), ilike(rebateActivationCases.uid, `%${filters.query}%`), ilike(rebateActivationCases.contactEmail, `%${filters.query}%`))!);
  if (filters.status) conditions.push(eq(rebateActivationCases.status, filters.status));
  const page = Math.max(1, filters.page || 1);
  return getDb().select().from(rebateActivationCases).where(conditions.length ? and(...conditions) : undefined).orderBy(sql`case ${rebateActivationCases.status} when 'SUBMITTED' then 0 when 'REVIEWING' then 1 when 'APPROVED' then 2 when 'ACTIVATED' then 3 else 4 end`, desc(rebateActivationCases.createdAt)).limit(50).offset((page - 1) * 50);
}

export type AdminUpdate = { newStatus: RebateActivationStatus; actorEmail: string; publicMessage: string | null; internalMessage: string | null; completionConfirmed: boolean };
export async function updateActivationCase(id: string, update: AdminUpdate) {
  return getDb().transaction(async (tx) => {
    const rows = await tx.select().from(rebateActivationCases).where(eq(rebateActivationCases.id, id)).for("update").limit(1);
    const current = rows[0];
    if (!current) throw new Error("CASE_NOT_FOUND");
    if (!statusTransitions[current.status as RebateActivationStatus]?.includes(update.newStatus)) throw new Error(current.status === "ACTIVATED" ? "ALREADY_ACTIVATED" : "INVALID_STATUS_TRANSITION");
    if (update.newStatus === "ACTIVATED" && !update.completionConfirmed) throw new Error("ACTIVATION_CONFIRMATION_REQUIRED");
    const activated = update.newStatus === "ACTIVATED";
    const reviewed = update.newStatus === "APPROVED" || update.newStatus === "REJECTED";
    const [next] = await tx.update(rebateActivationCases).set({ status: update.newStatus, rebateRate: STANDARD_REBATE_RATE, completionConfirmed: activated, completedAt: activated ? new Date() : current.completedAt, completedBy: activated ? update.actorEmail : current.completedBy, publicMessage: update.publicMessage, adminNote: update.internalMessage || current.adminNote, reviewNote: update.internalMessage || current.reviewNote, reviewedAt: reviewed ? new Date() : current.reviewedAt, notificationStatus: activated || reviewed ? "PENDING" : current.notificationStatus, notificationError: activated || reviewed ? null : current.notificationError, updatedAt: new Date() }).where(eq(rebateActivationCases.id, id)).returning();
    await tx.insert(rebateCaseEvents).values({ caseId: id, eventType: activated ? "ACTIVATION_COMPLETED" : "STATUS_CHANGED", previousStatus: current.status, newStatus: update.newStatus, actorEmail: update.actorEmail, publicMessage: update.publicMessage, internalMessage: update.internalMessage });
    return next;
  });
}

// High-volume and partner opportunities remain separate from the standard 35% activation.
export async function saveHighVolumePreReview(caseNumber: string, data: Record<string, unknown>) { const [saved] = await getDb().insert(highVolumePreReviewCases).values({ caseNumber, exchange: "bybit", displayName: String(data.name ?? ""), contactEmail: String(data.email ?? ""), currentUid: String(data.currentUid ?? "") || null, applicationData: data }).returning(); return saved; }
export async function recordHighVolumeNotificationError(id: string, message: string | null) { await getDb().update(highVolumePreReviewCases).set({ notificationError: message?.slice(0, 500) ?? null, updatedAt: new Date() }).where(eq(highVolumePreReviewCases.id, id)); }
