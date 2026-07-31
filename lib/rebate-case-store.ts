import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { highVolumePreReviewCases, rebateActivationCases, rebateCaseEvents, type RebateActivationCase } from "../db/schema.ts";
import { REBATE_CONSENT_VERSION, statusTransitions, type RebateActivationStatus } from "../config/rebate-activation.ts";
import { createCaseNumber, createTrackingToken, hashTrackingToken, normalizeEmail, normalizeUid, type RebateActivationInput } from "./rebate-activation.ts";

const activeStatuses: RebateActivationStatus[] = ["SUBMITTED", "UID_PENDING", "PENDING_MANUAL_SETUP", "NEEDS_INFORMATION", "COMPLETED"];
export type CreateCaseResult = { kind: "created" | "resent"; caseData: RebateActivationCase; trackingToken: string } | { kind: "duplicate-private" };

export async function createOrResolveActivationCase(input: RebateActivationInput): Promise<CreateCaseResult> {
  const db = getDb(); const trackingToken = createTrackingToken(); const trackingTokenHash = hashTrackingToken(trackingToken); const normalizedUid = normalizeUid(input.uid); const normalizedEmail = normalizeEmail(input.contactEmail);
  try {
    return await db.transaction(async (tx) => {
    if (input.preReviewCaseNumber) { const preReviews = await tx.select().from(highVolumePreReviewCases).where(eq(highVolumePreReviewCases.caseNumber, input.preReviewCaseNumber)).limit(1); if (!preReviews[0]) throw new Error("INVALID_PRE_REVIEW_CASE"); }
    const existing = await tx.select().from(rebateActivationCases).where(and(eq(rebateActivationCases.exchange, input.exchange), eq(rebateActivationCases.normalizedUid, normalizedUid), inArray(rebateActivationCases.status, activeStatuses))).limit(1);
    if (existing[0]) {
      if (existing[0].normalizedEmail !== normalizedEmail) return { kind: "duplicate-private" };
      const [updated] = await tx.update(rebateActivationCases).set({ trackingTokenHash, updatedAt: new Date() }).where(eq(rebateActivationCases.id, existing[0].id)).returning();
      await tx.insert(rebateCaseEvents).values({ caseId: updated.id, eventType: "TRACKING_LINK_REISSUED", previousStatus: updated.status, newStatus: updated.status, actorEmail: "system@bibeck.com", publicMessage: "案件查詢連結已重新寄送。" });
      return { kind: "resent", caseData: updated, trackingToken };
    }
    const [created] = await tx.insert(rebateActivationCases).values({ caseNumber: createCaseNumber("BB"), exchange: input.exchange, uid: input.uid, normalizedUid, displayName: input.displayName, contactEmail: input.contactEmail, normalizedEmail, registrationDate: input.registrationDate, accountScenario: input.accountScenario, kycStatus: input.kycStatus, messagingContact: input.messagingContact, preReviewCaseNumber: input.preReviewCaseNumber, userNote: input.userNote, defaultRate: 20, trackingTokenHash, consentVersion: REBATE_CONSENT_VERSION, consentedAt: new Date(), source: input.source, utmSource: input.utmSource, utmMedium: input.utmMedium, utmCampaign: input.utmCampaign }).returning();
    await tx.insert(rebateCaseEvents).values({ caseId: created.id, eventType: "CASE_SUBMITTED", newStatus: "SUBMITTED", actorEmail: "applicant", publicMessage: "返傭啟用申請已送出。" });
    return { kind: "created", caseData: created, trackingToken };
    });
  } catch (error) {
    const databaseError = error as { code?: string; constraint_name?: string; constraint?: string };
    const isActiveUidConflict = databaseError.code === "23505" && (databaseError.constraint_name === "rebate_activation_active_uid_unique" || databaseError.constraint === "rebate_activation_active_uid_unique");
    if (!isActiveUidConflict) throw error;

    return db.transaction(async (tx) => {
      const rows = await tx.select().from(rebateActivationCases).where(and(eq(rebateActivationCases.exchange, input.exchange), eq(rebateActivationCases.normalizedUid, normalizedUid), inArray(rebateActivationCases.status, activeStatuses))).limit(1);
      const existing = rows[0];
      if (!existing || existing.normalizedEmail !== normalizedEmail) return { kind: "duplicate-private" };
      const [updated] = await tx.update(rebateActivationCases).set({ trackingTokenHash, updatedAt: new Date() }).where(eq(rebateActivationCases.id, existing.id)).returning();
      await tx.insert(rebateCaseEvents).values({ caseId: updated.id, eventType: "TRACKING_LINK_REISSUED", previousStatus: updated.status, newStatus: updated.status, actorEmail: "system@bibeck.com", publicMessage: "案件查詢連結已重新寄送。" });
      return { kind: "resent", caseData: updated, trackingToken };
    });
  }
}

export async function getCaseByTrackingToken(token: string) { if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null; const rows = await getDb().select().from(rebateActivationCases).where(eq(rebateActivationCases.trackingTokenHash, hashTrackingToken(token))).limit(1); return rows[0] ?? null; }
export async function recordNotificationError(caseId: string, message: string | null) { await getDb().update(rebateActivationCases).set({ notificationError: message?.slice(0, 500) ?? null, updatedAt: new Date() }).where(eq(rebateActivationCases.id, caseId)); }
export async function recordCaseNotification(caseId: string, status: RebateActivationStatus, actorEmail: string, retry = false) {
  await getDb().insert(rebateCaseEvents).values({ caseId, eventType: retry ? "NOTIFICATION_RETRY_SENT" : "STATUS_NOTIFICATION_SENT", previousStatus: status, newStatus: status, actorEmail, internalMessage: retry ? "狀態通知重送成功。" : "狀態通知寄送成功。" });
}
export async function getCaseWithEvents(id: string) { const db = getDb(); const cases = await db.select().from(rebateActivationCases).where(eq(rebateActivationCases.id, id)).limit(1); if (!cases[0]) return null; const events = await db.select().from(rebateCaseEvents).where(eq(rebateCaseEvents.caseId, id)).orderBy(asc(rebateCaseEvents.createdAt)); return { caseData: cases[0], events }; }

export type AdminCaseFilters = { query?: string; status?: RebateActivationStatus; exchange?: string; preReview?: string; from?: Date; to?: Date };
export async function listActivationCases(filters: AdminCaseFilters) {
  const conditions = [];
  if (filters.query) conditions.push(or(ilike(rebateActivationCases.caseNumber, `%${filters.query}%`), ilike(rebateActivationCases.uid, `%${filters.query}%`), ilike(rebateActivationCases.contactEmail, `%${filters.query}%`))!);
  if (filters.status) conditions.push(eq(rebateActivationCases.status, filters.status)); if (filters.exchange) conditions.push(eq(rebateActivationCases.exchange, filters.exchange)); if (filters.preReview) conditions.push(ilike(rebateActivationCases.preReviewCaseNumber, `%${filters.preReview}%`));
  if (filters.from) conditions.push(sql`${rebateActivationCases.createdAt} >= ${filters.from}`); if (filters.to) conditions.push(sql`${rebateActivationCases.createdAt} <= ${filters.to}`);
  return getDb().select().from(rebateActivationCases).where(conditions.length ? and(...conditions) : undefined).orderBy(sql`case when ${rebateActivationCases.status} in ('COMPLETED','CANCELLED','NOT_ATTRIBUTED') then 1 else 0 end`, desc(rebateActivationCases.createdAt)).limit(250);
}

export type AdminUpdate = { newStatus: RebateActivationStatus; actorEmail: string; publicMessage: string | null; internalMessage: string | null; approvedRate: number | null; effectiveAt: Date | null; externalSetupConfirmed: boolean };
export async function updateActivationCase(id: string, update: AdminUpdate) {
  return getDb().transaction(async (tx) => {
    const rows = await tx.select().from(rebateActivationCases).where(eq(rebateActivationCases.id, id)).for("update").limit(1); const current = rows[0]; if (!current) throw new Error("CASE_NOT_FOUND");
    if (!statusTransitions[current.status].includes(update.newStatus)) throw new Error("INVALID_STATUS_TRANSITION");
    if (update.newStatus === "COMPLETED" && (!update.externalSetupConfirmed || update.approvedRate === null || update.approvedRate < 0 || update.approvedRate > 100 || !update.effectiveAt)) throw new Error("COMPLETION_REQUIREMENTS_MISSING");
    const completed = update.newStatus === "COMPLETED";
    const trackingToken = createTrackingToken();
    const [next] = await tx.update(rebateActivationCases).set({ status: update.newStatus, approvedRate: completed ? update.approvedRate : current.approvedRate, effectiveAt: completed ? update.effectiveAt : current.effectiveAt, externalSetupConfirmed: completed ? true : current.externalSetupConfirmed, publicMessage: update.publicMessage, adminNote: update.internalMessage || current.adminNote, completedAt: completed ? new Date() : current.completedAt, updatedAt: new Date(), notificationError: null, trackingTokenHash: hashTrackingToken(trackingToken) }).where(eq(rebateActivationCases.id, id)).returning();
    await tx.insert(rebateCaseEvents).values({ caseId: id, eventType: completed ? "REBATE_SETUP_COMPLETED" : "STATUS_CHANGED", previousStatus: current.status, newStatus: update.newStatus, actorEmail: update.actorEmail, publicMessage: update.publicMessage, internalMessage: update.internalMessage });
    return { caseData: next, trackingToken };
  });
}

export async function saveHighVolumePreReview(caseNumber: string, data: Record<string, unknown>) { const [saved] = await getDb().insert(highVolumePreReviewCases).values({ caseNumber, exchange: "bybit", displayName: String(data.name ?? ""), contactEmail: String(data.email ?? ""), currentUid: String(data.currentUid ?? "") || null, applicationData: data }).returning(); return saved; }
export async function findPreReview(caseNumber: string) { const rows = await getDb().select().from(highVolumePreReviewCases).where(eq(highVolumePreReviewCases.caseNumber, caseNumber)).limit(1); return rows[0] ?? null; }
export async function recordHighVolumeNotificationError(id: string, message: string | null) { await getDb().update(highVolumePreReviewCases).set({ notificationError: message?.slice(0, 500) ?? null, updatedAt: new Date() }).where(eq(highVolumePreReviewCases.id, id)); }
export async function listHighVolumePreReviews() {
  return getDb().select().from(highVolumePreReviewCases).orderBy(
    sql`case when ${highVolumePreReviewCases.status} = 'SUBMITTED' then 0 else 1 end`,
    desc(highVolumePreReviewCases.createdAt),
  ).limit(250);
}
export async function getHighVolumePreReview(id: string) {
  const rows = await getDb().select().from(highVolumePreReviewCases).where(eq(highVolumePreReviewCases.id, id)).limit(1);
  return rows[0] ?? null;
}
export async function approveHighVolumePreReview(id: string, approvedRate: number) {
  if (!Number.isFinite(approvedRate) || approvedRate < 20 || approvedRate > 100) throw new Error("INVALID_APPROVED_RATE");
  const [updated] = await getDb().update(highVolumePreReviewCases).set({ status: "APPROVED", approvedRate, notificationError: null, updatedAt: new Date() }).where(eq(highVolumePreReviewCases.id, id)).returning();
  if (!updated) throw new Error("PRE_REVIEW_NOT_FOUND");
  return updated;
}
export async function rotateTrackingTokenForNotification(id: string, actorEmail: string) { const db = getDb(); const trackingToken = createTrackingToken(); return db.transaction(async (tx) => { const [caseData] = await tx.update(rebateActivationCases).set({ trackingTokenHash: hashTrackingToken(trackingToken), updatedAt: new Date() }).where(eq(rebateActivationCases.id, id)).returning(); if (!caseData) throw new Error("CASE_NOT_FOUND"); await tx.insert(rebateCaseEvents).values({ caseId: id, eventType: "NOTIFICATION_RETRY", previousStatus: caseData.status, newStatus: caseData.status, actorEmail, internalMessage: "管理員重新寄送狀態通知。" }); return { caseData, trackingToken }; }); }
