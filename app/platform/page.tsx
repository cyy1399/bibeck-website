import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { PLATFORM_DIRECTORY } from "@/config/platforms";

export const metadata: Metadata = {
  title: "交易所平台與手續費比較",
  description: "查看 Bybit、Binance、BingX、Bitget 與 OKX 的交易費率、Maker／Taker、資金費用與 BiBeck 返傭支援狀態。",
  alternates: { canonical: "/platform" },
};

export default function PlatformPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="平台總覽"
        title="選擇平台，先看懂交易成本。"
        copy="每家交易所的費率分級、產品與折扣條件都不同。BiBeck 將公開資訊整理成一致的閱讀方式，讓你快速找到真正影響成本的項目。"
      />

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <SectionTitle
              label="平台目錄"
              title="返傭合作與資訊整理，清楚分開。"
              copy="目前只有 Bybit 提供 BiBeck 返傭服務；其餘平台僅整理官方公開資訊，不代表雙方存在合作或官方背書關係。"
            />
            <Link href="/calculator" className="text-link">開啟交易成本計算器 <span aria-hidden="true">→</span></Link>
          </div>

          <div className="mt-14 border-t border-white/10">
            {PLATFORM_DIRECTORY.map((platform, index) => (
              <Link
                key={platform.href}
                href={platform.href}
                className="group grid gap-5 border-b border-white/10 py-7 transition hover:bg-white/[0.018] sm:grid-cols-[56px_1fr_auto] sm:items-center sm:px-4"
              >
                <span className="font-mono text-sm text-gold">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block text-2xl font-semibold text-white transition group-hover:text-gold">{platform.name}</span>
                  <span className="mt-2 block text-sm leading-7 text-secondary">{platform.summary}</span>
                </span>
                <span className={"w-fit border px-3 py-2 text-xs font-semibold " + (platform.supported ? "border-gold/50 text-gold" : "border-white/12 text-white/42")}>
                  {platform.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionTitle
            label="閱讀方式"
            title="同一套成本框架，理解不同交易所。"
            copy="頁面統一從交易費率、成交角色、資金費用、折扣條件與提領成本切入，避免只比較一個看似便宜的百分比。"
          />
          <div className="grid border-y border-white/10 sm:grid-cols-2">
            {["Maker／Taker 費率", "VIP 與平台幣折扣", "永續合約資金費用", "滑價與提領成本"].map((item, index) => (
              <div key={item} className="border-b border-white/10 py-6 sm:px-6 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0">
                <p className="font-mono text-xs text-gold">0{index + 1}</p>
                <p className="mt-4 text-lg font-semibold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}