import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata = createPageMetadata({ title: "個人資料蒐集告知", description: "提交 BiBeck 高交易量申請前應閱讀的個人資料蒐集與使用說明。", path: "/personal-data-notice" });
export default function PersonalDataNoticePage() { return <LegalPage eyebrow="申請前告知" title="個人資料蒐集告知" description="提交高交易量申請前，請確認你瞭解資料的蒐集目的、類型、使用方式與可提出的權利。" sections={[
  { heading: "蒐集目的與資料類型", paragraphs: ["資料用於確認身分與聯絡方式、評估交易量和返傭方案、查核附件一致性、回覆申請及防止濫用。蒐集項目包含聯絡資料、交易所與 UID、交易量、VIP 等級、申請說明和你主動上傳的附件。"] },
  { heading: "使用方式與對象", paragraphs: ["資料由 BiBeck 及提供部署、郵件或必要技術處理的服務供應商，在完成申請處理與服務安全所需範圍內使用，不會作為代客交易或資產保管用途。"] },
  { heading: "保存方式與期限", paragraphs: ["表單目前透過郵件處理流程交付，未建立可確認的私有檔案儲存與自動到期刪除機制。正式保存期限仍需營運者確認，因此請只提供審核必要資料並遮蔽餘額、姓名、電話等不必要資訊。"] },
  { heading: "使用者權利與聯絡方式", paragraphs: ["你可透過 contact@bibeck.com 要求查詢、更正、停止使用或刪除資料。若不同意必要資料的蒐集，BiBeck 將無法受理高交易量申請，但仍可使用一般公開資訊與計算工具。"] },
  { heading: "安全提醒", paragraphs: ["BiBeck 不會要求密碼、電子郵件或簡訊驗證碼、Google Authenticator 驗證碼、API Secret、私鑰或助記詞。請勿在表單或附件中提供上述資訊。"] },
]} />; }
