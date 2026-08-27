import type { Metadata } from "next";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { brandConfig } from "@/config/brand";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "BiBeck 合作夥伴｜交易社群、量化與平台合作",
  description: "與 BiBeck 洽談交易社群、KOL、量化工具、交易團隊與平台合作，共同建立透明的交易成本最佳化服務。",
  path: "/partners",
});

const partnerTypes = [
  ["交易社群與 KOL", "以清楚的費率、返傭資格與風險揭露服務交易者。"],
  ["量化與交易工具", "把交易成本、VIP 與返傭數據整合進策略評估流程。"],
  ["團隊與代理合作", "依可驗證的交易活動與合作條件進行個別評估。"],
] as const;

export default function PartnersPage() {
  const contact = brandConfig.publicEmails.contact;
  return <SiteShell>
    <PageHero eyebrow="Partner" title="一起把交易成本算得更清楚。" copy="BiBeck 歡迎交易社群、KOL、量化工具、交易團隊與平台洽談合作。合作內容採個別評估，不保證固定返傭比例或資格。" actions={<a className="cta-button button-primary" href={`mailto:${contact}?subject=${encodeURIComponent("BiBeck 合作洽談")}`}>洽談合作</a>} />
    <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="Partnership" title="適合哪些合作模式？" copy="合作的核心是讓費率、資格、返傭與實際交易成本更透明，而不是承諾投資報酬。"/><div className="mt-10 grid gap-px bg-white/10 md:grid-cols-3">{partnerTypes.map(([title,copy])=><article key={title} className="bg-[#111] p-6"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-4 text-sm leading-7 text-secondary">{copy}</p></article>)}</div><p className="mt-8 break-words text-sm text-secondary">合作聯絡：<a className="text-link" href={`mailto:${contact}`}>{contact}</a></p></div></section>
    <section className="px-5 pb-20 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice/></div></section>
  </SiteShell>;
}
