import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/admin-auth";
import { recordCaseNotification, recordNotificationError, rotateTrackingTokenForNotification, updateActivationCase } from "@/lib/rebate-case-store";
import { isStatus } from "@/lib/rebate-activation";
import { sendActivationStatusEmail } from "@/lib/rebate-email";

export const runtime = "nodejs";
type NotifiableStatus = "NEEDS_INFORMATION" | "NOT_ATTRIBUTED" | "COMPLETED" | "CANCELLED";
const notifiableStatuses: readonly string[] = ["NEEDS_INFORMATION", "NOT_ATTRIBUTED", "COMPLETED", "CANCELLED"];

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actorEmail = await getAdminEmail();
  if (!actorEmail) return NextResponse.json({ error: "未授權" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "來源驗證失敗" }, { status: 403 });
  const { id } = await params;

  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.retryNotification === true) {
      const rotated = await rotateTrackingTokenForNotification(id, actorEmail);
      if (!notifiableStatuses.includes(rotated.caseData.status)) throw new Error("NO_NOTIFICATION_FOR_STATUS");
      await sendActivationStatusEmail(rotated.caseData, rotated.trackingToken, rotated.caseData.status as NotifiableStatus);
      await recordNotificationError(id, null);
      await recordCaseNotification(id, rotated.caseData.status, actorEmail, true);
      return NextResponse.json({ ok: true });
    }

    const newStatus = String(body.newStatus || "");
    if (!isStatus(newStatus)) return NextResponse.json({ error: "無效的案件狀態" }, { status: 400 });
    const approvedRaw = String(body.approvedRate ?? "").trim();
    const effectiveRaw = String(body.effectiveAt ?? "").trim();
    const updated = await updateActivationCase(id, {
      newStatus,
      actorEmail,
      publicMessage: String(body.publicMessage || "").trim().slice(0, 1_000) || null,
      internalMessage: String(body.internalMessage || "").trim().slice(0, 2_000) || null,
      approvedRate: approvedRaw ? Number(approvedRaw) : null,
      effectiveAt: effectiveRaw ? new Date(effectiveRaw) : null,
      externalSetupConfirmed: body.externalSetupConfirmed === "true" || body.externalSetupConfirmed === true,
    });

    if (notifiableStatuses.includes(newStatus)) {
      try {
        await sendActivationStatusEmail(updated.caseData, updated.trackingToken, newStatus as NotifiableStatus);
        await recordCaseNotification(id, newStatus, actorEmail);
      } catch (error) {
        await recordNotificationError(id, error instanceof Error ? error.message : "EMAIL_FAILED");
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UPDATE_FAILED";
    const messages: Record<string, string> = {
      INVALID_STATUS_TRANSITION: "不允許此狀態轉換。",
      COMPLETION_REQUIREMENTS_MISSING: "完成案件前必須填入比例、設定時間並確認外部後台已完成設定。",
      CASE_NOT_FOUND: "找不到案件。",
      NO_NOTIFICATION_FOR_STATUS: "目前狀態沒有可重送的通知。",
    };
    return NextResponse.json({ error: messages[code] || "案件更新失敗" }, { status: 400 });
  }
}
