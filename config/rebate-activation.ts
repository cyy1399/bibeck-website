export const rebateActivationStatuses = ["PENDING", "NEEDS_INFORMATION", "NOT_FOUND", "COMPLETED", "CANCELLED"] as const;
export type RebateActivationStatus = (typeof rebateActivationStatuses)[number];

export const rebateStatusLabels: Record<RebateActivationStatus, string> = {
  PENDING: "待人工設定",
  NEEDS_INFORMATION: "需要補件",
  NOT_FOUND: "找不到 UID／無法歸戶",
  COMPLETED: "已開通",
  CANCELLED: "已取消",
};

export const statusTransitions: Record<RebateActivationStatus, readonly RebateActivationStatus[]> = {
  PENDING: ["COMPLETED", "NEEDS_INFORMATION", "NOT_FOUND", "CANCELLED"],
  NEEDS_INFORMATION: ["PENDING", "CANCELLED"],
  NOT_FOUND: ["PENDING", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const REBATE_CONSENT_VERSION = "2026-08-01-mvp";
export const STANDARD_REBATE_RATE = 20;
const requiredProductionSettings = ["DATABASE_URL", "EMAIL_PROVIDER_API_KEY", "AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "ADMIN_EMAIL_ALLOWLIST", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"] as const;

export function rebateActivationReadiness() {
  const requested = process.env.REBATE_ACTIVATION_ENABLED === "true";
  const missing = requiredProductionSettings.filter((key) => !process.env[key]);
  return { enabled: requested && (process.env.NODE_ENV !== "production" || missing.length === 0), requested, missing } as const;
}
