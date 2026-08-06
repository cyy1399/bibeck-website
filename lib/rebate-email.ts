import type { RebateActivationCase } from "../db/schema.ts";
import { emailLayout, sendTransactionalEmail } from "./email-provider.ts";
import { maskUid } from "./rebate-activation.ts";

const safety = "BiBeck 不會要求您的交易所密碼、驗證碼、API Secret、私鑰或助記詞。";
const support = process.env.SUPPORT_EMAIL || "support@bibeck.com";
const dashboardUrl = () => process.env.BYBIT_REBATE_BACKOFFICE_URL || "https://bybackoffice.com/user-login";

export async function sendActivationReceipt(caseData: RebateActivationCase) {
  await sendTransactionalEmail({
    to: caseData.contactEmail,
    subject: `[BiBeck] 已收到您的 Bybit 返傭開通申請｜${caseData.caseNumber}`,
    idempotencyKey: `activation-receipt-${caseData.id}`,
    html: emailLayout("已收到您的 Bybit 返傭開通申請", [
      `您好，${caseData.displayName}：BiBeck 已收到您的申請，將核對 UID 並在返傭後台完成設定。`,
      "此 Email 只代表 BiBeck 已收到申請，不代表返傭已完成設定或已開始生效。設定完成後，我們會再次寄送通知。",
      safety,
      `如有問題，請聯絡 ${support}。`,
    ], [["案件編號", caseData.caseNumber], ["Bybit UID", maskUid(caseData.uid)], ["申請時間", caseData.createdAt.toISOString()], ["目前狀態", "待設定"], ["預設返傭比例", "20%"]]),
  });
}

export async function sendAdminNewRequest(caseData: RebateActivationCase) {
  const to = process.env.REBATE_ADMIN_EMAIL;
  if (!to) throw new Error("REBATE_ADMIN_EMAIL_NOT_CONFIGURED");
  await sendTransactionalEmail({ to, replyTo: caseData.contactEmail, subject: `[BiBeck 營運] 新 Bybit 返傭開通申請｜${caseData.caseNumber}`, idempotencyKey: `activation-admin-${caseData.id}`, html: emailLayout("新 Bybit 返傭開通申請", ["請登入 BiBeck 管理後台核對 UID，並在外部返傭後台完成 20% 設定。"], [["案件編號", caseData.caseNumber], ["名稱", caseData.displayName], ["UID", caseData.uid], ["Email", caseData.contactEmail]]) });
}

export async function sendCompletionEmail(caseData: RebateActivationCase, retry = false) {
  await sendTransactionalEmail({
    to: caseData.contactEmail,
    subject: `[BiBeck] 您的 Bybit 返傭已完成設定｜${caseData.caseNumber}`,
    idempotencyKey: `activation-completed-${caseData.id}${retry ? `-retry-${caseData.updatedAt.getTime()}` : ""}`,
    html: emailLayout("您的 Bybit 返傭已完成設定", [
      `您好，${caseData.displayName}：BiBeck 已完成返傭設定。`,
      "實際生效時間、資料同步、返傭顯示及過往交易手續費是否追溯，仍以返傭後台及適用規則為準。",
      safety,
      `如有問題，請聯絡 ${support}。`,
    ], [["案件編號", caseData.caseNumber], ["Bybit UID", maskUid(caseData.uid)], ["目前返傭比例", "20%"], ["設定完成時間", (caseData.completedAt || caseData.updatedAt).toISOString()]], { label: "登入 Bybit 返傭後台", href: dashboardUrl() }),
  });
}

export async function sendStatusEmail(caseData: RebateActivationCase, status: "NEEDS_INFORMATION" | "NOT_FOUND" | "CANCELLED") {
  const title = status === "NEEDS_INFORMATION" ? "Bybit 返傭申請需要補件" : status === "NOT_FOUND" ? "目前找不到 Bybit UID" : "Bybit 返傭申請已取消";
  await sendTransactionalEmail({ to: caseData.contactEmail, subject: `[BiBeck] ${title}｜${caseData.caseNumber}`, idempotencyKey: `activation-status-${caseData.id}-${status}-${caseData.updatedAt.getTime()}`, html: emailLayout(title, [caseData.publicMessage || "如需協助，請聯絡 BiBeck 客服。", safety, `客服：${support}`], [["案件編號", caseData.caseNumber], ["Bybit UID", maskUid(caseData.uid)]]) });
}
