import type { Metadata } from "next";
import { PageHero } from "@/components/Sections";
import { SectionHeader } from "@/components/Editorial";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "關於 BiBeck｜把金錢變成可以持續升級的系統",
  description: "BiBeck 從真實生活中的財務紀錄出發，以 Money OS 將金錢分析、等級、任務與知識工具整合成可持續使用的系統。",
  path: "/philosophy",
});

export default function PhilosophyPage() {
  return <SiteShell>
    <PageHero eyebrow="關於 BiBeck" title="理解金錢，建立系統，持續升級。" copy="BiBeck 的長期核心是 Money OS：把日常財務紀錄轉成分析、評級與下一步行動；投資、加密資產、交易成本與返傭則是整體金錢系統中的模組。" />
    <section className="px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeader eyebrow="建立初衷" title="創辦人的經驗是起點，不是所有答案的來源。" />
        <div className="article-prose">
          <p>我沒有所有答案。但我相信，金錢世界裡很多看似複雜的問題，都可以被拆解、計算與理解。</p>
          <p>我建立 BiBeck，是因為我自己也正在經歷相同的過程：工作、記錄自己的錢、累積資產、建立事業、學習投資，也會犯錯。</p>
          <p>我希望 Money OS 不只是告訴一個人「你現在怎麼樣」，而是把真實生活中的財務紀錄變成可理解的狀態，並回答「你現在最該做什麼」。</p>
          <p>因此 BiBeck 不以金融老師或 Guru 的姿態提供答案，也不提供喊單、明牌、買賣建議、報酬保證或行情方向預測。產品應該讓使用者自己看懂現況、理解風險，並持續改善。</p>
        </div>
      </div>
    </section>
  </SiteShell>;
}
