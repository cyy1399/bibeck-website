import type { Metadata } from "next";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { ToolCard } from "@/components/Editorial";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "工具｜Money OS、人生資本與交易成本",
  description: "使用 BiBeck 的 Money OS 藍圖、人生資本配置與交易成本工具，把抽象的金錢問題轉成可理解的資訊。",
  path: "/tools",
});

export default function ToolsPage() {
  return <SiteShell>
    <PageHero eyebrow="工具" title="把問題拆成可以理解的輸入、結果與下一步。" copy="工具不是替你做決定，而是把事實、計算結果、模型假設與個人選擇分開。" />
    <section className="px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ToolCard title="Money OS" copy="財務紀錄、分析、等級、階段與主線任務的核心產品藍圖。" href="/money-os" status="建置中"/>
        <ToolCard title="人生資本配置" copy="先整理現金流、安全、負債與風險能力，理解資金的優先順序。" href="/tools/life-allocation" status="預覽"/>
        <ToolCard title="交易成本計算器" copy="比較一般費率、Bybit VIP 與 35% 返傭後的實際成本。" href="/calculator" status="可使用"/>
      </div>
    </section>
  </SiteShell>;
}
