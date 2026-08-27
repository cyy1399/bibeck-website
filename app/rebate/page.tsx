import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { BUSINESS_PARTNERSHIP_MAILTO, HIGH_VOLUME_MAILTO, REBATE_APPLICATION_URL } from "@/config/links";
import { createPageMetadata } from "@/config/seo";
import { BIBECK_REBATE_ELIGIBILITY_NOTICE, calculateRebateFromEligibleFee, formatBibeckRebateRate } from "@/lib/bibeck-rebate";

export const metadata: Metadata = createPageMetadata({ title: "Bybit 35% 返傭｜BiBeck", description: "了解 BiBeck Bybit 標準 35% 交易手續費返傭、VIP 費率、返傭帳戶申請方式與實際交易成本計算。", path: "/rebate" });

const steps = [
  ["01", "建立 BiBeck 返傭帳戶", "透過 BiBeck 指定申請入口完成帳戶建立。"],
  ["02", "完成返傭開通", "提交 UID、Email 與必要資料，完成帳戶核對及返傭設定。"],
  ["03", "使用返傭帳戶交易", "使用成功開通並綁定於 BiBeck 推薦關係下的帳戶進行符合條件的交易，即可依適用規則取得返傭。"],
] as const;

export default function RebatePage() {
  return <SiteShell>
    <PageHero eyebrow="Bybit 返傭" title="把 Bybit 交易手續費拿回 35%。" copy={`產生 1,000 USDT 符合資格的交易手續費，BiBeck 標準 ${formatBibeckRebateRate()} 返傭 = ${calculateRebateFromEligibleFee(1_000).toLocaleString("en-US")} USDT。返多少，算得清楚。`} actions={<><Link href="/calculator" className="cta-button button-primary">算算我能拿回多少</Link><ExternalLink href={REBATE_APPLICATION_URL} sponsored variant="secondary">取得 BiBeck 返傭帳戶</ExternalLink></>} />
    <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl">
      <SectionTitle label="計算方式" title="35% 返傭，怎麼算？" copy="BiBeck 返傭以 VIP 後實際符合資格的交易手續費為基礎計算，不是直接用交易量乘以 35%。" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="border border-white/10 p-5"><p className="text-xs text-white/44">符合資格交易手續費</p><strong className="mt-3 block font-mono text-2xl">1,000 USDT</strong></div><div className="border border-white/10 p-5"><p className="text-xs text-white/44">BiBeck 標準返傭</p><strong className="mt-3 block font-mono text-3xl text-gold">{formatBibeckRebateRate()}</strong></div><div className="border border-gold/35 p-5"><p className="text-xs text-white/44">返傭金額</p><strong className="mt-3 block font-mono text-2xl text-gold">{calculateRebateFromEligibleFee(1_000)} USDT</strong></div></div>
      <div className="mt-6 border-l-2 border-gold bg-black/20 p-5"><h3 className="font-semibold">VIP 仍然有效。</h3><p className="mt-3 text-sm leading-7 text-secondary">VIP 先降低原始費率，BiBeck 返傭再依 VIP 後實際符合資格的交易手續費計算，進一步降低有效交易成本。</p></div>
      <p className="mt-6 text-xs leading-6 text-white/44">{BIBECK_REBATE_ELIGIBILITY_NOTICE} 實際返傭仍依帳戶資格、有效手續費與系統紀錄為準。</p>
      <Link href="/calculator" className="button-secondary mt-7">用我的交易量試算</Link>
    </div></section>
    <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="標準返傭與高交易量方案" title="標準 35%，高交易量可進一步評估。" copy="35% 是 BiBeck 一般符合資格帳戶的正式標準產品，不會因輸入交易量自動改變。"/><div className="mt-10 grid gap-6 lg:grid-cols-2"><article className="border border-white/12 bg-[#121212] p-6 sm:p-8"><p className="eyebrow">BiBeck 標準返傭</p><h2 className="mt-4 text-2xl font-semibold">一般符合資格帳戶：35% 標準返傭</h2><p className="mt-4 text-sm leading-7 text-secondary">返傭依成功開通並符合返傭條件的 Bybit 帳戶實際產生之符合資格交易手續費計算。</p><ExternalLink href={REBATE_APPLICATION_URL} sponsored className="mt-6">取得 35% 返傭帳戶</ExternalLink></article><article className="border border-gold/40 bg-gold/[0.04] p-6 sm:p-8"><p className="eyebrow">高交易量 / 專業交易</p><h2 className="mt-4 text-2xl font-semibold">高交易量與專業交易需求</h2><p className="mt-4 text-sm leading-7 text-secondary">如果你的交易量較高，或使用 Quant、Bot、做市等專業交易方式，可以進一步洽詢交易成本與專屬合作條件評估；實際條件由 BiBeck 個別確認。</p><a href={HIGH_VOLUME_MAILTO} className="cta-button button-secondary mt-6">洽談高交易量方案</a></article></div></div></section>
    <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="申請方式" title="三步完成返傭申請與開通"/><ol className="mt-10 grid gap-px bg-white/10 md:grid-cols-3">{steps.map(([n,title,copy])=><li key={n} className="bg-[#111] p-6"><span className="font-mono text-gold">{n}</span><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-secondary">{copy}</p></li>)}</ol><div className="mt-8 border-l-2 border-gold bg-black/20 p-6 text-sm leading-7 text-secondary"><h3 className="font-semibold text-white">只有 BiBeck 綁定帳戶才會產生返傭</h3><p className="mt-3">只有使用成功開通並綁定於 BiBeck 推薦關係下的 Bybit 返傭帳戶進行符合條件的交易，才會產生 BiBeck 返傭；其他未綁定於 BiBeck 的 Bybit 帳戶不適用。</p><p className="mt-2">依帳戶功能及 Bybit 規定，部分使用者可能需要完成 KYC 或依 Bybit 官方流程處理身分轉移。KYC、資產、提領及帳戶限制由 Bybit 官方處理。</p></div><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ExternalLink href={REBATE_APPLICATION_URL} sponsored>取得 35% 返傭帳戶</ExternalLink><a className="button-secondary" href={BUSINESS_PARTNERSHIP_MAILTO}>洽談合作</a></div></div></section>
    <section className="px-5 pb-20 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice/></div></section>
  </SiteShell>;
}
