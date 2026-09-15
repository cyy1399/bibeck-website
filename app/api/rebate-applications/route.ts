import { NextResponse } from "next/server";
import { sendActivationReceipt, sendAdminNewRequest } from "@/lib/rebate-email";
import { validateRebateActivation, verifyTurnstile } from "@/lib/rebate-activation";
import { createActivationCase, markReceiptEmail } from "@/lib/rebate-case-store";
import { allowApplicationSubmission } from "@/lib/submission-rate-limit";

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const rateKey = forwarded || "unknown";
  if (!allowApplicationSubmission(rateKey)) return NextResponse.json({ error: "送出次數過多，請稍後再試。" }, { status: 429 });

  try {
    const form = await request.formData();
    const validation = validateRebateActivation(form);
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    if (!await verifyTurnstile(validation.data.turnstileToken, forwarded || null)) return NextResponse.json({ error: "人機驗證失敗，請重新嘗試。" }, { status: 400 });

    const result = await createActivationCase(validation.data);
    if (result.kind === "duplicate") return NextResponse.json({ error: "此 Bybit UID 已有申請紀錄，請聯絡客服確認進度。" }, { status: 409 });

    const [receipt, admin] = await Promise.allSettled([sendActivationReceipt(result.caseData), sendAdminNewRequest(result.caseData)]);
    const receiptError = receipt.status === "rejected" ? "RECEIPT_EMAIL_FAILED" : null;
    const adminError = admin.status === "rejected" ? "ADMIN_NOTIFICATION_FAILED" : null;
    await markReceiptEmail(result.caseData.id, receiptError, adminError).catch(() => undefined);
    return NextResponse.json({ caseNumber: result.caseData.caseNumber }, { status: 201 });
  } catch (error) {
    console.error("rebate application failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "申請暫時無法送出，請稍後再試或聯絡客服。" }, { status: 503 });
  }
}
