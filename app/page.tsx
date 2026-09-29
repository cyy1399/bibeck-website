import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, JourneyFlow, SectionHeader, TopicGrid, ToolCard } from "@/components/Editorial";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata, siteDescription, siteTitle } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: siteTitle, description: siteDescription, path: "/", absoluteTitle: true });

const investingTopics = [
  { title: "風險與報酬", copy: "先分辨可能失去什麼，再討論可能得到什麼。", href: "/learn/investing" },
  { title: "複利", copy: "時間、報酬率與持續投入如何共同改變結果。", href: "/learn/investing" },
  { title: "分散", copy: "分散不是持有很多，而是避免同一種風險支配全部結果。", href: "/learn/investing" },
  { title: "時間跨度", copy: "資金何時需要使用，會改變你能承受的波動。", href: "/learn/investing" },
  { title: "人生資本", copy: "收入能力、工作穩定度與未來選擇也是資產的一部分。", href: "/learn/money" },
  { title: "負債與投資", copy: "利率、流動性與安全邊際，通常比追逐報酬更優先。", href: "/learn/investing" },
] as const;

const cryptoTopics = ["Bitcoin", "Ethereum", "Stablecoins", "CEX", "Wallet", "Custody", "Leverage", "Funding", "Open Interest", "Liquidation"].map((title) => ({ title, copy: "建立定義、風險與使用情境的基本理解。", href: "/learn/crypto" }));
const traderTopics = [
  { title: "總體數據", copy: "CPI、PCE、NFP、JOLTS、GDP 與 Fed 的角色。" },
  { title: "市場數據", copy: "Funding Rate、Open Interest、Liquidation、Basis 與 Volume。", href: "/learn/trading/funding-rate" },
  { title: "執行品質", copy: "Spread、Slippage 與 Maker/Taker 如何形成真實成本。", href: "/learn/trading" },
] as const;

export default function Home() {
  return <SiteShell>
    <section className="home-hero relative px-5 pb-20 pt-36 sm:px-8 lg:pb-28 lg:pt-44"><div className="mx-auto flex min-h-[68vh] max-w-7xl items-center"><div className="relative z-10 max-w-4xl"><p className="eyebrow">MONEY · INVESTING · CRYPTO</p><h1 className="mt-7 text-balance text-5xl font-semibold leading-[1.04] text-white sm:text-7xl lg:text-[5.2rem]">理解你的錢，<br/>再決定它要去哪裡。</h1><p className="mt-8 max-w-2xl text-lg leading-9 text-secondary">從現金流、人生資本與資產配置，到投資、Crypto、交易與真實交易成本。</p><p className="mt-3 max-w-2xl text-base leading-8 text-white/68">BiBeck 把複雜的金錢問題拆開，做成真正能理解與使用的知識與工具。</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/learn" className="cta-button button-primary">開始了解</Link><Link href="/tools" className="cta-button button-secondary">探索工具</Link></div></div></div></section>
    <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="MONEY IS A SYSTEM" title="金錢不是一個數字，而是一連串選擇。" copy="你賺多少、留下多少、承擔多少風險、投入多少到未來，以及為交易付出多少成本，都會改變最後的結果。"/><JourneyFlow steps={["收入", "生活安全", "資產配置", "投資", "Crypto", "交易", "成本", "累積"]}/></div></section>
    <section className="px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><SectionHeader eyebrow="LIFE ALLOCATION" title="你的下一筆錢，應該去哪裡？" copy="輸入收入、必要支出、資產、負債與人生狀態，先理解每一塊錢目前最重要的任務。"/><div className="allocation-preview"><div><span>01</span><p>先建立生活安全與流動性</p></div><div><span>02</span><p>辨識高成本負債與必要責任</p></div><div><span>03</span><p>再討論長期配置與個人選擇</p></div><p className="mt-6 text-xs leading-6 text-white/42">預覽版只呈現分析框架，不提供個人化投資建議或假精準配置。</p><Link href="/tools/life-allocation" className="button-secondary mt-7">建立我的配置</Link></div></div></section>
    <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="INVESTING" title="在追求報酬以前，先理解你承擔了什麼。"/><TopicGrid topics={investingTopics}/><Link href="/learn/investing" className="button-secondary mt-8">開始理解投資</Link></div></section>
    <section className="px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="CRYPTO" title="Crypto 是資產世界的一部分，不是整個世界。" copy="如果你選擇參與 Crypto，至少應該知道自己正在承擔什麼。"/><TopicGrid topics={cryptoTopics}/><Link href="/learn/crypto" className="button-secondary mt-8">了解 Crypto</Link></div></section>
    <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="TRADER DATA" title="交易者到底要看什麼？" copy="不是只告訴你一個數字，而是理解它是什麼、為什麼要看、怎麼看、什麼時候重要，以及最常見的誤解。"/><TopicGrid topics={traderTopics}/><Link href="/learn/trading" className="button-secondary mt-8">探索交易數據</Link></div></section>
    <section className="px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]"><SectionHeader eyebrow="TRADING COST" title="如果你已經決定交易，至少知道自己真正付了多少。" copy="交易成本不只有表面手續費。Maker/Taker Fee、Funding、Spread、Slippage、VIP、交易頻率與返傭，都會改變實際結果。"/><ToolCard title="交易成本計算器" copy="比較一般費率、Bybit VIP 與 BiBeck 返傭後的 30 日及年度交易成本。" href="/calculator" status="可使用"/></div></section>
    <CTASection eyebrow="BYBIT COST OPTIMIZATION" title="把本來就要付的成本，拿回一部分。" copy="BiBeck 目前提供 Bybit 標準 35% 返傭。高交易量、VIP 或特殊需求可依實際條件另外評估；不要為了返傭增加交易量。"><Link href="/bybit" className="cta-button button-primary">了解 Bybit 返傭</Link><Link href="/calculator" className="cta-button button-secondary">計算交易成本</Link></CTASection>
    <section className="px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-4xl border-l border-gold/55 pl-6 sm:pl-10"><p className="eyebrow">BUILDER · LEARNER · OPERATOR</p><blockquote className="mt-5 text-balance text-2xl leading-10 text-white sm:text-3xl">「我沒有所有答案。但我相信，金錢世界裡很多看似複雜的問題，都可以被拆解、計算與理解。」</blockquote><p className="mt-6 text-sm leading-7 text-secondary">Founder CYY 的經驗是 BiBeck 的精神來源；網站的主體仍是能被查證、理解與使用的知識與工具。</p><Link href="/philosophy" className="text-link mt-6">了解 BiBeck 的建立初衷 <span aria-hidden="true">→</span></Link></div></section>
  </SiteShell>;
}
