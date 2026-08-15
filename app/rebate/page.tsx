import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { REBATE_APPLICATION_URL, REBATE_BACKOFFICE_URL, SUPPORT_EMAIL } from "@/config/links";
import { createPageMetadata } from "@/config/seo";
import { BIBECK_REBATE_ELIGIBILITY_NOTICE } from "@/lib/bibeck-rebate";
import { BIBECK_TRADER_STATUSES } from "@/lib/bibeck-trader-status";

export const metadata: Metadata = createPageMetadata({ title: "Bybit 40% 返傭與交易成本優惠", description: "了解 BiBeck Bybit 標準 40% 交易手續費返傭、VIP 費率、Trader Status、返傭帳戶申請方式與實際交易成本計算。", path: "/rebate" });

const steps = [
  ["01", "建立 BiBeck 返傭帳戶", "透過 BiBeck 指定申請入口完成帳戶建立。"],
  ["02", "完成返傭開通", "提交 UID、Email 與必要資料，完成帳戶核對及返傭設定。"],
  ["03", "使用返傭帳戶交易", "使用成功開通並綁定於 BiBeck 推薦關係下的帳戶進行符合條件的交易，即可依適用規則取得返傭。"],
] as const;

export default function RebatePage() {
  return <SiteShell>
    <PageHero eyebrow="Bybit 返傭" title="40% Bybit 交易手續費返傭" copy="使用成功開通並綁定於 BiBeck 推薦關係下的符合資格 Bybit 返傭帳戶進行交易，可依實際符合返傭條件的交易手續費取得 BiBeck 40% 標準返傭。" actions={<><ExternalLink href={REBATE_APPLICATION_URL} sponsored>取得 Bybit 返傭帳號</ExternalLink><ExternalLink href={REBATE_BACKOFFICE_URL} variant="secondary">登入 Bybit 返傭後台</ExternalLink></>} />
    <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl">
      <div className="grid gap-8 border border-gold/35 bg-[#14130e] p-7 lg:grid-cols-[16rem_1fr] lg:items-center"><p className="font-mono text-7xl font-semibold text-gold">40%</p><div><h2 className="text-2xl font-semibold">BiBeck 標準返傭</h2><p className="mt-4 text-sm leading-7 text-secondary">{BIBECK_REBATE_ELIGIBILITY_NOTICE}</p><p className="mt-3 text-xs leading-6 text-white/44">返傭以 VIP 後實際適用的符合條件交易手續費為試算基礎，不是以原始費率計算，也不代表所有帳戶、商品、地區或交易一定適用。</p></div></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="border border-white/10 p-5"><p className="text-xs text-white/44">示意</p><p className="mt-3">VIP 後手續費</p><strong className="mt-2 block font-mono text-xl">1,000 USDT</strong></div><div className="border border-white/10 p-5"><p className="text-xs text-white/44">40% 返傭</p><strong className="mt-8 block font-mono text-xl text-gold">400 USDT</strong></div><div className="border border-gold/35 p-5"><p className="text-xs text-white/44">返傭後成本</p><strong className="mt-8 block font-mono text-xl">600 USDT</strong></div></div>
      <Link href="/calculator" className="button-secondary mt-7">免費計算交易成本</Link>
    </div></section>
    <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="Trader Status" title="40% 不因交易量改變，身分里程碑反映交易活動。" copy="Member、Pro 與 Black 的標準返傭皆為 40%。高交易量交易者可能取得活動、獎勵或合作資格評估，實際內容依當期條件與 BiBeck 確認結果為準。"/><div className="mt-10 grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-4">{BIBECK_TRADER_STATUSES.map((status)=><article key={status.id} className={`bg-[#121212] p-6 ${status.id==="black"?"border border-gold/45":""}`}><h2 className="text-xl font-semibold">{status.name}</h2><p className="mt-4 font-mono text-gold">{status.rebateRate === null ? "個別協商" : "40% 標準返傭"}</p><p className="mt-4 text-xs leading-6 text-white/52">{status.minVolume === 50_000_000 ? "50M+ 30 日交易量里程碑" : status.minVolume === 200_000_000 ? "200M+ 30 日交易量里程碑" : status.isPartner ? "不依單純交易量自動取得" : "最近 30 日有效交易量未滿 50M"}</p><p className="mt-3 text-sm leading-7 text-secondary">{status.description}</p><ul className="mt-4 grid gap-2 text-xs leading-5 text-white/48">{status.benefits.map((benefit)=><li key={benefit}>— {benefit}</li>)}</ul></article>)}</div></div></section>
    <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="申請方式" title="三步完成返傭申請與開通"/><ol className="mt-10 grid gap-px bg-white/10 md:grid-cols-3">{steps.map(([n,title,copy])=><li key={n} className="bg-[#111] p-6"><span className="font-mono text-gold">{n}</span><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-secondary">{copy}</p></li>)}</ol><div className="mt-8 border-l-2 border-gold bg-black/20 p-6 text-sm leading-7 text-secondary"><h3 className="font-semibold text-white">只有 BiBeck 綁定帳戶才會產生返傭</h3><p className="mt-3">只有使用成功開通並綁定於 BiBeck 推薦關係下的 Bybit 返傭帳戶進行符合條件的交易，才會產生 BiBeck 返傭；其他未綁定於 BiBeck 的 Bybit 帳戶不適用。</p><p className="mt-2">依帳戶功能及 Bybit 規定，部分使用者可能需要完成 KYC 或依 Bybit 官方流程處理身分轉移。KYC、資產、提領及帳戶限制由 Bybit 官方處理。</p></div><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ExternalLink href={REBATE_APPLICATION_URL} sponsored>取得 Bybit 返傭帳號</ExternalLink><a className="button-secondary" href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("BiBeck Partner 合作洽談")}`}>洽談合作</a></div></div></section>
    <section className="px-5 pb-20 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice/></div></section>
  </SiteShell>;
}
