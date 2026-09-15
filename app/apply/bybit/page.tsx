import type { Metadata } from "next";
import { BybitApplicationForm } from "@/components/BybitApplicationForm";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata } from "@/config/seo";
import { brandConfig } from "@/config/brand";

export const metadata: Metadata = createPageMetadata({ title: "申請 Bybit 35% 返傭", description: "在 BiBeck 官網提交 Bybit UID 與基本資料，申請符合資格帳戶的 35% 標準返傭。", path: "/apply/bybit" });

export default function ApplyBybitPage() {
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "首頁", item: brandConfig.websiteUrl }, { "@type": "ListItem", position: 2, name: "申請 Bybit 35% 返傭", item: `${brandConfig.websiteUrl}/apply/bybit` }] };
  return <SiteShell><PageHero eyebrow="Bybit 35% 返傭" title="申請 BiBeck 35% 返傭" copy="請確認你使用的是符合 BiBeck 推薦關係的 Bybit 帳戶，再提交以下資料。BiBeck 不會要求你的交易密碼、驗證碼、API Key 或資產轉移。"/><section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-3xl"><BybitApplicationForm/></div></section><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }}/></SiteShell>;
}
