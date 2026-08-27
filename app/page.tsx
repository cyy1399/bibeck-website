import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { FAQList, homeFaqs } from "@/components/FAQList";
import { BybitCostCalculator } from "@/components/BybitCostCalculator";
import { SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { createPageMetadata, siteDescription, siteTitle } from "@/config/seo";
import { REBATE_APPLICATION_URL } from "@/config/links";
import { TranslatedText } from "@/components/TranslatedText";
import { calculateRebateFromEligibleFee, formatBibeckRebateRate } from "@/lib/bibeck-rebate";

export const metadata: Metadata = createPageMetadata({ title: siteTitle, description: siteDescription, path: "/", absoluteTitle: true });

const helpItems = [
  ["01", "了解交易成本", "了解 Maker、Taker、資金費用、滑價、提幣費與 VIP 費率如何形成總交易成本。"],
  ["02", "降低手續費支出", "透過符合資格的返傭安排，降低實際支付的交易手續費。"],
  ["03", "追蹤節省金額", "使用計算工具估算節省金額，並從返傭後台查看可用紀錄。"],
];

const audiences = [["高頻合約交易者","頻繁進出場，交易手續費容易累積。"],["Bot / 量化交易者","策略 Edge 可能受到交易費與滑價影響。"],["高交易量交易者","即使費率很低，絕對交易成本仍可能非常高。"],["社群／交易團隊","有大量交易者，可洽談 Partner 合作。"]] as const;
const rebateExamples = [100, 1_000, 10_000].map((fee) => ({ fee, rebate: calculateRebateFromEligibleFee(fee) }));
const optimizationSteps = [["Calculate", "計算交易成本"], ["Compare", "比較 VIP、Maker / Taker 與成本結構"], ["Reduce", "透過返傭降低有效交易成本"], ["Optimize", "持續最佳化交易成本"]] as const;
const formatUsdt = (value: number) => `${value.toLocaleString("en-US")} USDT`;

export default function Home() {
  return (
    <SiteShell>
      <section className="home-hero relative px-5 pb-20 pt-36 sm:px-8 lg:pb-24 lg:pt-44">
        <div className="mx-auto grid min-h-[62vh] max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10 max-w-4xl">
            <p className="reveal eyebrow">交易成本最佳化平台</p>
            <h1 className="reveal mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.06] text-white sm:text-7xl lg:text-[4.7rem]">把你付出去的手續費，拿回 <span className="text-gold">{formatBibeckRebateRate()}</span>。</h1>
            <p className="reveal mt-7 max-w-2xl text-lg leading-9 text-secondary">產生 1,000 USDT 符合資格的 Bybit 交易手續費，BiBeck 標準 {formatBibeckRebateRate()} 返傭就是 {formatUsdt(calculateRebateFromEligibleFee(1_000))}。</p>
            <p className="reveal mt-4 max-w-2xl text-base leading-8 text-white/70">你的交易量，應該為你降低成本，而不只是替別人創造佣金。先算清楚你的交易成本，再決定你願意付多少。</p>
            <div className="reveal mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"><Link href="/calculator" className="cta-button button-primary">算算我能拿回多少</Link><ExternalLink href={REBATE_APPLICATION_URL} sponsored variant="secondary">取得 {formatBibeckRebateRate()} 返傭帳戶</ExternalLink></div>
            <p className="reveal mt-6 max-w-2xl text-xs leading-6 text-white/38">
              <TranslatedText message="home.disclosure" />
            </p>
            <ul className="reveal mt-7 grid max-w-3xl gap-2 text-xs text-white/58 sm:grid-cols-2" aria-label="BiBeck 信任標記">
              {["不保管使用者資產", "不要求密碼或驗證碼", "費率來源可查證", "使用計算工具不另收費"].map((item) => <li key={item} className="border-l border-gold/55 py-1 pl-3">{item}</li>)}
            </ul>
          </div>
          <div className="relative z-10 border border-gold/35 bg-[#14130e] p-6 sm:p-8" aria-label="BiBeck 標準返傭計算示例"><p className="eyebrow">符合資格手續費</p><div className="mt-6 grid items-center gap-5 text-center sm:grid-cols-[1fr_auto_1fr_auto_1fr] lg:grid-cols-1"><div><strong className="font-mono text-3xl">1,000</strong><span className="mt-1 block text-xs text-white/48">USDT 交易手續費</span></div><span className="text-gold" aria-hidden="true">×</span><div><strong className="font-mono text-5xl text-gold">{formatBibeckRebateRate()}</strong><span className="mt-1 block text-xs text-white/48">BiBeck 標準返傭</span></div><span className="text-gold" aria-hidden="true">＝</span><div><strong className="font-mono text-3xl text-gold">{calculateRebateFromEligibleFee(1_000)}</strong><span className="mt-1 block text-xs text-white/48">USDT 返傭金額</span></div></div><p className="mt-6 text-xs leading-6 text-white/44">實際返傭依帳戶資格、有效交易手續費與系統紀錄為準。</p></div>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="Fee to Rebate" title="你的手續費，可以拿回多少？" copy={`以下以 BiBeck 標準 ${formatBibeckRebateRate()} 返傭試算；返傭基礎是符合資格的實際交易手續費，不是交易量。`}/><div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-3">{rebateExamples.map(({fee,rebate})=><article key={fee} className="bg-[#111] p-6"><p className="font-mono text-xl">{formatUsdt(fee)} 手續費</p><p className="my-4 text-gold" aria-hidden="true">↓</p><p className="font-mono text-3xl font-semibold text-gold">{formatUsdt(rebate)}</p><p className="mt-2 text-xs text-white/48">標準返傭試算</p></article>)}</div><p className="mt-6 text-xs leading-6 text-white/44">實際返傭依帳戶資格、有效交易手續費與系統紀錄為準。</p><Link href="/calculator" className="button-secondary mt-7">輸入我的交易量試算</Link></div></section>

      <section className="scroll-mt-24 border-y border-white/10 px-5 py-20 sm:px-8" id="trading-cost-calculator">
        <div className="mx-auto max-w-7xl">
          <LocalizedHomeCalculatorTitle />
          <div className="mt-10"><BybitCostCalculator compact /></div>
          <p className="mt-6 border-l border-gold/55 pl-4 text-sm leading-7 text-secondary">交易頻率與交易量越高，手續費對長期績效的影響越明顯。</p>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="交易成本，不只是費率" title="手續費不是小數點，是實際的交易成本。" copy="0.055% 看起來很小，但交易量放大後，就是實際的 USDT 支出。BiBeck 把費率轉換成你付了多少、可返多少，以及最後留下多少成本。"/><div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-3">{[10_000_000,50_000_000,100_000_000].map((volume)=><article key={volume} className="bg-[#111] p-6"><p className="text-xs text-white/48">30 日交易量</p><strong className="mt-2 block font-mono text-xl">{formatUsdt(volume)}</strong><p className="mt-5 text-xs text-white/48">以 0.055% 示意手續費</p><strong className="mt-2 block font-mono text-2xl text-gold">{formatUsdt(volume * 0.00055)}</strong></article>)}</div><Link href="/calculator" className="button-secondary mt-7">不要猜，直接算</Link></div></section>

      <section className="px-5 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="適合哪些交易者" title="交易越頻繁，越需要看清真實成本。"/><div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">{audiences.map(([title,copy])=><article key={title} className="bg-[#111] p-6"><h3 className="font-semibold">{title}</h3><p className="mt-4 text-sm leading-7 text-secondary">{copy}</p></article>)}</div><Link href="/calculator" className="button-secondary mt-8">計算我的交易成本</Link></div></section>

      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="High Volume & Partner" title="交易規模與合作需求不同，下一步也不同。" copy="BiBeck Standard 35% 是正式標準產品；高交易量與商務合作則依真實交易結構及合作需求個別評估。"/><div className="mt-10 grid gap-6 lg:grid-cols-2"><article className="border border-gold/40 bg-gold/[0.04] p-6 sm:p-8"><p className="eyebrow">高交易量 / 專業交易</p><h3 className="mt-4 text-2xl font-semibold">交易量越高，越值得重新檢視你的交易成本。</h3><p className="mt-4 text-sm leading-7 text-secondary">若你有較高交易量、Quant、Bot、做市或其他專業交易需求，可申請高交易量合作條件評估。實際條件由 BiBeck 個別確認。</p><Link href="/partners#high-volume" className="button-secondary mt-6">洽談高交易量方案</Link></article><article className="border border-white/12 bg-[#111] p-6 sm:p-8"><p className="eyebrow">Business Partnership</p><h3 className="mt-4 text-2xl font-semibold">有交易者受眾、社群或產品？</h3><p className="mt-4 text-sm leading-7 text-secondary">KOL、Creator、交易社群、量化團隊與交易工具可洽談追蹤、內容、Campaign、Landing Page 與其他客製合作。</p><Link href="/partners" className="button-secondary mt-6">查看合作方案</Link></article></div></div></section>

      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="Trading Cost Optimization" title="降低每一筆交易成本。" copy="BiBeck 不只顯示一個返傭比例，而是把 Fee、VIP、Rebate 與有效交易成本整理成可以比較的數字。"/><ol className="mt-10 grid gap-px bg-white/10 md:grid-cols-4">{optimizationSteps.map(([english,chinese],index)=><li key={english} className="bg-[#111] p-6"><span className="font-mono text-xs text-gold">0{index+1}</span><h3 className="mt-4 text-xl font-semibold">{english}</h3><p className="mt-3 text-sm leading-7 text-secondary">{chinese}</p></li>)}</ol></div></section>

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle label="BiBeck 如何協助" title="先看懂成本，再開始降低成本。" />
          <div className="mt-14 grid border-y border-white/10 md:grid-cols-3">
            {helpItems.map(([number, title, copy]) => (
              <article key={number} className="reveal border-b border-white/10 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
                <p className="font-mono text-sm text-gold">{number}</p>
                <h3 className="mt-8 text-2xl font-semibold text-white">{title}</h3>
                <p className="mt-4 text-base leading-8 text-secondary">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionTitle label="常見問題" title="先把重要問題說清楚。" copy="透明的身分、資格與風險界線，是返傭服務建立信任的第一步。" />
          <div>
            <FAQList items={homeFaqs} />
            <Link href="/faq" className="text-link mt-8">查看所有問題 <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice /></div></section>
    </SiteShell>
  );
}

function LocalizedHomeCalculatorTitle() {
  return <div className="max-w-3xl"><p className="reveal eyebrow"><TranslatedText message="calculator.title" /></p><h2 className="reveal mt-5 text-balance text-3xl font-semibold leading-tight text-white sm:text-5xl"><TranslatedText message="calculator.heading" /></h2><p className="reveal mt-5 text-lg leading-8 text-secondary"><TranslatedText message="calculator.description" /></p></div>;
}
