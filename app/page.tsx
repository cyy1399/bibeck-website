import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata, siteDescription, siteTitle } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: siteTitle, description: siteDescription, path: "/", absoluteTitle: true });

export default function Home() {
  return <SiteShell>
    <section aria-labelledby="philosophy-title" className="px-5 pb-20 pt-36 sm:px-8 sm:pt-44">
      <div className="mx-auto flex min-h-[calc(100svh-17rem)] max-w-7xl items-center">
        <div className="max-w-4xl border-l border-gold/40 pl-6 sm:pl-10">
          <p className="eyebrow">BiBeck 理念</p>
          <h1 id="philosophy-title" className="mt-7 text-balance text-4xl font-semibold leading-[1.3] text-white sm:text-6xl lg:text-7xl">把知識與資源，<br />轉成你能使用的力量。</h1>
          <div className="mt-9 max-w-2xl space-y-5 text-base leading-8 text-secondary sm:text-lg sm:leading-9">
            <p>BiBeck 是我持續學習與實踐的累積。我把學到的內容、走過的經驗，以及目前能提供的資源，整理在這裡。</p>
            <p>從管理自己的錢，到理解投資與風險，我希望把複雜的問題拆開，讓每個人都能看懂、判斷，找到自己下一步能做的事。</p>
            <p>我沒有所有答案。這裡會隨著學習、討論與實際使用不斷修正，讓知識成為行動，讓資源產生價值。</p>
          </div>
        </div>
      </div>
    </section>
  </SiteShell>;
}
