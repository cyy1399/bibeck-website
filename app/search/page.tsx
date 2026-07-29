import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "網站搜尋",
  description: "搜尋 BiBeck 的交易成本、交易所手續費、VIP 與返傭資訊。",
  robots: { index: false, follow: true },
};

const searchablePages = [
  { href: "/calculator", title: "交易成本計算器", description: "比較 VIP 等級與 BiBeck 返傭後的實際交易成本。" },
  { href: "/platforms", title: "交易所手續費比較", description: "比較 Bybit、Binance、BingX、Bitget 與 OKX。" },
  { href: "/platform/bybit", title: "Bybit 手續費、VIP 與返傭", description: "查看 Bybit 費率、VIP 級距與 BiBeck 返傭方案。" },
  { href: "/rebate", title: "交易所返傭方案", description: "了解返傭運作方式、初始級距與每月審核制度。" },
  { href: "/faq", title: "常見問題", description: "了解返傭資格、帳戶綁定、費率與資金安全。" },
  { href: "/contact", title: "聯絡 BiBeck", description: "一般聯絡與返傭客服支援窗口。" },
] as const;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q?.trim() ?? "";
  const normalized = query.toLocaleLowerCase("zh-TW");
  const results = query ? searchablePages.filter((page) => `${page.title} ${page.description}`.toLocaleLowerCase("zh-TW").includes(normalized)) : [];

  return (
    <SiteShell>
      <PageHero eyebrow="網站搜尋" title={query ? `「${query}」的搜尋結果` : "搜尋 BiBeck"} copy="搜尋交易成本計算器、交易所手續費、VIP 與返傭資訊。" />
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-4xl">
        <form action="/search" className="flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="site-search">搜尋網站</label><input id="site-search" name="q" defaultValue={query} className="calculator-input min-w-0 flex-1" placeholder="例如：Bybit 返傭" /><button className="cta-button button-primary" type="submit">搜尋</button></form>
        {query && <div className="mt-10">{results.length > 0 ? <ul className="grid gap-4">{results.map((page) => <li key={page.href}><Link href={page.href} className="block border border-white/10 bg-[#121212] p-6 hover:border-gold/50"><h2 className="text-xl font-semibold text-white">{page.title}</h2><p className="mt-3 text-sm leading-7 text-secondary">{page.description}</p></Link></li>)}</ul> : <p className="text-secondary">找不到相符內容，請嘗試「交易成本」、「Bybit」或「返傭」。</p>}</div>}
      </div></section>
    </SiteShell>
  );
}
