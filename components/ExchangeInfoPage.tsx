import Link from "next/link";
import { bybitActionLabels } from "@/config/actions";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";

export type ExchangeFeeRow = {
  product: string;
  maker: string;
  taker: string;
  note: string;
};

export type ExchangeCostPoint = {
  label: string;
  title: string;
  copy: string;
};

export type ExchangeSource = {
  label: string;
  href: string;
};

type ExchangeInfoPageProps = {
  name: string;
  intro: string;
  feeContext: string;
  feeRows: ExchangeFeeRow[];
  costPoints: ExchangeCostPoint[];
  sources: ExchangeSource[];
  reviewedAt?: string;
};

export function ExchangeInfoPage({
  name,
  intro,
  feeContext,
  feeRows,
  costPoints,
  sources,
  reviewedAt = "2026 年 7 月 28 日",
}: ExchangeInfoPageProps) {
  return (
    <SiteShell>
      <PageHero
        eyebrow={`平台 / ${name}`}
        title={`${name} 交易成本摘要`}
        copy={intro}
      />

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid border-y border-white/10 sm:grid-cols-3">
            <StatusItem label="BiBeck 服務" value="尚未提供返傭" />
            <StatusItem label="頁面用途" value="交易成本資訊整理" />
            <StatusItem label="資料檢視" value={reviewedAt} last />
          </div>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <SectionTitle
              label="費率摘要"
              title="先看基本費率，再確認帳戶實際等級。"
              copy={feeContext}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="fee-table w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr>
                  <th>交易產品</th>
                  <th>Maker</th>
                  <th>Taker</th>
                  <th>說明</th>
                </tr>
              </thead>
              <tbody>
                {feeRows.map((row) => (
                  <tr key={row.product}>
                    <td>{row.product}</td>
                    <td>{row.maker}</td>
                    <td>{row.taker}</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-5 text-xs leading-6 text-white/42">
              費率可能因地區、產品、VIP 等級、持倉或平台活動調整。表格僅供快速理解，交易前請登入 {name} 並以帳戶顯示的即時費率為準。
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            label="成本重點"
            title="不要只看一個手續費百分比。"
            copy="真實的交易成本還會受到成交方式、交易頻率、資金費用、滑價與提領網路影響。"
          />
          <div className="mt-14 grid border-y border-white/10 md:grid-cols-3">
            {costPoints.map((point) => (
              <article key={point.label} className="border-b border-white/10 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
                <p className="eyebrow">{point.label}</p>
                <h2 className="mt-7 text-2xl font-semibold text-white">{point.title}</h2>
                <p className="mt-4 text-base leading-8 text-secondary">{point.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionTitle
            label="基本計算"
            title="用成交金額估算單筆費用。"
            copy="同一張訂單可能分批成交，甚至同時包含 Maker 與 Taker 成交；精確成本應逐筆依實際成交紀錄計算。"
          />
          <div className="border-y border-white/10 py-7">
            <p className="text-sm text-secondary">交易手續費</p>
            <p className="mt-4 font-mono text-xl leading-9 text-white sm:text-2xl">成交名目價值 × 適用費率</p>
            <p className="mt-8 text-sm text-secondary">永續合約資金費用</p>
            <p className="mt-4 font-mono text-xl leading-9 text-white sm:text-2xl">持倉價值 × 資金費率</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="border-l-2 border-gold bg-[#111] p-7 sm:p-9">
            <p className="eyebrow">合作狀態聲明</p>
            <h2 className="mt-5 text-2xl font-semibold text-white">BiBeck 目前尚未提供 {name} 返傭。</h2>
            <p className="mt-4 max-w-4xl text-base leading-8 text-secondary">
              本頁僅整理公開的交易成本資訊，不代表 BiBeck 與 {name} 存在合作、隸屬、員工、代表或官方背書關係。BiBeck 不會透過本頁要求你註冊 {name}，也不會接觸或保管你的交易資產。
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="eyebrow">官方資料</p>
              <h2 className="mt-5 text-3xl font-semibold text-white">交易前，再核對一次最新規則。</h2>
              <div className="mt-5 flex flex-col items-start gap-3">
                {sources.map((source) => (
                  <ExternalLink key={source.href} href={source.href} variant="ghost" className="!min-h-0 !justify-start !px-0 !tracking-normal">
                    {source.label}
                  </ExternalLink>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/calculator" className="button-primary">{bybitActionLabels.costCalculator}</Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function StatusItem({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`py-6 sm:px-6 sm:first:pl-0 ${last ? "" : "border-b border-white/10 sm:border-b-0 sm:border-r sm:border-white/10"}`}>
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
