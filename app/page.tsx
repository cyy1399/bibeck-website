import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, JourneyFlow, KnowledgeCard, SectionHeader, ToolCard } from "@/components/Editorial";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata, siteDescription, siteTitle } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: siteTitle, description: siteDescription, path: "/", absoluteTitle: true });

export default function Home() {
  return <SiteShell>
    <section className="home-hero relative px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-36 lg:pb-20 lg:pt-32">
      <div className="mx-auto flex min-h-[62vh] max-w-7xl items-center lg:min-h-[48vh]">
        <div className="relative z-10 max-w-4xl">
          <p className="eyebrow">MONEY · INVESTING · CRYPTO</p>
          <h1 className="mt-7 text-balance text-5xl font-semibold leading-[1.04] text-white sm:text-7xl lg:text-[5.2rem]">理解你的錢，<br/>再決定它要去哪裡。</h1>
          <p className="mt-7 max-w-2xl text-lg leading-9 text-secondary">從現金流、人生資本與資產配置，到投資、Crypto、交易與真實交易成本。</p>
          <p className="mt-2 max-w-2xl text-base leading-8 text-white/68">BiBeck 把複雜的金錢問題拆開，做成真正能理解與使用的知識與工具。</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/learn" className="cta-button button-primary">開始了解</Link><Link href="/tools" className="cta-button button-secondary">探索工具</Link></div>
        </div>
      </div>
    </section>

    <section className="section-muted border-y border-white/10 px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="MONEY IS A SYSTEM" title="金錢不是一個數字，而是一連串選擇。" copy="從收入與生活安全開始，逐步理解投資、Crypto、交易與成本在整體金錢系統中的位置。"/><JourneyFlow steps={["收入", "生活安全", "資產配置", "投資", "Crypto", "交易", "成本", "累積"]}/></div>
    </section>

    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionHeader eyebrow="TOOLS · LIFE ALLOCATION" title="你的下一筆錢，應該去哪裡？" copy="先整理收入、支出、資產、負債與人生狀態，再理解每一塊錢目前最重要的任務。這是 BiBeck 將知識轉成決策工具的第一步。"/>
        <div className="allocation-preview"><div><span>01</span><p>輸入可確認的財務事實</p></div><div><span>02</span><p>計算安全、流動性與負債狀態</p></div><div><span>03</span><p>辨識當下的財務優先順序</p></div><div><span>04</span><p>建立可解釋的配置框架</p></div><p className="mt-6 text-xs leading-6 text-white/42">預覽版只呈現分析框架，不提供個人化投資建議或假精準配置。</p><Link href="/tools/life-allocation" className="button-primary mt-7">查看 Life Allocation</Link></div>
      </div>
    </section>

    <section className="section-muted border-y border-white/10 px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="KNOWLEDGE" title="先建立理解，再選擇工具與行動。" copy="Crypto 與交易不是獨立世界，而是投資與整體金錢系統中的一部分。每個主題都從定義、風險、數據與常見誤解開始。"/>
        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          <KnowledgeCard title="在追求報酬以前，先理解你承擔了什麼。" copy="風險、報酬、複利、分散、時間跨度、人生資本，以及負債與投資的先後關係。" href="/learn/investing"/>
          <KnowledgeCard title="Crypto 是資產世界的一部分，不是整個世界。" copy="從 Bitcoin、Ethereum、Stablecoins，到保管、槓桿與平台風險。" href="/learn/crypto"/>
          <KnowledgeCard title="交易者到底要看什麼？" copy="理解總體、市場與執行數據，包括 Funding、Open Interest、Spread、Slippage 與 Maker/Taker。" href="/learn/trading"/>
        </div>
        <Link href="/learn" className="button-secondary mt-8">瀏覽知識地圖</Link>
      </div>
    </section>

    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeader eyebrow="TRADING COST" title="如果你已經決定交易，至少知道自己真正付了多少。" copy="Maker/Taker Fee、Funding、Spread、Slippage、VIP、交易頻率與返傭，都會改變實際結果。"/>
        <ToolCard title="交易成本計算器" copy="比較一般費率、Bybit VIP 與 BiBeck 返傭後的 30 日及年度交易成本。" href="/calculator" status="可使用"/>
      </div>
    </section>

    <CTASection eyebrow="BYBIT COST OPTIMIZATION" title="把本來就要付的成本，拿回一部分。" copy="BiBeck 目前提供 Bybit 標準 35% 返傭。高交易量、VIP 或特殊需求可依實際條件另外評估；不要為了返傭增加交易量。"><Link href="/bybit" className="cta-button button-primary">了解 Bybit 返傭</Link><Link href="/calculator" className="cta-button button-secondary">計算交易成本</Link></CTASection>

    <section className="px-5 py-14 sm:px-8 lg:py-16"><div className="mx-auto max-w-4xl border-l border-gold/55 pl-6 sm:pl-10"><p className="eyebrow">BUILDER · LEARNER · OPERATOR</p><blockquote className="mt-5 text-balance text-xl leading-9 text-white sm:text-2xl">「我沒有所有答案。但我相信，金錢世界裡很多看似複雜的問題，都可以被拆解、計算與理解。」</blockquote><p className="mt-5 text-sm leading-7 text-secondary">Founder CYY 的經驗是 BiBeck 的精神來源；網站的主體仍是能被查證、理解與使用的知識與工具。</p><Link href="/philosophy" className="text-link mt-5">了解建立初衷 <span aria-hidden="true">→</span></Link></div></section>
  </SiteShell>;
}
