import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata = createPageMetadata({ title: "使用條款", description: "BiBeck 網站、計算工具與返傭資訊服務的使用條款。", path: "/terms" });
export default function TermsPage() { return <LegalPage eyebrow="法律與隱私" title="使用條款" description="使用 BiBeck 前，請先瞭解網站資訊、計算結果、第三方連結與返傭服務的適用界線。" sections={[
  { heading: "服務性質", paragraphs: ["BiBeck 是獨立第三方交易成本與返傭資訊平台，不是交易所、券商、投資顧問或資產保管機構。BiBeck 不代替使用者交易、入金、出金或保管資產。"] },
  { heading: "資訊與計算結果", paragraphs: ["費率、VIP 條件、返傭比例及計算結果僅供估算與比較。交易所可能隨時調整規則，實際資料應以交易所帳戶與官方公告為準。網站不保證計算結果適合任何特定投資決策。"] },
  { heading: "使用者責任", paragraphs: ["使用者應自行確認交易風險、第三方網址、帳戶資格與所在地適用規則，不得利用網站從事詐騙、洗量、自成交、規避身分驗證或其他違反交易所規則的活動。"] },
  { heading: "服務調整", paragraphs: ["BiBeck 可能因資料更新、安全、技術或合作條件調整網站內容與功能。若重要條款變更，將更新本頁日期。"] },
  { heading: "返傭啟用案件", paragraphs: ["提交 UID 只代表提出人工處理申請，不代表返傭已生效。BiBeck 需另行確認推薦關係並完成外部後台設定；實際生效時間、同步、資格及過往手續費是否追溯，仍以 Bybit 規則與系統紀錄為準。"] },
]} />; }
