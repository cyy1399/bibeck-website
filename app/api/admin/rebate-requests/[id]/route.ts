import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/admin-auth";
import { getCaseWithEvents, markCompletionEmail, updateActivationCase } from "@/lib/rebate-case-store";
import { isStatus } from "@/lib/rebate-activation";
import { sendCompletionEmail, sendStatusEmail } from "@/lib/rebate-email";

export const runtime = "nodejs";
function sameOrigin(request: Request) { const origin = request.headers.get("origin"), host = request.headers.get("host"); if (!origin || !host) return false; try { return new URL(origin).host === host; } catch { return false; } }
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actorEmail = await getAdminEmail(); if (!actorEmail) return NextResponse.json({ error: "未授權" }, { status: 401 }); if (!sameOrigin(request)) return NextResponse.json({ error: "來源驗證失敗" }, { status: 403 }); const { id } = await params;
  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.retryNotification === true) {
      const record = await getCaseWithEvents(id); if (!record || record.caseData.status !== "COMPLETED") throw new Error("NO_COMPLETION_NOTIFICATION");
      try { await sendCompletionEmail(record.caseData, true); await markCompletionEmail(id, actorEmail, null, true); }
      catch (error) { await markCompletionEmail(id, actorEmail, error instanceof Error ? error.message : "EMAIL_FAILED", true); throw new Error("EMAIL_FAILED"); }
      return NextResponse.json({ ok: true });
    }
    const newStatus = String(body.newStatus || ""); if (!isStatus(newStatus)) return NextResponse.json({ error: "無效的案件狀態" }, { status: 400 });
    const updated = await updateActivationCase(id, { newStatus, actorEmail, publicMessage: String(body.publicMessage || "").trim().slice(0, 1_000) || null, internalMessage: String(body.internalMessage || "").trim().slice(0, 2_000) || null, completionConfirmed: body.completionConfirmed === true || body.completionConfirmed === "true" });
    if (newStatus === "COMPLETED") {
      try { await sendCompletionEmail(updated); await markCompletionEmail(id, actorEmail, null); }
      catch (error) { await markCompletionEmail(id, actorEmail, error instanceof Error ? error.message : "EMAIL_FAILED"); }
    } else if (newStatus === "NEEDS_INFORMATION" || newStatus === "NOT_FOUND" || newStatus === "CANCELLED") {
      try { await sendStatusEmail(updated, newStatus); } catch { /* case state remains authoritative */ }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UPDATE_FAILED"; const messages: Record<string, string> = { CASE_NOT_FOUND: "找不到案件。", ALREADY_COMPLETED: "案件已完成，不可重複完成。", INVALID_STATUS_TRANSITION: "不允許此狀態轉換。", COMPLETION_CONFIRMATION_REQUIRED: "請先確認已在外部返傭後台完成 20% 設定。", PUBLIC_MESSAGE_REQUIRED: "補件時必須填寫使用者公開說明。", NO_COMPLETION_NOTIFICATION: "只有已完成案件可以重送完成通知。", EMAIL_FAILED: "通知仍寄送失敗，案件完成紀錄不受影響。" }; return NextResponse.json({ error: messages[code] || "案件更新失敗" }, { status: 400 });
  }
}
