import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata=createPageMetadata({title:"個人資料蒐集告知",description:"提交 BiBeck 返傭申請前應閱讀的個人資料蒐集與使用說明。",path:"/personal-data-notice"});
export default function PersonalDataNoticePage(){return <LegalPage eyebrow="申請前告知" title="個人資料蒐集告知" description="本頁為一般資訊，正式法律適用仍應依實際營運地區與專業法律意見調整。" sections={[
{heading:"蒐集者、目的與資料類別",paragraphs:["蒐集者為 BiBeck。蒐集目的包括帳戶核對、返傭申請與設定、通知、客服及服務安全；資料類別可能包含名稱或稱呼、Bybit UID、Email、申請級距、交易量或帳戶條件及提交紀錄。"]},
{heading:"期間、地區、對象與方式",paragraphs:["資料於完成申請、客服、爭議處理及必要法令遵循期間使用，可能在 BiBeck 與 Google Forms、Google Sheets、Email 服務及外部返傭後台服務所涵蓋地區，由 BiBeck 及必要服務供應商以電子方式處理。"]},
{heading:"不提供資料的影響",paragraphs:["若不提供核對帳戶及返傭申請所需資料，BiBeck 可能無法受理或完成返傭設定；你仍可使用公開資訊與交易成本計算器。"]},
{heading:"你的權利",paragraphs:["你可透過 contact@bibeck.com 請求查詢、閱覽、複製、更正、停止蒐集或使用，以及刪除資料。BiBeck 可能要求合理資訊確認申請人身分。"]},
]}/>;}
