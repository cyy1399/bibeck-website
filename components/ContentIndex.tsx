import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

type IndexGroup = { title: string; items: readonly { title: string; copy: string; href: string; status?: string }[] };

export function ContentIndex({ title, copy, groups }: { title: string; copy: string; groups: readonly IndexGroup[] }) {
  return <SiteShell>
    <section className="px-5 pb-16 pt-36 sm:px-8 sm:pt-44">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-semibold text-white sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-secondary sm:text-lg">{copy}</p>
        <div className="mt-14 space-y-12">
          {groups.map((group) => <section key={group.title} aria-label={group.title}>
            <h2 className="eyebrow mb-5">{group.title}</h2>
            <div className="border-t border-white/12">
              {group.items.map((item) => <Link key={item.href} href={item.href} className="focus-ring group flex items-center justify-between gap-5 border-b border-white/12 py-6 transition-colors hover:bg-white/[0.025] sm:px-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-medium text-white group-hover:text-gold">{item.title}</h3>{item.status ? <span className="text-xs text-white/45">{item.status}</span> : null}</div>
                  <p className="mt-2 text-sm leading-7 text-secondary">{item.copy}</p>
                </div>
                <span aria-hidden="true" className="shrink-0 text-gold">→</span>
              </Link>)}
            </div>
          </section>)}
        </div>
      </div>
    </section>
  </SiteShell>;
}
