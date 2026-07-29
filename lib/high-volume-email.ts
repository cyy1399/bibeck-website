import { brandConfig } from "../config/brand.ts";
import { bybitVipOptions, requestedRebateOptions } from "../config/high-volume-application.ts";
import type { HighVolumeApplicationData, ValidatedAttachment } from "./high-volume-application.ts";

type EmailRequest = { applicationId: string; submittedAt: string; userAgent: string; data: HighVolumeApplicationData; attachments: ValidatedAttachment[] };
type FetchLike = typeof fetch;

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  return btoa(binary);
}

function formatVolume(value: number | null): string { return value === null ? "未填寫" : `${new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 8 }).format(value)} USDT`; }
function optionLabel(options: readonly { value: string; label: string }[], value: string): string { return options.find((option) => option.value === value)?.label ?? value; }

export async function sendHighVolumeApplicationEmail(request: EmailRequest, fetcher: FetchLike = fetch): Promise<void> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  if (!apiKey) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  const { data } = request;
  const rows = [
    ["申請編號", request.applicationId], ["提交時間", request.submittedAt], ["申請交易所", "Bybit"], ["姓名或稱呼", data.name],
    ["聯絡 Email", data.email], ["LINE／Telegram", data.contactHandle || "未填寫"], ["目前交易所 UID", data.currentUid || "未填寫"],
    ["身分類型", data.applicantType], ["最近 30 日交易量", formatVolume(data.volume30d)], ["最近 90 日平均月交易量", formatVolume(data.volume90dAverage)],
    ["預計未來每月交易量", formatVolume(data.expectedMonthlyVolume)], ["主要交易商品", data.product], ["Maker／Taker 大致比例", data.makerTakerRatio || "未填寫"],
    ["主要交易頻率", data.frequency || "未填寫"], ["目前 VIP 等級", optionLabel(bybitVipOptions, data.vipLevel)], ["目前其他返傭方案", data.otherRebate || "未填寫"],
    ["期望返傭比例", optionLabel(requestedRebateOptions, data.requestedRebate)], ["附件數量", String(request.attachments.length)], ["使用者補充說明", data.notes || "未填寫"],
    ["User-Agent", request.userAgent || "未提供"],
  ];
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.APPLICATION_EMAIL_FROM || `BiBeck Application <${brandConfig.internalEmails.primary}>`,
      to: [process.env.APPLICATION_EMAIL_TO || brandConfig.publicEmails.support], reply_to: data.email,
      subject: `[BiBeck 高交易量申請] Bybit｜${data.name}｜${formatVolume(data.volume30d)}`,
      html: `<h1>BiBeck 高交易量快速審核</h1><table>${rows.map(([label, value]) => `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}</table>`,
      attachments: request.attachments.map((attachment) => ({ filename: attachment.filename, content: bytesToBase64(attachment.bytes) })),
    }),
  });
  if (!response.ok) throw new Error(`EMAIL_PROVIDER_FAILED_${response.status}`);
}
