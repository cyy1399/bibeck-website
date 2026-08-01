import { randomBytes } from "node:crypto";
import { rebateActivationStatuses, type RebateActivationStatus } from "../config/rebate-activation.ts";

export type RebateActivationInput = {
  exchange: "bybit";
  displayName: string;
  uid: string;
  contactEmail: string;
  consent: true;
  turnstileToken: string;
  source: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};
export type ActivationValidation = { ok: true; data: RebateActivationInput } | { ok: false; error: string };

function value(form: FormData, key: string, max = 1_000): string {
  const raw = form.get(key);
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}
export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function normalizeUid(uid: string) { return uid.trim(); }
export function createCaseNumber(prefix: "BB" | "HV" = "BB", now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `${prefix}-${date}-${randomBytes(5).toString("base64url").toUpperCase().slice(0, 7)}`;
}
export function maskUid(uid: string): string { return uid.length <= 4 ? `${uid.slice(0, 1)}***${uid.slice(-1)}` : `${uid.slice(0, 2)}****${uid.slice(-2)}`; }
export function isStatus(input: string): input is RebateActivationStatus { return (rebateActivationStatuses as readonly string[]).includes(input); }

export function validateRebateActivation(form: FormData): ActivationValidation {
  if (value(form, "website")) return { ok: false, error: "申請無法送出。" };
  const exchange = value(form, "exchange");
  const displayName = value(form, "displayName", 51);
  const uid = normalizeUid(value(form, "uid", 32));
  const contactEmail = normalizeEmail(value(form, "contactEmail", 255));
  if (exchange !== "bybit") return { ok: false, error: "目前只開放 Bybit 返傭申請。" };
  if (displayName.length < 2 || displayName.length > 50) return { ok: false, error: "名稱或稱呼需為 2 至 50 個字元。" };
  if (!/^\d{4,24}$/.test(uid)) return { ok: false, error: "Bybit UID 必須是 4 至 24 位數字。" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return { ok: false, error: "請輸入有效的聯絡 Email。" };
  if (value(form, "consent") !== "true") return { ok: false, error: "請先閱讀並同意隱私權政策、使用條款及個人資料蒐集告知。" };
  const turnstileToken = value(form, "cf-turnstile-response", 2_048);
  if (!turnstileToken) return { ok: false, error: "請完成人機驗證。" };
  return { ok: true, data: { exchange: "bybit", displayName, uid, contactEmail, consent: true, turnstileToken, source: value(form, "source", 80) || "website", utmSource: value(form, "utmSource", 100) || null, utmMedium: value(form, "utmMedium", 100) || null, utmCampaign: value(form, "utmCampaign", 100) || null } };
}

export async function verifyTurnstile(token: string, remoteIp: string | null, fetcher: typeof fetch = fetch): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== "production" && token === "test-turnstile-token";
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean };
  return result.success === true;
}
