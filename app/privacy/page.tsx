import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata = createPageMetadata({title:"隱私權政策",description:"BiBeck 蒐集、使用與保存返傭申請資料的說明。",path:"/privacy"});
export default function PrivacyPage(){return <LegalPage eyebrow="法律與隱私" title="隱私權政策" description="更新日期：2026 年 8 月 6 日。以下說明 BiBeck 如何處理返傭申請與聯絡資料。" sections={[
{heading:"蒐集資料",paragraphs:["返傭申請可能蒐集名稱或稱呼、Bybit UID、Email、申請級距、交易量或帳戶條件資料，以及完成服務所需的提交紀錄。BiBeck 不會要求密碼、驗證碼、API Secret、私鑰或助記詞。"]},
{heading:"使用目的",paragraphs:["資料用於核對帳戶與推薦關係、處理返傭設定、提供登入資訊與申請結果、補件聯絡、客服、爭議處理及服務安全。"]},
{heading:"保存與第三方服務",paragraphs:["申請資料目前可能透過 Google Forms 蒐集、由 Google Sheets 保存，並透過 Email 服務與外部返傭後台完成必要處理。資料會依實際營運需要與適用規範保存；BiBeck 不宣稱具備尚未建立的自動刪除或同步功能。"]},
{heading:"你的權利與聯絡",paragraphs:["你可以透過 contact@bibeck.com 要求查詢、更正、停止使用或刪除主動提供的資料。為防止他人冒用，BiBeck 可能要求合理資訊確認身分。"]},
]}/>;}
