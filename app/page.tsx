import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata, siteTitle } from "@/config/seo";
import { notes, noteHref } from "@/config/notes";

export const metadata: Metadata = createPageMetadata({ title: siteTitle, description: "Beck 的理財、投資與實踐筆記。理解金錢，逐步掌握自己的生活。", path: "/", absoluteTitle: true });

export default function Home() {
  const featured = notes[0];
  return <SiteShell>
    <section className="px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-44" aria-labelledby="home-title">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow">理財・投資・實踐筆記</p>
          <h1 id="home-title" className="mt-6 text-balance text-4xl font-semibold leading-[1.35] tracking-tight text-white sm:text-5xl lg:text-6xl">理解金錢，<br />逐步掌握<br className="hidden lg:block" />自己的生活。</h1>
          <p className="mt-7 max-w-md text-base leading-8 text-secondary">一個上班族與創業者的理財、投資與實踐筆記。<br />把複雜的問題拆開，找到下一步能做的事。</p>
          <Link href="/money" className="focus-ring mt-8 inline-flex items-center gap-4 border-b border-gold/50 pb-2 text-sm text-gold hover:text-white">從理財開始 <span aria-hidden="true">↗</span></Link>
        </div>
        <Link href={noteHref(featured)} className="focus-ring group block border border-white/12 bg-[#111110] p-7 transition-colors hover:border-gold/50 sm:p-10">
          <div className="flex items-center justify-between text-xs tracking-widest text-gold"><span>精選文章</span><span aria-hidden="true">01 / NOTE</span></div>
          <div className="mb-8 mt-10 h-px w-12 bg-gold/60" />
          <h2 className="text-balance text-2xl font-medium leading-[1.6] text-white transition-colors group-hover:text-gold sm:text-3xl">{featured.title}</h2>
          <p className="mt-5 text-sm leading-8 text-secondary">{featured.summary}</p>
          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/50"><span>{featured.category} · 約 {featured.minutes} 分鐘</span><span className="text-gold">閱讀文章 <span aria-hidden="true">↗</span></span></div>
        </Link>
      </div>
    </section>
    <section className="border-t border-white/10 px-5 py-14 sm:px-8 sm:py-20" aria-labelledby="recent-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4"><h2 id="recent-title" className="text-2xl font-medium text-white">最近整理</h2><span className="text-xs text-white/40">持續學習，持續修正。</span></div>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {notes.slice(1).map((note) => <article key={note.slug} className="border-t border-white/15 pt-6"><Link href={noteHref(note)} className="focus-ring group block"><p className="text-xs tracking-widest text-gold">{note.category}</p><h3 className="mt-4 text-xl font-medium leading-8 text-white group-hover:text-gold">{note.title}</h3><p className="mt-3 text-sm leading-7 text-secondary">{note.summary}</p><p className="mt-6 text-xs text-white/45">更新 <time dateTime={note.date}>{note.date.replaceAll("-", ".")}</time> · 約 {note.minutes} 分鐘</p></Link></article>)}
        </div>
      </div>
    </section>
    <section className="border-t border-white/10 px-5 py-14 sm:px-8 sm:py-20" aria-labelledby="author-title">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_2fr]">
        <h2 id="author-title" className="text-2xl font-medium text-white">我是 Beck。</h2>
        <div className="max-w-2xl"><p className="text-base leading-8 text-secondary">我持續學習、研究，也嘗試建立自己的事業。這裡留下我的資料整理、實際經驗與思考修正，希望讓知識成為生活裡能用上的力量。</p><Link href="/about" className="focus-ring mt-5 inline-block text-sm text-gold hover:text-white">關於 Beck <span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>
  </SiteShell>;
}
