import type { Metadata } from "next";
import Link from "next/link";
import { FAQList, homeFaqs } from "@/components/FAQList";
import { BybitCostCalculator } from "@/components/BybitCostCalculator";
import { SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { createPageMetadata, siteDescription, siteTitle } from "@/config/seo";
import { TranslatedText } from "@/components/TranslatedText";
import { BIBECK_TRADER_STATUSES } from "@/lib/bibeck-trader-status";

export const metadata: Metadata = createPageMetadata({ title: siteTitle, description: siteDescription, path: "/", absoluteTitle: true });

const helpItems = [
  ["01", "了解交易成本", "了解 Maker、Taker、資金費用、滑價、提幣費與 VIP 費率如何形成總交易成本。"],
  ["02", "降低手續費支出", "透過符合資格的返傭安排，降低實際支付的交易手續費。"],
  ["03", "追蹤節省金額", "使用計算工具估算節省金額，並從返傭後台查看可用紀錄。"],
];

const audiences = [["高頻合約交易者","頻繁進出場，交易手續費容易累積。"],["Bot / 量化交易者","策略 Edge 可能受到交易費與滑價影響。"],["高交易量交易者","即使費率很低，絕對交易成本仍可能非常高。"],["社群／交易團隊","有大量交易者，可洽談 Partner 合作。"]] as const;
const applicationSteps = [["01","建立返傭帳戶"],["02","提交資料完成開通"],["03","使用綁定帳戶交易"]] as const;

export default function Home() {
  return (
    <SiteShell>
      <section className="home-hero relative px-5 pb-20 pt-36 sm:px-8 lg:pb-24 lg:pt-44">
        <div className="mx-auto flex min-h-[62vh] max-w-7xl items-center">
          <div className="relative z-10 max-w-4xl">
            <p className="reveal eyebrow"><TranslatedText message="home.eyebrow" /></p>
            <h1 className="reveal mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.06] text-white sm:text-7xl lg:text-[5.2rem]">
              <TranslatedText message="home.title" />
            </h1>
            <p className="reveal mt-7 max-w-2xl text-lg leading-9 text-secondary">
              <TranslatedText message="home.description" />
            </p>
            <div className="reveal mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"><Link href="/calculator" className="cta-button button-primary">免費計算交易成本</Link><Link href="/rebate" className="text-link">了解 40% 返傭 <span aria-hidden="true">→</span></Link></div>
            <p className="reveal mt-6 max-w-2xl text-xs leading-6 text-white/38">
              <TranslatedText message="home.disclosure" />
            </p>
            <ul className="reveal mt-7 grid max-w-3xl gap-2 text-xs text-white/58 sm:grid-cols-2" aria-label="BiBeck 信任標記">
              {["不保管使用者資產", "不要求密碼或驗證碼", "費率來源可查證", "使用計算工具不另收費"].map((item) => <li key={item} className="border-l border-gold/55 py-1 pl-3">{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="scroll-mt-24 border-y border-white/10 px-5 py-20 sm:px-8" id="trading-cost-calculator">
        <div className="mx-auto max-w-7xl">
          <LocalizedHomeCalculatorTitle />
          <div className="mt-10"><BybitCostCalculator compact /></div>
          <p className="mt-6 border-l border-gold/55 pl-4 text-sm leading-7 text-secondary">交易頻率與交易量越高，手續費對長期績效的影響越明顯。</p>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="Bybit 返傭" title="BiBeck 標準返傭就是 40%。" copy="所有成功開通並符合返傭條件的 BiBeck Bybit 帳戶，標準返傭比例相同；Trader Status 不會改變基礎返傭比例。"/><div className="mt-10 grid gap-6 lg:grid-cols-[18rem_1fr]"><div className="border border-gold/40 bg-[#16140e] p-7"><p className="font-mono text-6xl font-semibold text-gold">40%</p><p className="mt-4 font-semibold">標準交易手續費返傭</p></div><div className="grid gap-px bg-white/10 sm:grid-cols-3">{BIBECK_TRADER_STATUSES.filter((status)=>!status.isPartner).map((status)=><article key={status.id} className="bg-[#111] p-6"><h3 className="text-xl font-semibold">{status.name}</h3><p className="mt-3 text-sm text-gold">40% 標準返傭</p><p className="mt-3 text-xs leading-6 text-secondary">{status.description}</p></article>)}</div></div><Link href="/rebate" className="text-link mt-8">了解 40% 返傭與 Trader Status <span aria-hidden="true">→</span></Link></div></section>

      <section className="px-5 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="適合哪些交易者" title="交易越頻繁，越需要看清真實成本。"/><div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">{audiences.map(([title,copy])=><article key={title} className="bg-[#111] p-6"><h3 className="font-semibold">{title}</h3><p className="mt-4 text-sm leading-7 text-secondary">{copy}</p></article>)}</div><Link href="/calculator" className="button-secondary mt-8">計算我的交易成本</Link></div></section>

      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="申請流程" title="三步完成 Bybit 返傭開通。"/><ol className="mt-10 grid gap-px bg-white/10 md:grid-cols-3">{applicationSteps.map(([number,title])=><li key={number} className="bg-[#111] p-6"><span className="font-mono text-gold">{number}</span><h3 className="mt-4 font-semibold">{title}</h3></li>)}</ol><Link href="/rebate" className="text-link mt-7">查看申請與帳戶說明 <span aria-hidden="true">→</span></Link></div></section>

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
