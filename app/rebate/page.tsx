import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { ExchangeActionButtons } from "@/components/ExchangeActionButtons";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "交易所返傭方案與運作方式",
  description: "了解 BiBeck 交易所返傭的運作方式、Bybit 返傭級距、每月審核制度與資格限制。",
  path: "/rebate",
});

const steps = [
  ["01", "透過指定連結建立帳戶", "使用支援交易所的 BiBeck 指定連結建立符合資格的返傭帳戶。"],
  ["02", "一般申請初始為 20%", "一般申請者初始適用標準交易者 20%，不因自行填寫交易量立即升級。"],
  ["03", "累積完整月份交易量", "BiBeck 依前一個完整曆月的實際交易量進行級距審核。"],
  ["04", "每月 1 日重新分級", "審核結果可能升等、降等或維持；特殊合作方案需人工評估。"],
] as const;

export default function RebatePage() {
  return (
    <SiteShell>
      <PageHero eyebrow="BiBeck 返傭" title="返傭的目的，是降低符合條件的交易成本。" copy="返傭不改變交易盈虧，也不代表投資獲利；實際資格、比例與生效方式以方案及審核結果為準。" />
      <section className="px-5 py-24 sm:px-8"><div className="mx-auto max-w-7xl">
        <SectionTitle label="運作方式" title="從建立帳戶到每月審核" copy="一般申請與高交易量快速審核採不同的初始級距流程，但後續皆依實際交易紀錄與合作條件評估。" />
        <div className="mt-12 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2">{steps.map(([number, title, copy]) => <article key={number} className="bg-[#121212] p-7"><p className="font-mono text-sm text-gold">{number}</p><h2 className="mt-5 text-xl font-semibold text-white">{title}</h2><p className="mt-3 text-sm leading-7 text-secondary">{copy}</p></article>)}</div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row"><ExchangeActionButtons exchangeSlug="bybit" calculatorHref="/calculator" /><Link href="/platform/bybit#rebate" className="cta-button button-secondary">查看 Bybit 返傭級距</Link></div>
      </div></section>
      <section className="px-5 pb-20 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice /></div></section>
    </SiteShell>
  );
}
