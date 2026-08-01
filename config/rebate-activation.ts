export const rebateActivationStatuses = ["SUBMITTED", "UID_PENDING", "PENDING_MANUAL_SETUP", "NEEDS_INFORMATION", "NOT_ATTRIBUTED", "COMPLETED", "CANCELLED"] as const;
export type RebateActivationStatus = (typeof rebateActivationStatuses)[number];
export const rebateStatusLabels: Record<RebateActivationStatus, string> = { SUBMITTED: "已送出", UID_PENDING: "待確認 UID", PENDING_MANUAL_SETUP: "待人工設定", NEEDS_INFORMATION: "需要補件", NOT_ATTRIBUTED: "無法歸戶", COMPLETED: "已完成", CANCELLED: "已取消" };
export const statusTransitions: Record<RebateActivationStatus, readonly RebateActivationStatus[]> = {
  SUBMITTED: ["UID_PENDING", "NEEDS_INFORMATION", "NOT_ATTRIBUTED", "CANCELLED"], UID_PENDING: ["PENDING_MANUAL_SETUP", "NEEDS_INFORMATION", "NOT_ATTRIBUTED", "CANCELLED"], PENDING_MANUAL_SETUP: ["COMPLETED", "NEEDS_INFORMATION", "NOT_ATTRIBUTED", "CANCELLED"], NEEDS_INFORMATION: ["UID_PENDING", "PENDING_MANUAL_SETUP", "NOT_ATTRIBUTED", "CANCELLED"], NOT_ATTRIBUTED: [], COMPLETED: [], CANCELLED: [],
};
export const accountScenarios = [["new", "新使用者，透過 BiBeck 連結首次註冊"], ["existing-new-account", "既有 Bybit 使用者，透過指定連結建立新帳號"], ["kyc-transfer", "正在進行 KYC 身分轉移"], ["other", "其他"]] as const;
export const kycStatuses = [["not-started", "尚未開始"], ["in-progress", "進行中"], ["completed", "已完成"], ["transfer", "身分轉移中"], ["unknown", "不確定"]] as const;
export const REBATE_CONSENT_VERSION = "2026-08-01";
const requiredProductionSettings = ["DATABASE_URL", "EMAIL_PROVIDER_API_KEY", "AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "ADMIN_EMAIL_ALLOWLIST", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"] as const;
export function rebateActivationReadiness() { const requested = process.env.REBATE_ACTIVATION_ENABLED === "true"; const missing = requiredProductionSettings.filter((key) => !process.env[key]); return { enabled: requested && (process.env.NODE_ENV !== "production" || missing.length === 0), requested, missing } as const; }
