import { SiteShell } from "@/components/SiteShell";
import { legalConfig } from "@/config/legal";
import { LINE_OFFICIAL_URL } from "@/config/links";

export type LegalSection = { heading: string; paragraphs: readonly string[]; items?: readonly string[] };

export function LegalPage({ eyebrow, title, description, sections }: { eyebrow: string; title: string; description: string; sections: readonly LegalSection[] }) {
  return (
    <SiteShell>
      <section className="page-hero border-b border-white/10 px-5 pb-16 pt-36 sm:px-8 lg:pt-44"><div className="mx-auto max-w-5xl"><p className="eyebrow">{eyebrow}</p><h1 className="mt-6 text-4xl font-semibold text-white sm:text-6xl">{title}</h1><p className="mt-6 max-w-3xl text-base leading-8 text-secondary">{description}</p><p className="mt-5 text-xs leading-6 text-white/42">最後更新日期：{legalConfig.policyLastUpdatedDate}<br/>生效日期：{legalConfig.policyEffectiveDate}</p></div></section>
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto grid max-w-5xl gap-12">
        {sections.map((section) => <article key={section.heading} className="border-t border-white/10 pt-8"><h2 className="text-2xl font-semibold text-white">{section.heading}</h2><div className="mt-5 grid gap-4 text-sm leading-8 text-secondary">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.items ? <ul className="grid list-disc gap-2 pl-5">{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}</div></article>)}
        <div className="border-l-2 border-gold/60 pl-4 text-sm leading-7 text-secondary"><p>如對本頁內容或個人資料處理有疑問，可優先透過 <a className="text-gold hover:underline" href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer">LINE 官方帳號</a>聯絡。</p><p>Email：<a className="break-all text-gold hover:underline" href={`mailto:${legalConfig.supportContact}`}>{legalConfig.supportContact}</a></p></div>
      </div></section>
    </SiteShell>
  );
}
