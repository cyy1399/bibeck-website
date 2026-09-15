import { randomBytes } from "node:crypto";
import { z } from "zod";
import { rebateActivationStatuses, type RebateActivationStatus } from "../config/rebate-activation.ts";

export type RebateActivationInput = {
  exchange: "bybit";
  displayName: string;
  uid: string;
  contactEmail: string;
  applicationType: "standard";
  volumeRange: "under-10m" | "10m-50m" | "50m-200m" | "over-200m" | "uncertain";
  message: string | null;
  consent: true;
  turnstileToken: string;
  source: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};
export type ActivationValidation = { ok: true; data: RebateActivationInput } | { ok: false; error: string };

const activationSchema = z.object({
  exchange: z.literal("bybit"),
  displayName: z.string().trim().min(2).max(50),
  uid: z.string().trim().regex(/^\d{4,24}$/),
  contactEmail: z.string().trim().toLowerCase().max(254).email(),
  volumeRange: z.enum(["under-10m", "10m-50m", "50m-200m", "over-200m", "uncertain"]),
  message: z.string().trim().max(2_000).nullable(),
  accuracyConfirmed: z.literal(true),
  privacyConsent: z.literal(true),
  turnstileToken: z.string().min(1).max(2_048),
});

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
  const parsed = activationSchema.safeParse({
    exchange: value(form, "exchange"),
    displayName: value(form, "displayName", 51),
    uid: normalizeUid(value(form, "uid", 32)),
    contactEmail: normalizeEmail(value(form, "contactEmail", 255)),
    volumeRange: value(form, "volumeRange"),
    message: value(form, "message", 2_001) || null,
    accuracyConfirmed: value(form, "accuracyConfirmed") === "true",
    privacyConsent: value(form, "privacyConsent") === "true",
    turnstileToken: value(form, "cf-turnstile-response", 2_048),
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const errors: Record<string, string> = {
      exchange: "目前只開放 Bybit 返傭申請。",
      displayName: "名稱或稱呼需為 2 至 50 個字元。",
      uid: "Bybit UID 必須是 4 至 24 位數字。",
      contactEmail: "請輸入有效的聯絡 Email。",
      volumeRange: "請選擇最近 30 日交易量區間。",
      message: "補充說明不得超過 2,000 個字元。",
      accuracyConfirmed: "請確認申請資料正確。",
      privacyConsent: "請先閱讀並同意隱私權政策與個人資料蒐集告知。",
      turnstileToken: "請完成人機驗證。",
    };
    return { ok: false, error: errors[String(field)] || "申請資料格式不正確。" };
  }
  return { ok: true, data: { exchange: parsed.data.exchange, displayName: parsed.data.displayName, uid: parsed.data.uid, contactEmail: parsed.data.contactEmail, applicationType: "standard", volumeRange: parsed.data.volumeRange, message: parsed.data.message, consent: true, turnstileToken: parsed.data.turnstileToken, source: value(form, "source", 80) || "website", utmSource: value(form, "utmSource", 100) || null, utmMedium: value(form, "utmMedium", 100) || null, utmCampaign: value(form, "utmCampaign", 100) || null } };
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
