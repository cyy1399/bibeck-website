import Link from "next/link";
import { ExchangeComparisonCalculator } from "@/components/ExchangeComparisonCalculator";
import { ExchangeActionButtons } from "@/components/ExchangeActionButtons";
import { bybitFaqs, FAQList } from "@/components/FAQList";
import { ExternalLink } from "@/components/ExternalLink";
import { PlatformFeeCalculator } from "@/components/PlatformFeeCalculator";
import { BybitCostCalculator } from "@/components/BybitCostCalculator";
import { SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { EXCHANGES, formatFeeRate, type ExchangeData } from "@/config/exchanges";
import { getExchangeActionLabels } from "@/config/actions";
import { BYBIT_REGISTER, REBATE_LOGIN } from "@/config/links";
import { BIBECK_REBATE_TIERS, formatRebateVolumeRange } from "@/config/bibeck-rebate-tiers";
import { brandConfig } from "@/config/brand";

const costFactors = [
  ["01", "基礎手續費", "交易所公開的掛單與吃單費率，是計算交易成本的起點。"],
  ["02", "VIP 優惠", "符合交易量或資產條件後，可能取得更低的手續費率。"],
  ["03", "返傭回饋", "返傭會將部分已支付的手續費回饋給使用者，降低實際交易成本。"],
  ["04", "其他交易成本", "資金費率、滑價、提領費用與平台幣折扣，也可能影響最終成本。"],
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Taipei",
  }).format(new Date(value + "T00:00:00+08:00"));
}

export function ExchangePlatformPage({ exchange }: { exchange: ExchangeData }) {
  const isBybit = exchange.slug === "bybit";
  const spot = exchange.products.find((product) => product.id === exchange.spotSummaryProductId);
  const futures = exchange.products.find((product) => product.id === exchange.futuresSummaryProductId);
  const officialSource = exchange.officialSources[0];
  const bybit = EXCHANGES.bybit;
  const bybitFutures = bybit.products.find((product) => product.id === bybit.futuresSummaryProductId);
  const currentDefaultRate = futures?.fee.taker ?? spot?.fee.taker ?? null;
  const bybitDefaultRate = bybitFutures?.fee.taker ?? 0.00055;
  const actionLabels = getExchangeActionLabels({ name: exchange.name });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首頁", item: brandConfig.websiteUrl + "/" },
      { "@type": "ListItem", position: 2, name: "交易所", item: brandConfig.websiteUrl + "/platforms" },
      { "@type": "ListItem", position: 3, name: exchange.name, item: brandConfig.websiteUrl + "/platform/" + exchange.slug },
    ],
  };

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="exchange-hero border-b border-white/8 px-5 pb-14 pt-32 sm:px-8 lg:pb-16 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="麵包屑" className="flex flex-wrap items-center gap-2 text-xs text-white/42">
            <Link href="/" className="hover:text-gold">首頁</Link>
            <span aria-hidden="true">/</span>
            <Link href="/platforms" className="hover:text-gold">交易所</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/68">{exchange.name}</span>
          </nav>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <p className="eyebrow">交易所費率資料</p>
              <h1 className="mt-5 max-w-5xl text-balance text-4xl font-semibold leading-[1.12] text-white sm:text-5xl lg:text-6xl">{exchange.heroTitle}</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-secondary sm:text-lg">{exchange.description}</p>
              <div className="mt-8"><ExchangeActionButtons exchangeSlug={exchange.slug} calculatorHref="#trading-cost-calculator" /></div>
            </div>
            <div className="border-y border-white/10 py-6">
              <p className="eyebrow">頁面重點</p>
              <p className="mt-4 text-lg font-semibold leading-8 text-white">先確認費率與資格，再比較返傭後的實際成本。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="現貨基礎費率" value={ratePair(spot)} />
            <SummaryCard label="合約基礎費率" value={ratePair(futures)} />
            <SummaryCard label="VIP 等級" value={exchange.vipTiers.length > 0 ? "已整理 " + exchange.vipTiers.length + " 個等級" : "VIP 資料整理中"} />
            <SummaryCard label="BiBeck 服務狀態" value={exchange.serviceStatusLabel} highlighted={isBybit} />
          </div>

          <div className="mt-10 grid border-y border-white/10 md:grid-cols-3">
            <InfoItem label="BiBeck 服務狀態" value={isBybit ? "支援 Bybit 返傭服務" : "目前尚未提供 " + exchange.name + " 返傭"} />
            <div className="border-b border-white/10 py-6 md:border-b-0 md:border-r md:border-white/10 md:px-7">
              <p className="eyebrow">官方資料來源</p>
              {officialSource ? (
                <ExternalLink href={officialSource.url} variant="ghost" className="mt-2 !min-h-0 !justify-start !px-0 !text-left !tracking-normal">{officialSource.label}</ExternalLink>
              ) : (
                <p className="mt-3 text-base font-semibold text-white">待補充</p>
              )}
            </div>
            <InfoItem label="最後更新日期" value={formatDate(exchange.lastUpdated)} last />
          </div>

          <div className={"mt-10 grid gap-7 border-l-2 bg-[#111] p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center " + (isBybit ? "border-gold" : "border-white/18")}>
            <p className="max-w-4xl text-base leading-8 text-white/78">{exchange.summary}</p>
            {isBybit ? (
              <ExternalLink href={BYBIT_REGISTER} sponsored>{actionLabels.rebateSignup}</ExternalLink>
            ) : (
              <a href="#comparison" className="button-secondary">比較 Bybit + BiBeck</a>
            )}
          </div>
        </div>
      </section>

      <section id="fees" className="section-muted scroll-mt-24 border-y border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle label="基礎費率表" title={exchange.name + " 掛單與吃單費率"} copy="只列出目前可核對的交易商品；尚未取得可靠資料的欄位會明確顯示「待確認」。" />
          <div className="table-scroll-shell mt-10 overflow-x-auto">
            <p className="table-scroll-hint">表格可左右滑動</p>
            <table className="fee-table w-full min-w-[720px] border-collapse text-left">
              <thead><tr><th>交易商品</th><th>掛單（Maker）</th><th>吃單（Taker）</th><th>說明</th></tr></thead>
              <tbody>
                {exchange.products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{formatFeeRate(product.fee.maker)}</td>
                    <td>{formatFeeRate(product.fee.taker)}</td>
                    <td>{product.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-xs leading-6 text-white/44">費率可能因商品、地區、VIP 等級與平台政策而異，實際費率請以交易所官方公告及帳戶顯示為準。</p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle label="VIP 等級" title="VIP 等級與手續費差異" copy="部分交易所會依 30 日交易量、資產規模或持有平台幣數量提供不同手續費等級。比較時應同時查看升級門檻與實際費率。" />
          <div className="table-scroll-shell mt-10 overflow-x-auto">
            <p className="table-scroll-hint">表格可左右滑動</p>
            <table className="fee-table w-full min-w-[980px] border-collapse text-left">
              <thead><tr><th>VIP 等級</th><th>30 日交易量門檻</th><th>資產條件</th><th>現貨掛單</th><th>現貨吃單</th><th>合約掛單</th><th>合約吃單</th></tr></thead>
              <tbody>
                {exchange.vipTiers.length > 0 ? exchange.vipTiers.map((tier) => (
                  <tr key={tier.level}>
                    <td>{tier.level}</td>
                    <td>{tier.volumeRequirement ?? "待確認"}</td>
                    <td>{tier.assetRequirement ?? "待確認"}</td>
                    <td>{formatFeeRate(tier.spotMaker)}</td>
                    <td>{formatFeeRate(tier.spotTaker)}</td>
                    <td>{formatFeeRate(tier.futuresMaker)}</td>
                    <td>{formatFeeRate(tier.futuresTaker)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={7}><span className="text-white">VIP 資料整理中</span><span className="ml-3">請先查看下方官方資料來源。</span></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col items-start gap-2">
            {exchange.officialSources.map((source) => <ExternalLink key={source.url} href={source.url} variant="ghost" className="!min-h-0 !justify-start !px-0 !tracking-normal">{source.label}</ExternalLink>)}
          </div>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle label="實際交易成本" title="真正要比較的，不只是表面費率" />
          <div className="mt-12 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {costFactors.map(([number, title, copy]) => (
              <article key={number} className="bg-[#101010] p-7">
                <p className="font-mono text-xs text-gold">{number}</p>
                <h2 className="mt-7 text-xl font-semibold text-white">{title}</h2>
                <p className="mt-4 text-sm leading-7 text-secondary">{copy}</p>
              </article>
            ))}
          </div>
          <div className="cost-equation mt-12 grid gap-3 border-y border-white/10 py-8 text-center sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center">
            <strong>基礎手續費</strong><span>−</span><strong>VIP 優惠</strong><span>−</span><strong>返傭回饋</strong><span>=</span><strong className="text-gold">實際交易成本</strong>
          </div>
        </div>
      </section>

      <section id="trading-cost-calculator" className="scroll-mt-24 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle label="交易成本計算器" title="計算你的實際交易成本" copy={isBybit ? "輸入最近 30 日交易量，自動比較無優惠、Bybit VIP 與 BiBeck 返傭後的交易成本。" : "選擇商品、下單方式與 VIP 等級，再輸入每月交易量與適用返傭比例。"} />
          <div className="mt-10">{isBybit ? <BybitCostCalculator /> : <PlatformFeeCalculator exchange={exchange} />}</div>
        </div>
      </section>

      {isBybit ? (
        <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle label="BiBeck 返傭方案" title="依交易需求選擇合適的參考方案" copy="一般方案級距仍須以 BiBeck 審核與合作條件為準；40% 或以上僅提供專業協商與人工評估。" />
            <div className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-5">
              {BIBECK_REBATE_TIERS.map((tier) => (
                <article key={tier.id} className={"min-w-0 bg-[#141414] p-6 " + (tier.isNegotiated ? "ring-1 ring-inset ring-gold/45" : "")}>
                  {tier.isNegotiated ? <p className="mb-4 w-fit border border-gold/35 px-2 py-1 text-[0.68rem] text-gold">人工評估</p> : null}
                  <h3 className="text-lg font-semibold text-white">{tier.name}</h3><p className="mt-5 font-mono text-xl text-gold">{Math.round(tier.rebateRate * 100)}%{tier.isNegotiated ? " 或以上" : " 返傭回饋"}</p><p className="mt-5 text-xs text-white/42">最近 30 日交易量</p><p className="mt-2 break-words font-mono text-sm leading-6 text-white">{formatRebateVolumeRange(tier)}</p><p className="mt-3 text-sm leading-6 text-secondary">{tier.description}</p>{tier.isNegotiated ? <p className="mt-3 text-xs leading-6 text-white/42">實際比例需經人工評估與專業協商。</p> : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {isBybit ? (
        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <SectionTitle label="Bybit 專屬 FAQ" title="舊帳戶、返傭綁定與身分轉移" copy="返傭資格與身分轉移皆受 Bybit 規則及帳戶狀態限制，不保證所有帳戶都適用。" />
            <div className="mt-10"><FAQList items={bybitFaqs.slice(0, 3)} /></div>
            <div className="mt-7 border-l-2 border-gold/60 bg-[#101010] p-6 text-sm leading-7 text-secondary">
              <p className="font-semibold text-white">重要提醒</p>
              <p className="mt-2">接收身分驗證的目標帳戶必須保持未認證狀態。身分轉移只轉移身分驗證資訊，不會轉移推薦碼、代理關係、資產、電子郵件或手機號碼。轉移前後亦可能存在提現、法幣服務及帳戶狀態限制。</p>
              <ExternalLink href="https://www.bybit.com/zh-TW/help-center/article/How-to-Transfer-Your-Identity-to-Another-Account" variant="ghost" className="mt-4 !min-h-0 !justify-start !px-0 !tracking-normal">Bybit 身分轉移說明</ExternalLink>
            </div>
          </div>
        </section>
      ) : null}

      {!isBybit ? (
        <section id="comparison" className="section-muted scroll-mt-24 border-y border-white/10 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle label="方案比較" title="你目前的方案，真的比較省嗎？" copy="輸入兩邊實際適用的費率與返傭比例。結果會如實顯示目前方案、Bybit + BiBeck 或兩者相近。" />
            <div className="mt-10">
              <ExchangeComparisonCalculator currentExchangeName={exchange.name} currentFeeRate={currentDefaultRate} bybitFeeRate={bybitDefaultRate} bibeckRebateRate={bybit.rebateRate ?? null} />
            </div>
          </div>
        </section>
      ) : null}

      <section id="rebate" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {isBybit ? (
            <div className="grid gap-10 border-y border-white/10 py-12 lg:grid-cols-[1fr_auto] lg:items-end">
              <SectionTitle label="BiBeck 返傭" title="降低你的 Bybit 實際交易成本" copy="透過 BiBeck 專屬推薦連結註冊 Bybit，並依合作方案條件取得交易手續費返傭。" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <ExternalLink href={BYBIT_REGISTER} sponsored>{actionLabels.rebateSignup}</ExternalLink>
                <ExternalLink href={REBATE_LOGIN} variant="secondary">{actionLabels.rebateDashboard}</ExternalLink>
              </div>
            </div>
          ) : (
            <div className="grid gap-10 border-y border-white/10 py-12 lg:grid-cols-[1fr_auto] lg:items-end">
              <SectionTitle label="下一步" title="比較返傭後的實際交易成本" copy="BiBeck 目前主要提供 Bybit 返傭服務。你可以使用成本比較工具，確認 Bybit + BiBeck 是否符合你的交易需求。" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="#trading-cost-calculator" className="button-secondary">{actionLabels.costCalculator}</Link>
              </div>
            </div>
          )}

          <aside className="mt-10 border-l-2 border-gold/70 bg-[#101010] p-7 text-sm leading-7 text-secondary">
            <p className="font-medium text-white">BiBeck 為獨立第三方交易成本與返傭資訊平台，並非由任何交易所擁有、營運或官方背書。</p>
            <p className="mt-3">BiBeck 不提供投資建議、不保證任何獲利，也不保管使用者資產。交易涉及風險，使用者應自行評估並閱讀相關交易所條款。</p>
            <p className="mt-3">部分連結可能為合作夥伴連結。當使用者透過相關連結註冊或交易時，BiBeck 可能取得合作佣金或返傭收入。</p>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}

function ratePair(product: ExchangeData["products"][number] | undefined): string {
  if (!product) return "待確認";
  if (product.fee.maker === null && product.fee.taker === null) return "待確認";
  return "掛單 " + formatFeeRate(product.fee.maker, 3) + "　吃單 " + formatFeeRate(product.fee.taker, 3);
}

function SummaryCard({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
  return (
    <article className={"min-h-36 bg-[#141414] p-6 " + (highlighted ? "ring-1 ring-inset ring-gold/55" : "")}>
      <p className="eyebrow">{label}</p>
      <p className={"mt-6 text-lg font-semibold leading-8 " + (highlighted ? "text-gold" : "text-white")}>{value}</p>
    </article>
  );
}

function InfoItem({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={"border-b border-white/10 py-6 md:border-b-0 md:px-7 md:first:pl-0 " + (last ? "" : "md:border-r md:border-white/10")}>
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-base font-semibold leading-7 text-white">{value}</p>
    </div>
  );
}
