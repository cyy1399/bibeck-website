import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <div className="max-w-3xl">
    <p className="eyebrow">{eyebrow}</p>
    <h2 className="mt-5 text-balance text-3xl font-semibold leading-tight text-white sm:text-5xl">{title}</h2>
    {copy ? <p className="mt-5 text-base leading-8 text-secondary sm:text-lg">{copy}</p> : null}
  </div>;
}

export function KnowledgeCard({ title, copy, href }: { title: string; copy: string; href?: string }) {
  const content = <><h3 className="text-lg font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-secondary">{copy}</p>{href ? <span className="mt-6 inline-flex text-xs font-semibold text-gold">開始閱讀 <span className="ml-2" aria-hidden="true">→</span></span> : null}</>;
  return href ? <Link href={href} className="editorial-card focus-ring border border-white/10">{content}</Link> : <article className="editorial-card border border-white/10">{content}</article>;
}

export function ToolCard({ title, copy, href, status }: { title: string; copy: string; href: string; status?: string }) {
  return <Link href={href} className="editorial-card focus-ring flex min-h-56 flex-col">
    <div className="flex items-start justify-between gap-4"><h3 className="text-xl font-semibold text-white">{title}</h3>{status ? <span className="border border-white/12 px-2 py-1 text-[0.65rem] tracking-[0.12em] text-white/46">{status}</span> : null}</div>
    <p className="mt-4 text-sm leading-7 text-secondary">{copy}</p>
    <span className="mt-auto pt-8 text-xs font-semibold text-gold">探索工具 <span className="ml-2" aria-hidden="true">→</span></span>
  </Link>;
}

export function TopicGrid({ topics }: { topics: readonly { title: string; copy: string; href?: string }[] }) {
  return <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{topics.map((topic) => <KnowledgeCard key={topic.title} {...topic} />)}</div>;
}

export function JourneyFlow({ steps }: { steps: readonly string[] }) {
  return <ol className={`journey-flow mt-12 ${steps.length <= 4 ? "journey-flow-compact" : ""}`} aria-label="BiBeck 金錢理解路徑">{steps.map((step, index) => <li key={step}><span className="font-mono text-[0.68rem] text-gold">{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>)}</ol>;
}

export function CTASection({ eyebrow, title, copy, children }: { eyebrow: string; title: string; copy: string; children: ReactNode }) {
  return <section className="border-y border-white/10 bg-[#0d0d0d] px-5 py-20 sm:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end"><SectionHeader eyebrow={eyebrow} title={title} copy={copy}/><div className="flex flex-col gap-3 sm:flex-row lg:flex-col">{children}</div></div></section>;
}
