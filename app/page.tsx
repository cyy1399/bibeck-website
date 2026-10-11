import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata, siteTitle } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: siteTitle, description: "理解金錢，逐步掌握自己的生活。BiBeck 整理理財、投資與實踐的方法。", path: "/", absoluteTitle: true });

export default function Home() {
  return <SiteShell>
    <section className="px-5 pb-20 pt-32 sm:px-8 sm:pt-40" aria-labelledby="home-title">
      <div className="mx-auto flex min-h-[calc(100svh-16rem)] max-w-7xl items-center">
        <div className="max-w-4xl border-l border-gold/40 pl-6 sm:pl-10">
          <p className="eyebrow">BiBeck 理念</p>
          <h1 id="home-title" className="mt-6 text-balance text-4xl font-semibold leading-[1.35] tracking-tight text-white sm:text-6xl lg:text-7xl">理解金錢，<br />逐步掌握自己的生活。</h1>
          <div className="mt-8 max-w-2xl space-y-4 text-base leading-8 text-secondary sm:text-lg sm:leading-9">
            <p>BiBeck 是我持續學習與實踐的累積。我把學到的內容、思考的方法，以及目前能提供的資源，整理在這裡。</p>
            <p>從管理自己的錢，到理解投資與風險，把複雜的問題拆開，找到下一步能做的事。</p>
            <p>讓知識成為行動，讓生活多一些選擇。</p>
          </div>
          <div className="mt-9 flex flex-wrap gap-8">
            <Link href="/money" className="focus-ring inline-flex items-center gap-4 border-b border-gold/50 pb-2 text-sm text-gold hover:text-white">理財 <span aria-hidden="true">↗</span></Link>
            <Link href="/investing" className="focus-ring inline-flex items-center gap-4 border-b border-white/20 pb-2 text-sm text-white/70 hover:text-gold">投資 <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </div>
    </section>
  </SiteShell>;
}
