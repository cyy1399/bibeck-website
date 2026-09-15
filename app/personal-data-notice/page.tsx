import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "個人資料蒐集告知", description: "提交 BiBeck Bybit 返傭申請前應閱讀的個人資料蒐集、處理與利用說明。", path: "/personal-data-notice" });

export default function PersonalDataNoticePage() {
  return <LegalPage eyebrow="申請前告知" title="個人資料蒐集告知" description="這份告知專門適用於 BiBeck Bybit 返傭申請，請在提交資料前閱讀。" sections={[
    { heading: "一、蒐集者", paragraphs: ["BiBeck。"] },
    { heading: "二、蒐集目的", paragraphs: [], items: ["Bybit 返傭申請", "推薦關係與帳戶資格核對", "返傭開通與後續服務", "客戶聯絡與 Email 通知", "爭議處理、防止濫用與安全管理"] },
    { heading: "三、蒐集資料類別", paragraphs: [], items: ["名稱或稱呼", "Email", "Bybit UID", "最近 30 日交易量區間", "補充說明中由使用者主動提供的資訊", "提交時間、來源與防止濫用所需的技術紀錄"] },
    { heading: "四、利用期間", paragraphs: ["在上述目的存在期間、法令要求期間，以及爭議處理、安全稽核與合理營運保存期間內利用。"] },
    { heading: "五、利用地區", paragraphs: ["在 BiBeck 實際營運地區，以及網站託管、資料庫、Email、反濫用與返傭服務供應商提供服務所必要的地區利用。"] },
    { heading: "六、利用對象", paragraphs: [], items: ["BiBeck", "為提供服務所必要的受託服務商", "依法有權要求的主管機關或司法機關"] },
    { heading: "七、利用方式", paragraphs: [], items: ["返傭申請人工審核與案件管理", "UID、推薦關係與資格核對", "Email 收件、審核結果及開通通知", "客戶服務、爭議處理與內部營運紀錄"] },
    { heading: "八、當事人權利", paragraphs: ["依適用法律，你可請求查詢或閱覽、製給複製本、補充或更正、停止蒐集、停止處理或利用，以及刪除。BiBeck 可能先合理確認申請人身分。"] },
    { heading: "九、不提供資料的影響", paragraphs: ["若不提供名稱、Email、Bybit UID、交易量區間或必要同意，BiBeck 可能無法受理返傭申請、核對帳戶或提供後續服務；你仍可使用網站公開資訊與交易成本計算器。"] },
    { heading: "十、安全提醒", paragraphs: ["請勿在補充說明中提供密碼、驗證碼、API Key、API Secret、私鑰、助記詞、身分證件、KYC 文件、資產資訊或不必要的完整交易紀錄。"] },
  ]}/>;
}
