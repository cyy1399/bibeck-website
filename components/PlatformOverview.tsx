import Link from "next/link";
import { actionLabels } from "@/config/actions";
import { SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { EXCHANGES, EXCHANGE_ORDER, formatFeeRate } from "@/config/exchanges";

export function PlatformOverview() {
  return (
    <SiteShell>
      <section className="page-hero border-b border-white/8 px-5 pb-16 pt-32 sm:px-8 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">交易所</p>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1.12] text-white sm:text-6xl">先比較費率，再計算真實的交易成本。</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-secondary sm:text-lg">快速查看五個常見交易所的基礎費率、VIP 資料狀態與 BiBeck 服務範圍。費率並不等於全部成本，進入詳情頁後可依自己的條件計算。</p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle label="平台總覽" title="同一個框架，客觀比較五個平台。" copy="Bybit 目前支援 BiBeck 返傭；其餘平台僅提供公開費率資訊與比較工具，不代表合作或官方背書。" />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {EXCHANGE_ORDER.map((slug) => {
              const exchange = EXCHANGES[slug];
              const spot = exchange.products.find((product) => product.id === exchange.spotSummaryProductId);
              const futures = exchange.products.find((product) => product.id === exchange.futuresSummaryProductId);
              const supported = exchange.serviceStatus === "rebate-supported";

              return (
                <article key={slug} className={"grid border bg-[#141414] p-7 sm:p-8 " + (supported ? "border-gold/45" : "border-white/10")}>
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="eyebrow">交易所</p>
                      <h2 className="mt-3 text-3xl font-semibold text-white">{exchange.name}</h2>
                    </div>
                    <span className={"border px-3 py-2 text-xs font-semibold " + (supported ? "border-gold/50 text-gold" : "border-white/12 text-white/48")}>{exchange.menuStatus}</span>
                  </div>

                  <dl className="mt-8 grid gap-px border-y border-white/10 bg-white/10 sm:grid-cols-2">
                    <DataItem label="現貨基礎費率" value={ratePair(spot)} />
                    <DataItem label="合約基礎費率" value={ratePair(futures)} />
                    <DataItem label="VIP 資訊狀態" value={exchange.vipTiers.length > 0 ? "已整理" : "資料整理中"} />
                    <DataItem label="BiBeck 返傭服務" value={exchange.serviceStatusLabel} />
                  </dl>

                  <Link href={"/platform/" + exchange.slug} className="button-secondary mt-8 w-full sm:w-fit">查看詳情</Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionTitle label="交易成本計算器" title="把你的交易量與費率放進同一個模型。" copy="使用計算器估算每月原始手續費、返傭與年度實際成本，再決定哪個方案更符合你的需求。" />
          <Link href="/calculator" className="button-primary">{actionLabels.costCalculator}</Link>
        </div>
      </section>
    </SiteShell>
  );
}

function ratePair(product: (typeof EXCHANGES)["bybit"]["products"][number] | undefined): string {
  if (!product || (product.fee.maker === null && product.fee.taker === null)) return "待確認";
  return "掛單 " + formatFeeRate(product.fee.maker, 3) + " / 吃單 " + formatFeeRate(product.fee.taker, 3);
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-28 bg-[#111] p-5">
      <dt className="text-xs text-white/42">{label}</dt>
      <dd className="mt-3 text-sm font-semibold leading-6 text-white">{value}</dd>
    </div>
  );
}
