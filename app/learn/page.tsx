import type { Metadata } from "next";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TopicGrid } from "@/components/Editorial";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "學習｜Money、Investing、Crypto 與 Trading", description: "從金錢系統、投資原則、Crypto 風險到交易數據，建立能持續使用的理解框架。", path: "/learn" });
const topics = [
  { title: "Money", copy: "現金流、財務安全、人生資本、資產與負債。", href: "/learn/money" },
  { title: "Investing", copy: "風險、報酬、時間、分散與資產配置。", href: "/learn/investing" },
  { title: "Crypto", copy: "理解資產、平台、保管、槓桿與市場結構。", href: "/learn/crypto" },
  { title: "Trading", copy: "總體、市場與執行數據，及其常見誤解。", href: "/learn/trading" },
] as const;
export default function LearnPage(){return <SiteShell><PageHero eyebrow="KNOWLEDGE" title="把複雜拆開，從真正重要的問題開始。" copy="BiBeck 不提供明牌或方向預測；我們整理定義、數據、風險與判讀框架，幫助你做自己的選擇。"/><section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><TopicGrid topics={topics}/></div></section></SiteShell>}
