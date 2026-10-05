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
          <p className="eyebrow">BiBeck Money OS</p>
          <h1 className="mt-7 text-balance text-5xl font-semibold leading-[1.04] text-white sm:text-7xl lg:text-[5.2rem]">把金錢變成一套<br/>可以持續升級的系統。</h1>
          <p className="mt-7 max-w-2xl text-lg leading-9 text-secondary">從每天的財務紀錄開始，理解現金流、資產、負債與風險，找出現在最重要的下一步。</p>
          <p className="mt-2 max-w-2xl text-base leading-8 text-white/68">真實財務變強，等級就升；狀況變差，也會如實反映。BiBeck 不用假的遊戲數字取代現實。</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/money-os" className="cta-button button-primary">了解 Money OS</Link><Link href="/tools" className="cta-button button-secondary">使用現有工具</Link></div>
        </div>
      </div>
    </section>

    <section className="section-muted border-y border-white/10 px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="核心循環" title="記錄、理解、行動、升級。" copy="Money OS 把生活裡真正發生的財務事件，轉成分析、等級與下一步任務。月份只是分析區間，不是升級週期。"/><JourneyFlow steps={["財務紀錄", "財務分析", "財務評級", "主線任務"]}/></div>
    </section>

    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionHeader eyebrow="Money OS" title="你現在在哪裡？下一步最該做什麼？" copy="新使用者不是從 LV.1 開始，而是先完成最小財務掃描，依當下真實狀態建立起始等級。之後等級會隨財務狀況即時升降。"/>
        <div className="allocation-preview"><div><span>01</span><p>每天用最少步驟記錄收入、支出、轉帳、投資與還款</p></div><div><span>02</span><p>持續計算現金流、安全、負債、收入韌性、成長與自由度</p></div><div><span>03</span><p>辨識現在最大的財務瓶頸，只保留一個最高優先主線任務</p></div><div><span>04</span><p>真實狀態跨過門檻時，立即升級、降級或突破新的財務階段</p></div><p className="mt-6 text-xs leading-6 text-white/42">Money OS 正在建置中；目前已公開核心產品規則與設計方向。</p><Link href="/money-os" className="button-primary mt-7">查看完整 Money OS 藍圖</Link></div>
      </div>
    </section>

    <section className="section-muted border-y border-white/10 px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="知識" title="先建立理解，再使用工具與採取行動。" copy="投資、加密資產與交易都只是整體金錢系統的一部分。每個主題都從定義、風險、數據與常見誤解開始。"/>
        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          <KnowledgeCard title="在追求報酬以前，先理解你承擔了什麼。" copy="風險、報酬、複利、分散、時間跨度、人生資本，以及負債與投資的先後關係。" href="/learn/investing"/>
          <KnowledgeCard title="加密資產是資產世界的一部分，不是整個世界。" copy="從 Bitcoin、Ethereum、穩定幣，到保管、槓桿與平台風險。" href="/learn/crypto"/>
          <KnowledgeCard title="交易者到底要看什麼？" copy="理解市場與執行數據，包括資金費率、未平倉量、價差、滑價與 Maker/Taker。" href="/learn/trading"/>
        </div>
        <Link href="/learn" className="button-secondary mt-8">瀏覽知識地圖</Link>
      </div>
    </section>

    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeader eyebrow="交易成本" title="如果你已經決定交易，至少知道自己真正付了多少。" copy="Maker/Taker 手續費、資金費率、價差、滑價、VIP、交易頻率與返傭，都會改變實際結果。"/>
        <ToolCard title="交易成本計算器" copy="比較一般費率、Bybit VIP 與 BiBeck 返傭後的 30 日及年度交易成本。" href="/calculator" status="可使用"/>
      </div>
    </section>

    <CTASection eyebrow="Bybit 成本優化" title="把本來就要付的成本，拿回一部分。" copy="BiBeck 目前提供 Bybit 標準 35% 返傭。高交易量、VIP 或特殊需求可依實際條件另外評估；不要為了返傭增加交易量。"><Link href="/bybit" className="cta-button button-primary">了解 Bybit 返傭</Link><Link href="/calculator" className="cta-button button-secondary">計算交易成本</Link></CTASection>

    <section className="px-5 py-14 sm:px-8 lg:py-16"><div className="mx-auto max-w-4xl border-l border-gold/55 pl-6 sm:pl-10"><p className="eyebrow">建立者理念</p><blockquote className="mt-5 text-balance text-xl leading-9 text-white sm:text-2xl">「我沒有所有答案。但我相信，金錢世界裡很多看似複雜的問題，都可以被拆解、計算與理解。」</blockquote><p className="mt-5 text-sm leading-7 text-secondary">創辦人的經驗是 BiBeck 的精神來源；產品本身仍以可查證、可理解、可持續使用的系統為核心。</p><Link href="/philosophy" className="text-link mt-5">了解建立初衷 <span aria-hidden="true">→</span></Link></div></section>
  </SiteShell>;
}
