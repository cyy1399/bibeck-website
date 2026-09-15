import type { Metadata } from "next";
import Link from "next/link";
import { FAQList, homeFaqs } from "@/components/FAQList";
import { BybitCostCalculator } from "@/components/BybitCostCalculator";
import { SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { createPageMetadata, siteDescription, siteTitle } from "@/config/seo";
import { HIGH_VOLUME_MAILTO, REBATE_APPLICATION_URL } from "@/config/links";
import { TranslatedText } from "@/components/TranslatedText";
import { BIBECK_BASE_UPSTREAM_COMMISSION_RATE, calculateRebateFromEligibleFee, formatBibeckRebateRate } from "@/lib/bibeck-rebate";

export const metadata: Metadata = createPageMetadata({ title: siteTitle, description: siteDescription, path: "/", absoluteTitle: true });

const rebateExamples = [100, 1_000, 10_000].map((fee) => ({ fee, rebate: calculateRebateFromEligibleFee(fee) }));
const formatUsdt = (value: number) => `${value.toLocaleString("en-US")} USDT`;
const upstreamPercent = BIBECK_BASE_UPSTREAM_COMMISSION_RATE * 100;

export default function Home() {
  return (
    <SiteShell>
      <section className="home-hero relative px-5 pb-20 pt-36 sm:px-8 lg:pb-24 lg:pt-44">
        <div className="mx-auto grid min-h-[62vh] max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10 max-w-4xl">
            <p className="reveal eyebrow">交易成本最佳化平台</p>
            <h1 className="reveal mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.06] text-white sm:text-7xl lg:text-[4.7rem]">把你付出去的交易手續費，拿回來。</h1>
            <p className="reveal mt-7 max-w-2xl text-lg leading-9 text-secondary">產生 1,000 USDT 符合資格的 Bybit 交易手續費，BiBeck 標準 {formatBibeckRebateRate()} 返傭就是 {formatUsdt(calculateRebateFromEligibleFee(1_000))}。</p>
            <p className="reveal mt-4 max-w-2xl text-base leading-8 text-white/70">先算清楚你真正付了多少，再決定你願意付多少交易成本。</p>
            <div className="reveal mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"><Link href="/calculator" className="cta-button button-primary">算算我能拿回多少</Link><Link href={REBATE_APPLICATION_URL} className="cta-button button-secondary">申請 {formatBibeckRebateRate()} 返傭</Link></div>
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

      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="收入透明" title="BiBeck 怎麼賺錢？" copy="BiBeck 不靠喊單、帶單或投資建議向交易者收費。以下是目前基礎合作條件的分配示例。"/><div className="mt-10 grid gap-px bg-white/10 md:grid-cols-3"><article className="bg-[#111] p-7"><p className="text-sm text-secondary">代理端返傭分潤</p><strong className="mt-3 block font-mono text-4xl">{upstreamPercent}%</strong></article><article className="bg-[#14130e] p-7"><p className="text-sm text-secondary">返還交易者</p><strong className="mt-3 block font-mono text-4xl text-gold">35%</strong></article><article className="bg-[#111] p-7"><p className="text-sm text-secondary">BiBeck 服務與營運收入</p><strong className="mt-3 block font-mono text-4xl">5%</strong></article></div><p className="mt-7 max-w-3xl text-sm leading-7 text-secondary">以目前基礎方案計算，BiBeck 將代理端取得返傭的 <strong className="text-gold">87.5%</strong> 返還給實際產生符合資格交易手續費的客戶。高交易量與特殊合作條件依個別方案確認。</p></div></section>

      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="數字可核對" title="不用相信我們，直接核對數字。" copy="BiBeck 希望建立的不是『相信代理』，而是『每個數字都能被驗證』。"/><div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">{[["費率有來源","Bybit 費率、VIP 與相關資料提供官方來源或可核對依據。"],["返傭有紀錄","開通後可透過返傭後台核對相關返傭紀錄。"],["不碰你的資產","BiBeck 不要求 Bybit 密碼、驗證碼，也不保管資產。"],["收入公開","BiBeck 清楚揭露返傭如何分配，以及平台如何取得營運收入。"]].map(([title,copy])=><article key={title} className="bg-[#111] p-6"><h3 className="font-semibold text-white">{title}</h3><p className="mt-4 text-sm leading-7 text-secondary">{copy}</p></article>)}</div></div></section>

      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="高交易量與商務合作" title="交易規模與合作需求不同，下一步也不同。" copy="BiBeck 35% 標準返傭是正式標準產品；高交易量與商務合作則依真實交易結構及合作需求個別評估。"/><div className="mt-10 grid gap-6 lg:grid-cols-2"><article className="border border-gold/40 bg-gold/[0.04] p-6 sm:p-8"><p className="eyebrow">高交易量 / 專業交易</p><h3 className="mt-4 text-2xl font-semibold">交易量越高，越值得重新檢視你的交易成本。</h3><p className="mt-4 text-sm leading-7 text-secondary">若你有較高交易量、Quant、Bot、做市或其他專業交易需求，可透過 LINE 進行合作條件評估。實際條件由 BiBeck 個別確認。</p><a href={HIGH_VOLUME_MAILTO} target="_blank" rel="noopener noreferrer" className="cta-button button-secondary mt-6">LINE 洽談高交易量方案</a></article><article className="border border-white/12 bg-[#111] p-6 sm:p-8"><p className="eyebrow">商務合作</p><h3 className="mt-4 text-2xl font-semibold">有交易者受眾、社群或產品？</h3><p className="mt-4 text-sm leading-7 text-secondary">KOL、內容創作者、交易社群、量化團隊與交易工具可洽談追蹤、聯名內容、活動及專屬合作頁面等客製合作。</p><Link href="/partners" className="button-secondary mt-6">查看合作方案</Link></article></div></div></section>

      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="開始申請" title="三步完成 Bybit 35% 返傭申請。"/><ol className="mt-10 grid gap-px bg-white/10 md:grid-cols-3">{[["01","建立符合 BiBeck 推薦關係的 Bybit 帳戶"],["02","在 BiBeck 官網提交 UID 與基本資料"],["03","完成開通後，使用符合資格帳戶交易並取得返傭"]].map(([number,title])=><li key={number} className="bg-[#111] p-7"><span className="font-mono text-gold">{number}</span><h3 className="mt-5 text-xl font-semibold leading-8">{title}</h3></li>)}</ol><Link href={REBATE_APPLICATION_URL} className="cta-button button-primary mt-8">申請 35% 返傭</Link></div></section>

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
