import { applicantTypes, applicationUploadPolicy, bybitVipOptions, productOptions, requestedRebateOptions } from "../config/high-volume-application.ts";

export type HighVolumeApplicationData = {
  name: string; email: string; contactHandle: string; exchangeId: string; currentUid: string;
  applicantType: string; volume30d: number; volume90dAverage: number; expectedMonthlyVolume: number | null;
  product: string; makerTakerRatio: string; frequency: string; vipLevel: string;
  otherRebate: string; requestedRebate: string; notes: string; legalConsent: boolean; dataConsent: boolean; privacyConfirmed: boolean;
};

export type ValidatedAttachment = { filename: string; mimeType: string; size: number; bytes: Uint8Array };
export type ValidationResult = { ok: true; data: HighVolumeApplicationData; attachments: ValidatedAttachment[] } | { ok: false; error: string };

const MAX_SAFE = Number.MAX_SAFE_INTEGER;
const allowedVip = new Set<string>(bybitVipOptions.map((option) => option.value));
const allowedRebates = new Set<string>(requestedRebateOptions.map((option) => option.value));
const allowedApplicants = new Set<string>(applicantTypes);
const allowedProducts = new Set<string>(productOptions);

function textValue(form: FormData, key: string): string { const value = form.get(key); return typeof value === "string" ? value.trim() : ""; }
function requiredNumber(form: FormData, key: string): number | null {
  const raw = textValue(form, key);
  if (!/^\d+(?:\.\d+)?$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= MAX_SAFE ? value : null;
}
function optionalNumber(form: FormData, key: string): number | null | "invalid" {
  if (!textValue(form, key)) return null;
  return requiredNumber(form, key) ?? "invalid";
}

export function sanitizeFilename(filename: string): string {
  const cleaned = filename.normalize("NFKC").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").replace(/\s+/g, " ").trim();
  return (cleaned || "attachment").slice(0, 120);
}

function signatureMatches(type: string, bytes: Uint8Array): boolean {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (type === "application/pdf") return String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  return false;
}

export async function validateAttachments(files: File[]): Promise<ValidatedAttachment[] | string> {
  if (files.length === 0) return "請至少上傳 1 份交易量證明。";
  if (files.length > applicationUploadPolicy.maxFiles) return "最多只能上傳 5 個檔案。";
  if (files.some((file) => file.size > applicationUploadPolicy.maxFileSizeBytes)) return "單一檔案不可超過 8 MB。";
  if (files.reduce((sum, file) => sum + file.size, 0) > applicationUploadPolicy.maxTotalSizeBytes) return "所有附件合計不可超過 20 MB。";
  const validated: ValidatedAttachment[] = [];
  for (const file of files) {
    if (!(applicationUploadPolicy.acceptedMimeTypes as readonly string[]).includes(file.type)) return "此檔案格式不支援。";
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!signatureMatches(file.type, bytes)) return "檔案內容與格式不符。";
    validated.push({ filename: sanitizeFilename(file.name), mimeType: file.type, size: file.size, bytes });
  }
  return validated;
}

export async function validateHighVolumeApplication(form: FormData): Promise<ValidationResult> {
  if (textValue(form, "website")) return { ok: false, error: "申請未能送出。" };
  const name = textValue(form, "name"); const email = textValue(form, "email");
  const exchangeId = textValue(form, "exchangeId"); const applicantType = textValue(form, "applicantType");
  const product = textValue(form, "product"); const vipLevel = textValue(form, "vipLevel");
  const requestedRebate = textValue(form, "requestedRebate");
  if (!name || name.length > 80) return { ok: false, error: "請填寫姓名或稱呼。" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { ok: false, error: "請填寫有效的聯絡 Email。" };
  if (exchangeId !== "bybit") return { ok: false, error: "目前僅開放 Bybit 高交易量申請。" };
  if (!allowedApplicants.has(applicantType) || !allowedProducts.has(product) || !allowedVip.has(vipLevel) || !allowedRebates.has(requestedRebate)) return { ok: false, error: "請完成所有必填選項。" };
  const volume30d = requiredNumber(form, "volume30d"); const volume90dAverage = requiredNumber(form, "volume90dAverage");
  const expectedMonthlyVolume = optionalNumber(form, "expectedMonthlyVolume");
  if (volume30d === null || volume90dAverage === null || expectedMonthlyVolume === "invalid") return { ok: false, error: "交易量必須為有效且不含逗號的非負數字。" };
  if (textValue(form, "legalConsent") !== "true" || textValue(form, "dataConsent") !== "true" || textValue(form, "privacyConfirmed") !== "true") return { ok: false, error: "請閱讀並勾選三項送出前聲明。" };
  const fileValues = form.getAll("attachments").filter((value): value is File => typeof File !== "undefined" && value instanceof File && value.size > 0);
  const attachments = await validateAttachments(fileValues);
  if (typeof attachments === "string") return { ok: false, error: attachments };
  return { ok: true, data: {
    name, email, exchangeId, applicantType, product, vipLevel, requestedRebate, volume30d, volume90dAverage,
    expectedMonthlyVolume, contactHandle: textValue(form, "contactHandle"), currentUid: textValue(form, "currentUid"),
    makerTakerRatio: textValue(form, "makerTakerRatio"), frequency: textValue(form, "frequency"),
    otherRebate: textValue(form, "otherRebate"), notes: textValue(form, "notes"), legalConsent: true, dataConsent: true, privacyConfirmed: true,
  }, attachments };
}
