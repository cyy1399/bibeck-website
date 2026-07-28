import type { Metadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { FeeCalculator } from "@/components/FeeCalculator";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { BYBIT_REGISTER } from "@/config/links";

export const metadata: Metadata = {
  title: "交易手續費與返傭計算器",
  description: "估算 Maker、Taker、Funding 成本、每月交易費、返傭金額與年度可能節省費用。",
  alternates: { canonical: "/calculator" },
};

export default function CalculatorPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="交易成本計算器" title="看見交易量背後的真實成本" copy="用同一個工具估算 Maker 與 Taker 手續費、資金費用、返傭金額與年度節省。輸入你實際適用的費率，結果才有參考價值。" />
      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl"><FeeCalculator /></div>
      </section>
      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionTitle label="降低實際成本" title="看見數字後，下一步是建立符合資格的返傭關係。" copy="計算器不會改變費率；返傭服務的目的，是在合作規則允許的範圍內降低部分實際交易成本。" />
          <ExternalLink href={BYBIT_REGISTER}>取得返傭</ExternalLink>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice /></div></section>
    </SiteShell>
  );
}
