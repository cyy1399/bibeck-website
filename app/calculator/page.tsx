import type { Metadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { BybitCostCalculator } from "@/components/BybitCostCalculator";
import { SectionTitle } from "@/components/Sections";
import { LocalizedPageHero } from "@/components/TranslatedText";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { BYBIT_REGISTER } from "@/config/links";
import { bybitActionLabels } from "@/config/actions";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "交易成本計算器",
  description: "使用 BiBeck 交易成本計算器，比較交易所費率、VIP 等級與返傭後的實際交易成本。",
  path: "/calculator",
});

export default function CalculatorPage() {
  return (
    <SiteShell>
      <LocalizedPageHero eyebrow="calculator.title" title="calculator.heading" description="calculator.description" />
      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl"><BybitCostCalculator /></div>
      </section>
      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionTitle label="降低實際成本" title="看見數字後，下一步是建立符合資格的返傭關係。" copy="計算器不會改變費率；返傭服務的目的，是在合作規則允許的範圍內降低部分實際交易成本。" />
          <ExternalLink href={BYBIT_REGISTER} sponsored>{bybitActionLabels.rebateSignup}</ExternalLink>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice /></div></section>
    </SiteShell>
  );
}
