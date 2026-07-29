import type { Metadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { BybitCostCalculator } from "@/components/BybitCostCalculator";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { BYBIT_REGISTER } from "@/config/links";
import { actionLabels } from "@/config/actions";

export const metadata: Metadata = {
  title: "交易成本計算器",
  description: "比較交易所費率、VIP 等級與 BiBeck 返傭後的實際交易成本。",
  alternates: { canonical: "/calculator" },
};

export default function CalculatorPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="交易成本計算器" title="比較真實的交易成本" copy="比較不同交易所、VIP 等級與 BiBeck 返傭後的實際交易成本。目前 Bybit 提供完整資料。" />
      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl"><BybitCostCalculator /></div>
      </section>
      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionTitle label="降低實際成本" title="看見數字後，下一步是建立符合資格的返傭關係。" copy="計算器不會改變費率；返傭服務的目的，是在合作規則允許的範圍內降低部分實際交易成本。" />
          <ExternalLink href={BYBIT_REGISTER} sponsored>{actionLabels.rebateSignup}</ExternalLink>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice /></div></section>
    </SiteShell>
  );
}
