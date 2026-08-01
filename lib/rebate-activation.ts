import { createHash, randomBytes } from "node:crypto";
import { accountScenarios, kycStatuses, rebateActivationStatuses, type RebateActivationStatus } from "../config/rebate-activation.ts";

export type RebateActivationInput = { exchange: "bybit"; displayName: string; contactEmail: string; uid: string; registrationDate: Date; accountScenario: string; kycStatus: string; preReviewCaseNumber: string | null; messagingContact: string | null; userNote: string | null; consent: true; turnstileToken: string; source: string; utmSource: string | null; utmMedium: string | null; utmCampaign: string | null };
export type ActivationValidation = { ok: true; data: RebateActivationInput } | { ok: false; error: string };

function value(form: FormData, key: string, max = 1_000): string { const raw = form.get(key); return typeof raw === "string" ? raw.trim().slice(0, max) : ""; }
export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function normalizeUid(uid: string) { return uid.trim(); }
export function createCaseNumber(prefix: "BB" | "HV", now = new Date()): string { const date = now.toISOString().slice(0, 10).replaceAll("-", ""); return `${prefix}-${date}-${randomBytes(5).toString("base64url").toUpperCase().slice(0, 7)}`; }
export function createTrackingToken(): string { return randomBytes(32).toString("base64url"); }
export function hashTrackingToken(token: string): string { return createHash("sha256").update(token).digest("hex"); }
export function maskUid(uid: string): string { return uid.length <= 4 ? `${uid.slice(0, 1)}***${uid.slice(-1)}` : `${uid.slice(0, 2)}****${uid.slice(-2)}`; }
export function maskEmail(email: string): string { const [local, domain = ""] = email.split("@"); const masked = local.length <= 2 ? `${local.slice(0, 1)}***` : `${local.slice(0, 1)}***${local.slice(-1)}`; return `${masked}@${domain}`; }
export function isStatus(value: string): value is RebateActivationStatus { return (rebateActivationStatuses as readonly string[]).includes(value); }

export function validateRebateActivation(form: FormData, now = new Date()): ActivationValidation {
  if (value(form, "website")) return { ok: false, error: "申請未能送出。" };
  const exchange = value(form, "exchange"); const displayName = value(form, "displayName", 51); const contactEmail = normalizeEmail(value(form, "contactEmail", 255)); const uid = normalizeUid(value(form, "uid", 32));
  const registrationDateRaw = value(form, "registrationDate", 10); const accountScenario = value(form, "accountScenario", 40); const kycStatus = value(form, "kycStatus", 40); const preReviewCaseNumber = value(form, "preReviewCaseNumber", 40).toUpperCase();
  if (exchange !== "bybit") return { ok: false, error: "目前僅開放 Bybit 返傭啟用申請。" };
  if (displayName.length < 2 || displayName.length > 50) return { ok: false, error: "姓名或稱呼須為 2 至 50 個字元。" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return { ok: false, error: "請填寫有效的聯絡 Email。" };
  if (!/^\d{4,24}$/.test(uid)) return { ok: false, error: "Bybit UID 必須為 4 至 24 位純數字。" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(registrationDateRaw)) return { ok: false, error: "請填寫有效的註冊日期。" };
  const registrationDate = new Date(`${registrationDateRaw}T00:00:00.000Z`); const today = new Date(now.toISOString().slice(0, 10) + "T00:00:00.000Z");
  if (Number.isNaN(registrationDate.getTime()) || registrationDate > today) return { ok: false, error: "註冊日期不可晚於今天。" };
  if (!accountScenarios.some(([id]) => id === accountScenario) || !kycStatuses.some(([id]) => id === kycStatus)) return { ok: false, error: "請完成帳號情境與 KYC 狀態。" };
  if (preReviewCaseNumber && !/^HV-\d{8}-[A-Z0-9_-]{4,12}$/.test(preReviewCaseNumber)) return { ok: false, error: "高交易量預審案件編號格式不正確。" };
  if (value(form, "consent") !== "true") return { ok: false, error: "請閱讀並同意隱私權政策、使用條款及個人資料蒐集告知。" };
  const turnstileToken = value(form, "cf-turnstile-response", 2_048); if (!turnstileToken) return { ok: false, error: "請完成人機驗證。" };
  return { ok: true, data: { exchange: "bybit", displayName, contactEmail, uid, registrationDate, accountScenario, kycStatus, preReviewCaseNumber: preReviewCaseNumber || null, messagingContact: value(form, "messagingContact", 120) || null, userNote: value(form, "userNote", 1_001) || null, consent: true, turnstileToken, source: value(form, "source", 80) || "website", utmSource: value(form, "utmSource", 100) || null, utmMedium: value(form, "utmMedium", 100) || null, utmCampaign: value(form, "utmCampaign", 100) || null } };
}

export async function verifyTurnstile(token: string, remoteIp: string | null, fetcher: typeof fetch = fetch): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== "production" && token === "test-turnstile-token";
  const body = new URLSearchParams({ secret, response: token }); if (remoteIp) body.set("remoteip", remoteIp);
  const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  if (!response.ok) return false; const result = await response.json() as { success?: boolean }; return result.success === true;
}
