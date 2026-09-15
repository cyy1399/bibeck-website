import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "隱私權政策", description: "BiBeck 蒐集、處理、利用與保存網站及返傭申請資料的說明。", path: "/privacy" });

export default function PrivacyPage() {
  return <LegalPage eyebrow="法律與隱私" title="隱私權政策" description="本政策說明 BiBeck 在網站、返傭申請、客服與人工審核流程中如何處理資料。" sections={[
    { heading: "一、政策適用範圍", paragraphs: ["本政策適用於 BiBeck 官網、Bybit 返傭申請、受保護的案件管理後台、Email 通知及 LINE 客服聯絡。交易所網站與外部返傭後台有各自的隱私規則。"] },
    { heading: "二、可能蒐集的資料", paragraphs: ["BiBeck 可能蒐集名稱或稱呼、Email、Bybit UID、最近 30 日交易量區間、使用者主動填寫的補充說明，以及提交時間、來源、IP、瀏覽器或裝置資訊與必要的系統紀錄。", "BiBeck 不會透過返傭申請要求交易密碼、2FA 驗證碼、API Key、API Secret、私鑰、助記詞、身分證影本、KYC 文件、資產餘額或不必要的完整交易紀錄。"] },
    { heading: "三、資料使用目的", paragraphs: [], items: ["受理返傭申請及核對推薦關係與帳戶資格", "進行人工審核、返傭開通、案件狀態管理與 Email 通知", "提供客服、處理爭議及回應高交易量或商務需求", "防止重複提交、濫用與維護網站及服務安全"] },
    { heading: "四、資料分享原則", paragraphs: ["BiBeck 僅在提供服務所必要的範圍內，與受託服務商或依法有權要求的主管機關、司法機關分享資料。我們不會以『永不分享』作不符合實際服務流程的保證。"] },
    { heading: "五、第三方服務與跨境處理", paragraphs: ["目前網站使用 Vercel 提供網站託管與伺服器運行、PostgreSQL 提供案件資料儲存、Resend 相容 Email API 提供交易型郵件、Cloudflare Turnstile 提供反濫用驗證，並使用 Bybit 與外部返傭後台完成帳戶關係核對及服務。資料可能在上述服務提供者營運或處理服務所必要的地區進行處理。"] },
    { heading: "六、資料保存", paragraphs: ["資料會依返傭服務目的、法令義務、爭議處理、安全稽核及合理營運需要保存；目的消失且無其他保存必要後，BiBeck 會依合理程序刪除或去識別化。BiBeck 不會宣稱永久保存。"] },
    { heading: "七、資訊安全", paragraphs: ["BiBeck 目前使用 HTTPS 傳輸、伺服器端驗證、管理員登入與 allowlist 權限控管、環境變數管理密鑰、速率限制、honeypot 與 Turnstile。任何系統皆無法保證絕對安全；BiBeck 會依風險採取合理保護措施。"] },
    { heading: "八、你的權利", paragraphs: ["依實際適用法律，你可請求查詢或閱覽資料、製給複製本、補充或更正、停止蒐集、停止處理或利用，以及刪除。為避免他人冒用，BiBeck 可能先要求合理資訊確認申請人身分。"] },
    { heading: "九、政策更新", paragraphs: ["BiBeck 可能因服務、法令或供應商變動更新本政策。重大調整會在網站以適當方式說明，並以頁面所示日期為準。"] },
  ]}/>;
}
