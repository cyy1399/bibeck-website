import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import {
  BYBIT_FEE_STRUCTURE,
  BYBIT_FUNDING_FEE,
  BYBIT_MAKER_TAKER,
  BYBIT_REGISTER,
  REBATE_LOGIN,
} from "@/config/links";

export const metadata: Metadata = {
  title: "Bybit 手續費、交易成本與返傭",
  description: "整理 Bybit 現貨、永續合約、交割合約與期權基本費率，以及 Maker、Taker、資金費用和 BiBeck 返傭流程。",
  alternates: { canonical: "/platform/bybit" },
};

const feeRows = [
  ["現貨交易", "0.1000%", "0.1000%"],
  ["永續與交割合約", "0.0550%", "0.0200%"],
  ["期權交易", "0.0300%", "0.0200%"],
];

const rebateSteps = [
  ["01", "使用 BiBeck 專屬入口", "透過指定推薦連結建立符合資格的 Bybit 帳戶。"],
  ["02", "完成帳戶設定", "依 Bybit 與合作方案要求完成帳戶設定與資格確認。"],
  ["03", "正常進行交易", "符合方案條件的交易手續費會進入返傭計算。"],
  ["04", "查看返傭紀錄", "登入返傭後台查看可用紀錄與發放狀態。"],
];

export default function BybitPlatformPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="平台 / Bybit"
        title="Bybit 手續費與返傭"
        copy="在同一頁了解 Bybit 基本交易費率、Maker 與 Taker、資金費用，以及透過 BiBeck 取得返傭的完整流程。"
      />

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid border-y border-white/10 sm:grid-cols-3">
            <div className="py-6 sm:border-r sm:border-white/10 sm:pr-6"><p className="eyebrow">合作狀態</p><p className="mt-3 text-xl font-semibold text-gold">目前支援</p></div>
            <div className="border-t border-white/10 py-6 sm:border-r sm:border-t-0 sm:border-white/10 sm:px-6"><p className="eyebrow">服務內容</p><p className="mt-3 text-xl font-semibold text-white">費率資訊與返傭</p></div>
            <div className="border-t border-white/10 py-6 sm:border-t-0 sm:pl-6"><p className="eyebrow">資料檢視</p><p className="mt-3 text-xl font-semibold text-white">2026 年 7 月 28 日</p></div>
          </div>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <SectionTitle
              label="基本交易費率"
              title="Bybit 非 VIP 用戶費率摘要"
              copy="以下為 Bybit 官方手續費結構列出的 VIP 0 基本費率。VIP 等級可依過去 30 天的資產餘額或交易量提升，並可能取得較低費率。"
            />
            <ExternalLink href={BYBIT_FEE_STRUCTURE} variant="ghost" className="mt-6 !justify-start !px-0 !tracking-normal">查看 Bybit 官方手續費結構</ExternalLink>
          </div>
          <div className="overflow-x-auto">
            <table className="fee-table w-full min-w-[560px] border-collapse text-left">
              <thead><tr><th>交易產品</th><th>Taker 費率</th><th>Maker 費率</th></tr></thead>
              <tbody>
                {feeRows.map(([product, taker, maker]) => <tr key={product}><td>{product}</td><td>{taker}</td><td>{maker}</td></tr>)}
              </tbody>
            </table>
            <p className="mt-5 text-xs leading-6 text-white/42">實際費率可能因地區、帳戶等級、產品或活動而不同，請以完成身分驗證後的 Bybit「我的費率」頁面為準。</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle label="Maker 與 Taker" title="成交方式不同，手續費也可能不同。" copy="Maker 訂單先進入委託簿並提供流動性；Taker 訂單則立即與既有訂單撮合並移除流動性。限價單若立即成交，仍可能被歸類為 Taker。" />
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <article className="border-t border-gold/55 pt-7">
              <p className="eyebrow">Maker / 掛單</p>
              <h2 className="mt-5 text-3xl font-semibold text-white">提供流動性，等待成交</h2>
              <p className="mt-4 text-base leading-8 text-secondary">訂單先留在委託簿中。以非 VIP 永續與交割合約為例，官方基本 Maker 費率為 0.02%。</p>
            </article>
            <article className="border-t border-gold/55 pt-7">
              <p className="eyebrow">Taker / 吃單</p>
              <h2 className="mt-5 text-3xl font-semibold text-white">優先立即成交</h2>
              <p className="mt-4 text-base leading-8 text-secondary">訂單立即與委託簿中的價格成交。以非 VIP 永續與交割合約為例，官方基本 Taker 費率為 0.055%。</p>
            </article>
          </div>
          <ExternalLink href={BYBIT_MAKER_TAKER} variant="ghost" className="mt-7 !justify-start !px-0 !tracking-normal">查看 Bybit 官方 Maker／Taker 說明</ExternalLink>
        </div>
      </section>

      <section className="section-muted border-y border-white/10 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionTitle
            label="資金費用"
            title="永續合約持倉還可能產生資金費用。"
            copy="資金費用在多倉與空倉持有者之間直接交換。只有在資金費用收取時間持有倉位，才會支付或收取；每個交易對的收取間隔與費率限制可能不同。"
          />
          <div className="border-y border-white/10 py-7">
            <p className="text-sm text-secondary">基本計算方式</p>
            <p className="mt-4 font-mono text-2xl text-white">資金費用 = 倉位價值 × 資金費率</p>
            <p className="mt-5 text-sm leading-7 text-secondary">正資金費率通常由多倉支付給空倉；負資金費率則由空倉支付給多倉。應以各交易對即時顯示的費率與結算時間為準。</p>
            <ExternalLink href={BYBIT_FUNDING_FEE} variant="ghost" className="mt-5 !justify-start !px-0 !tracking-normal">查看 Bybit 官方資金費用說明</ExternalLink>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8" id="rebate">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionTitle
              label="BiBeck 返傭"
              title="把部分交易手續費轉回你的成本優勢。"
              copy="返傭不改變市場風險，也不代表保證獲利。它的作用是依適用合作規則，降低部分符合條件的實際交易手續費。"
            />
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ExternalLink href={BYBIT_REGISTER}>透過 Bybit 註冊</ExternalLink>
              <ExternalLink href={REBATE_LOGIN} variant="secondary">返傭後台</ExternalLink>
            </div>
          </div>
          <div className="border-t border-white/12">
            {rebateSteps.map(([number, title, copy]) => (
              <article key={number} className="grid gap-4 border-b border-white/12 py-6 sm:grid-cols-[64px_1fr]">
                <p className="font-mono text-sm text-gold">{number}</p>
                <div><h2 className="text-xl font-semibold text-white">{title}</h2><p className="mt-2 text-base leading-7 text-secondary">{copy}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionTitle label="開始節省" title="先確認成本，再從正確入口完成註冊。" copy="可先使用交易成本計算器估算費用，再決定是否透過 BiBeck 專屬入口註冊。" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/calculator" className="button-primary">計算交易成本</Link>
            <ExternalLink href={BYBIT_REGISTER} variant="secondary">取得返傭</ExternalLink>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-7xl"><TrustNotice /></div>
      </section>
    </SiteShell>
  );
}
