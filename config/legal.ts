import { brandConfig } from "./brand.ts";

export const legalConfig = {
  operatorDisplayName: brandConfig.name,
  websiteUrl: brandConfig.websiteUrl,
  privacyContact: brandConfig.publicEmails.contact,
  supportContact: brandConfig.publicEmails.support,
  policyEffectiveDate: "2026-07-31",
  confirmedCompanyRegistration: null,
  confirmedRegistrationNumber: null,
  confirmedOfficeAddress: null,
  highVolumeRetentionPeriod: null,
  privateFileStorageProvider: null,
  rebateActivationRetentionPeriod: null,
} as const;

export const legalOperationalQuestions = [
  "高交易量申請資料與附件的正式保存期限",
  "附件寄送後的刪除流程與可稽核紀錄",
  "實際處理申請資料的郵件或儲存服務供應商",
  "bybackoffice.com 與 Bybit 的官方關係及授權範圍",
  "返傭啟用案件、UID 與 audit log 的正式保存期限",
] as const;
