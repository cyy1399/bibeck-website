import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "隱私權政策", description: "瞭解 BiBeck 如何蒐集、使用與保護網站訪客及申請者提供的資料。", path: "/privacy" });

export default function PrivacyPage() { return <LegalPage eyebrow="法律與隱私" title="隱私權政策" description="本政策說明 BiBeck 在提供網站、計算工具、聯絡與申請服務時，如何處理你主動提供或系統必要產生的資訊。" sections={[
  { heading: "我們可能蒐集的資料", paragraphs: ["一般瀏覽與計算器不要求建立 BiBeck 帳戶。當你主動聯絡、提交返傭啟用或高交易量申請時，我們才會處理表單中提供的資料。"], items: ["姓名或稱呼、聯絡 Email 與 LINE／Telegram", "交易所名稱、Bybit UID、註冊日期、帳號情境與 KYC 狀態", "預審案件編號、案件狀態、公開訊息與操作稽核紀錄", "交易量、VIP 等級及你選擇上傳的高交易量證明附件", "為防止濫用所需的提交時間、瀏覽器資訊與網路來源資訊"] },
  { heading: "使用目的", paragraphs: ["資料僅用於核對推薦及歸戶關係、人工設定返傭比例、案件通知、補件聯絡、客服與爭議處理、操作稽核、審核合作資格及維護服務安全。這不是投資、資產管理、代客操作或金融顧問服務。BiBeck 不會要求密碼、驗證碼、API Secret、私鑰或助記詞。"] },
  { heading: "保存與第三方處理", paragraphs: ["資料可能由網站部署、電子郵件與必要的技術服務供應商協助處理。BiBeck 不會將敏感附件放在公開網址。正式保存期限及刪除作業仍需營運者確認；在確認前，我們不宣稱具備自動到期刪除或特定私有儲存機制。"] },
  { heading: "你的選擇與權利", paragraphs: ["你可以要求查詢、更正或刪除你主動提供的資料，也可以撤回後續聯絡同意。提出要求時，我們可能需要合理資訊確認申請人身分，以避免資料遭他人取得或刪除。"] },
]} />; }
