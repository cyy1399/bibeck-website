import Link from "next/link";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";

type ArticleSection = { title: string; content: ReactNode };
type ArticleSource = { label: string; href: string };

export function ArticleLayout({ eyebrow, title, description, updatedAt, sections, sources, related = [] }: { eyebrow: string; title: string; description: string; updatedAt: string; sections: readonly ArticleSection[]; sources: readonly ArticleSource[]; related?: readonly { label: string; href: string }[] }) {
  return <SiteShell>
    <article>
      <header className="page-hero relative border-b border-white/8 px-5 pb-16 pt-36 sm:px-8 lg:pb-20 lg:pt-44"><div className="mx-auto max-w-4xl"><p className="eyebrow">{eyebrow}</p><h1 className="mt-7 text-balance text-4xl font-semibold leading-[1.08] text-white sm:text-6xl">{title}</h1><p className="mt-7 max-w-2xl text-lg leading-9 text-secondary">{description}</p><p className="mt-8 text-xs text-white/42">最後更新：<time dateTime={updatedAt}>{updatedAt}</time></p></div></header>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="article-prose">{sections.map((section) => <section key={section.title}><h2>{section.title}</h2><div>{section.content}</div></section>)}</div>
        <aside className="h-fit border-l border-gold/45 pl-5"><p className="eyebrow">閱讀原則</p><p className="mt-4 text-sm leading-7 text-secondary">資料用來建立脈絡，不是用單一數字預測漲跌。請搭配風險、時間與其他指標判讀。</p>{related.length ? <><h2 className="mt-8 text-sm font-semibold text-white">延伸閱讀</h2><nav className="mt-3 grid gap-3" aria-label="延伸閱讀">{related.map((item) => <Link key={item.href} href={item.href} className="text-link">{item.label}</Link>)}</nav></> : null}</aside>
      </div>
      <footer className="border-t border-white/10 px-5 py-14 sm:px-8"><div className="mx-auto max-w-6xl"><h2 className="text-lg font-semibold text-white">Sources</h2><ul className="mt-4 grid gap-3 text-sm">{sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="text-link">{source.label}</a></li>)}</ul></div></footer>
    </article>
  </SiteShell>;
}
