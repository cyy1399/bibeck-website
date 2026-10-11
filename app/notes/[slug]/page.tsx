import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { notes, noteHref } from "@/config/notes";
import { createPageMetadata } from "@/config/seo";

export const dynamicParams = false;
export function generateStaticParams() { return notes.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = notes.find((item) => item.slug === slug);
  if (!note) return {};
  return createPageMetadata({ title: note.title, description: note.summary, path: noteHref(note) });
}
export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = notes.find((item) => item.slug === slug);
  if (!note) notFound();
  const categoryHref = note.category === "理財" ? "/money" : "/investing";
  return <SiteShell><article className="px-5 pb-20 pt-32 sm:px-8 sm:pt-40"><div className="mx-auto max-w-3xl">
    <Link href={categoryHref} className="focus-ring text-sm text-gold">← {note.category}筆記</Link>
    <header className="mt-8 border-b border-white/12 pb-10"><h1 className="text-balance text-3xl font-semibold leading-[1.5] text-white sm:text-5xl">{note.title}</h1><p className="mt-6 text-lg leading-8 text-secondary">{note.summary}</p><p className="mt-6 text-xs text-white/50">Beck 整理 · 更新 <time dateTime={note.date}>{note.date}</time> · 約 {note.minutes} 分鐘</p></header>
    <div className="space-y-12 py-12">{note.sections.map((section) => <section key={section.title}><h2 className="text-2xl font-medium leading-9 text-white">{section.title}</h2><div className="mt-5 space-y-5 text-base leading-9 text-secondary">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}</div>
    <aside className="border-t border-white/12 pt-8"><h2 className="text-sm font-medium text-white">參考資料</h2><ul className="mt-4 space-y-3">{note.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-gold underline underline-offset-4">{source.label} ↗</a></li>)}</ul><p className="mt-6 text-xs leading-6 text-white/45">本文是知識整理與規劃示例，請依個人情況與實際契約核對。內容會隨資料與理解更新。</p></aside>
    <nav aria-label="延伸閱讀" className="mt-12 border-t border-white/12 pt-8"><h2 className="text-sm text-white/50">繼續閱讀</h2>{notes.filter((item) => item.slug !== slug).slice(0, 2).map((item) => <Link key={item.slug} href={noteHref(item)} className="focus-ring mt-5 block text-base leading-7 text-white hover:text-gold">{item.title} <span aria-hidden="true">↗</span></Link>)}</nav>
  </div></article></SiteShell>;
}
