import type { RebateActivationCase } from "../db/schema.ts";
import { emailLayout, sendTransactionalEmail } from "./email-provider.ts";
import { maskUid } from "./rebate-activation.ts";
import { formatBibeckRebateRate } from "./bibeck-rebate.ts";

const safety = "BiBeck 不會要求您的交易所密碼、驗證碼、API Secret、私鑰或助記詞。";
const support = process.env.SUPPORT_EMAIL || "support@bibeck.com";
const lineUrl = process.env.NEXT_PUBLIC_LINE_OFFICIAL_URL || "https://lin.ee/6y7TnUP";
const dashboardUrl = () => process.env.BYBIT_REBATE_BACKOFFICE_URL || "https://bybackoffice.com/user-login";
const standardRate = formatBibeckRebateRate();

export async function sendActivationReceipt(caseData: RebateActivationCase) {
  await sendTransactionalEmail({
    to: caseData.contactEmail,
    subject: "BiBeck｜已收到你的返傭申請",
    idempotencyKey: `activation-receipt-${caseData.id}`,
    html: emailLayout("已收到你的返傭申請", [
      `您好，${caseData.displayName}：我們已收到你的 BiBeck Bybit 返傭申請。`,
      "BiBeck 將核對帳戶推薦關係與返傭資格，審核結果將寄送至此 Email。此收件通知不代表返傭已完成開通。",
      `如有問題，可透過 LINE 官方帳號聯絡：${lineUrl}`,
      safety,
    ], [["案件編號", caseData.caseNumber], ["名稱", caseData.displayName], ["Bybit UID", maskUid(caseData.uid)], ["最近 30 日交易量", caseData.volumeRange], ["提交時間", caseData.createdAt.toISOString()]]),
  });
}

export async function sendAdminNewRequest(caseData: RebateActivationCase) {
  const to = process.env.REBATE_APPLICATION_NOTIFICATION_EMAIL || process.env.REBATE_ADMIN_EMAIL || support;
  await sendTransactionalEmail({ to, replyTo: caseData.contactEmail, subject: "[BiBeck] New rebate application", idempotencyKey: `activation-admin-${caseData.id}`, html: emailLayout("New rebate application", [caseData.applicantMessage ? `申請人補充：${caseData.applicantMessage}` : "申請人未提供補充說明。", "請登入 BiBeck 管理後台進行人工審核。"], [["Application ID", caseData.id], ["Submitted at", caseData.createdAt.toISOString()], ["Name", caseData.displayName], ["Email", caseData.contactEmail], ["Bybit UID", caseData.uid], ["Volume range", caseData.volumeRange], ["Status", caseData.status]]) });
}

export async function sendCompletionEmail(caseData: RebateActivationCase, retry = false) {
  await sendTransactionalEmail({
    to: caseData.contactEmail,
    subject: "BiBeck｜返傭已完成開通",
    idempotencyKey: `activation-completed-${caseData.id}${retry ? `-retry-${caseData.updatedAt.getTime()}` : ""}`,
    html: emailLayout("您的 Bybit 返傭已完成設定", [
      `您好，${caseData.displayName}：BiBeck 已完成返傭設定。`,
      "實際生效時間、資料同步、返傭顯示及過往交易手續費是否追溯，仍以返傭後台及適用規則為準。",
      safety,
      `如有問題，請聯絡 ${support}。`,
    ], [["案件編號", caseData.caseNumber], ["Bybit UID", maskUid(caseData.uid)], ["標準返傭比例", standardRate], ["設定完成時間", (caseData.completedAt || caseData.updatedAt).toISOString()]], { label: "登入 Bybit 返傭後台", href: dashboardUrl() }),
  });
}

export async function sendStatusEmail(caseData: RebateActivationCase, status: "APPROVED" | "REJECTED") {
  const approved = status === "APPROVED";
  const title = approved ? "返傭申請審核通過" : "返傭申請結果通知";
  const subject = approved ? "BiBeck｜返傭申請審核通過" : "BiBeck｜返傭申請結果通知";
  const defaultMessage = approved ? "你的返傭申請已通過人工審核；BiBeck 將進行後續開通作業，完成後會另行寄送通知。" : "本次申請目前未能通過審核。如需了解可重新提交的資料，請透過 LINE 或客服 Email 聯絡 BiBeck。";
  await sendTransactionalEmail({ to: caseData.contactEmail, subject, idempotencyKey: `activation-status-${caseData.id}-${status}-${caseData.updatedAt.getTime()}`, html: emailLayout(title, [caseData.publicMessage || defaultMessage, safety, `LINE：${lineUrl}`, `客服：${support}`], [["案件編號", caseData.caseNumber], ["Bybit UID", maskUid(caseData.uid)], ["狀態", approved ? "審核通過" : "未通過"]]) });
}
