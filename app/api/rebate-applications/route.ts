import { NextResponse } from "next/server";
import { sendActivationReceipt, sendAdminNewRequest } from "@/lib/rebate-email";
import { validateRebateActivation, verifyTurnstile } from "@/lib/rebate-activation";
import { createActivationCase, markReceiptEmail } from "@/lib/rebate-case-store";
import { handleRebateSubmission } from "@/lib/rebate-submission-handler";
import { allowApplicationSubmission } from "@/lib/submission-rate-limit";

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  if (!allowApplicationSubmission(forwarded || "unknown")) return NextResponse.json({ error: "送出次數過多，請稍後再試。" }, { status: 429 });
  const result = await handleRebateSubmission(await request.formData(), forwarded, {
    validate: validateRebateActivation,
    verifyBot: verifyTurnstile,
    createCase: createActivationCase,
    sendReceipt: sendActivationReceipt,
    sendAdmin: sendAdminNewRequest,
    markEmail: markReceiptEmail,
  });
  return NextResponse.json(result.body, { status: result.status });
}
