import type { Metadata } from "next";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { ToolCard } from "@/components/Editorial";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata=createPageMetadata({title:"工具｜理解金錢與交易成本",description:"使用 BiBeck 的人生資本配置預覽與交易成本計算器，把抽象問題轉成可理解的決策資訊。",path:"/tools"});
export default function ToolsPage(){return <SiteShell><PageHero eyebrow="TOOLS" title="把問題拆成可以理解的輸入與結果。" copy="工具不是替你做決定，而是把 Facts、Calculated Results、Model Assumptions 與 Personal Choices 分開。"/><section className="px-5 py-20 sm:px-8"><div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2"><ToolCard title="人生資本配置" copy="先整理現金流、安全、負債與風險能力。Phase 1 提供框架與輸入預覽。" href="/tools/life-allocation" status="預覽"/><ToolCard title="交易成本計算器" copy="比較一般費率、Bybit VIP 與 35% 返傭後的實際成本。" href="/calculator" status="可使用"/></div></section></SiteShell>}
