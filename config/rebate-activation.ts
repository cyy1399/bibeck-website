export const rebateActivationStatuses = ["SUBMITTED", "REVIEWING", "APPROVED", "ACTIVATED", "REJECTED"] as const;
export type RebateActivationStatus = (typeof rebateActivationStatuses)[number];

export const rebateStatusLabels: Record<RebateActivationStatus, string> = {
  SUBMITTED: "已送出",
  REVIEWING: "審核中",
  APPROVED: "審核通過",
  ACTIVATED: "已開通",
  REJECTED: "未通過",
};

export const statusTransitions: Record<RebateActivationStatus, readonly RebateActivationStatus[]> = {
  SUBMITTED: ["REVIEWING", "APPROVED", "REJECTED"],
  REVIEWING: ["APPROVED", "REJECTED"],
  APPROVED: ["ACTIVATED", "REJECTED"],
  ACTIVATED: [],
  REJECTED: ["SUBMITTED"],
};

export const REBATE_CONSENT_VERSION = "2026-09-16";
export const REBATE_PRIVACY_VERSION = "2026-09-16";
export const STANDARD_REBATE_RATE = 35;
const requiredProductionSettings = ["DATABASE_URL", "EMAIL_PROVIDER_API_KEY", "AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "ADMIN_EMAIL_ALLOWLIST", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"] as const;

export function rebateActivationReadiness() {
  const requested = process.env.REBATE_ACTIVATION_ENABLED === "true";
  const missing = requiredProductionSettings.filter((key) => !process.env[key]);
  return { enabled: requested && (process.env.NODE_ENV !== "production" || missing.length === 0), requested, missing } as const;
}
