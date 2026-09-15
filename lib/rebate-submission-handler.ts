import type { RebateActivationCase } from "../db/schema.ts";
import type { ActivationValidation } from "./rebate-activation.ts";
import type { CreateCaseResult } from "./rebate-case-store.ts";

export type SubmissionDependencies = {
  validate(form: FormData): ActivationValidation;
  verifyBot(token: string, remoteIp: string | null): Promise<boolean>;
  createCase(input: Extract<ActivationValidation, { ok: true }>["data"]): Promise<CreateCaseResult>;
  sendReceipt(caseData: RebateActivationCase): Promise<void>;
  sendAdmin(caseData: RebateActivationCase): Promise<void>;
  markEmail(caseId: string, receiptError: string | null, adminError: string | null): Promise<void>;
};

export type SubmissionResult = { status: number; body: { caseNumber?: string; duplicate?: boolean; error?: string } };

export async function handleRebateSubmission(form: FormData, remoteIp: string | null, dependencies: SubmissionDependencies): Promise<SubmissionResult> {
  const validation = dependencies.validate(form);
  if (!validation.ok) return { status: 400, body: { error: validation.error } };
  if (!await dependencies.verifyBot(validation.data.turnstileToken, remoteIp)) return { status: 400, body: { error: "人機驗證失敗，請重新嘗試。" } };

  try {
    const result = await dependencies.createCase(validation.data);
    if (result.kind === "duplicate") return { status: 200, body: { caseNumber: result.caseNumber, duplicate: true } };
    const [receipt, admin] = await Promise.allSettled([dependencies.sendReceipt(result.caseData), dependencies.sendAdmin(result.caseData)]);
    const receiptError = receipt.status === "rejected" ? "RECEIPT_EMAIL_FAILED" : null;
    const adminError = admin.status === "rejected" ? "ADMIN_NOTIFICATION_FAILED" : null;
    await dependencies.markEmail(result.caseData.id, receiptError, adminError).catch(() => undefined);
    return { status: 201, body: { caseNumber: result.caseData.caseNumber } };
  } catch {
    return { status: 503, body: { error: "送出失敗，請稍後再試。" } };
  }
}
