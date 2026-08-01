import { NextResponse } from "next/server";
import { rebateActivationReadiness } from "@/config/rebate-activation";
import { createActivationCase, markReceiptEmail } from "@/lib/rebate-case-store";
import { maskUid, validateRebateActivation, verifyTurnstile } from "@/lib/rebate-activation";
import { sendActivationReceipt, sendAdminNewRequest } from "@/lib/rebate-email";

export const runtime = "nodejs";
const attempts = new Map<string, number[]>();
function sameOrigin(request: Request) { const origin = request.headers.get("origin"), host = request.headers.get("host"); if (!origin || !host) return false; try { return new URL(origin).host === host; } catch { return false; } }
function limited(key: string) { const now = Date.now(); const recent = (attempts.get(key) || []).filter((time) => now - time < 15 * 60_000); recent.push(now); attempts.set(key, recent); return recent.length > 5; }

export async function POST(request: Request) {
  if (!rebateActivationReadiness().enabled) return NextResponse.json({ error: "返傭開通功能尚未完成設定。" }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "來源驗證失敗。" }, { status: 403 });
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ error: "送出次數過多，請稍後再試。" }, { status: 429 });
  try {
    const result = validateRebateActivation(await request.formData());
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    if (!await verifyTurnstile(result.data.turnstileToken, ip === "unknown" ? null : ip)) return NextResponse.json({ error: "人機驗證失敗，請重新整理後再試。" }, { status: 400 });
    const created = await createActivationCase(result.data);
    if (created.kind === "duplicate") {
      const completed = created.status === "COMPLETED";
      return NextResponse.json({ error: completed ? "此 UID 已有完成紀錄。如返傭後台未顯示或資料有誤，請聯絡 support@bibeck.com。" : "此 UID 已存在處理中的申請。若需要補充資料，請聯絡 support@bibeck.com。" }, { status: 409 });
    }
    let receiptError: string | null = null;
    let adminNotificationError: string | null = null;
    try { await sendActivationReceipt(created.caseData); }
    catch { receiptError = "RECEIPT_EMAIL_FAILED"; }
    try { await sendAdminNewRequest(created.caseData); }
    catch { adminNotificationError = "ADMIN_NOTIFICATION_FAILED"; }
    await markReceiptEmail(created.caseData.id, receiptError, adminNotificationError);
    return NextResponse.json({ caseNumber: created.caseData.caseNumber, maskedUid: maskUid(created.caseData.uid) }, { status: 201 });
  } catch { return NextResponse.json({ error: "申請暫時無法送出，請稍後再試。" }, { status: 500 }); }
}
