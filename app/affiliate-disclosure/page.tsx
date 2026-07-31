import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata = createPageMetadata({ title: "合作連結與佣金揭露", description: "BiBeck 合作連結、推薦關係與可能取得佣金的透明揭露。", path: "/affiliate-disclosure" });
export default function AffiliateDisclosurePage() { return <LegalPage eyebrow="透明揭露" title="合作連結與佣金揭露" description="部分外部連結可能是合作或推薦連結。這項關係不會改變 BiBeck 必須清楚揭露服務身分與資料來源的責任。" sections={[
  { heading: "可能取得的收入", paragraphs: ["當使用者透過指定連結註冊或進行符合條件的交易時，BiBeck 可能從合作交易所或合作夥伴取得佣金或分潤，並依核准方案提供部分返傭。"] },
  { heading: "不代表官方背書", paragraphs: ["合作、推薦或佣金關係不代表 BiBeck 是交易所官方網站、關係企業、員工或代表。交易所名稱與商標屬各自權利人所有。"] },
  { heading: "外部網站", paragraphs: ["點擊外部連結前，網站會顯示目的服務與網域。使用者應自行確認網址與第三方條款。bybackoffice.com 的官方性仍需由營運者向 Bybit 聯絡窗口確認。"] },
]} />; }
