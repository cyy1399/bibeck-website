import type { Metadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { BIBECK_REBATE_TIERS } from "@/config/bibeck-rebate-tiers";
import { REBATE_APPLICATION_URL, REBATE_BACKOFFICE_URL } from "@/config/links";
import { createPageMetadata } from "@/config/seo";
import { rebateReviewPolicy } from "@/config/rebate-review-policy";

export const metadata: Metadata = createPageMetadata({
  title: "Bybit 返傭級距與申請流程",
  description: "了解 BiBeck 20%～40% 公開返傭級距、40% 以上特殊合作方案、交易量門檻、返傭申請與帳戶使用方式。",
  path: "/rebate",
});

const steps = [["01","前往返傭申請頁","從統一入口開始申請。"],["02","建立返傭帳戶","使用頁面中的 BiBeck 指定連結註冊新的 Bybit 返傭帳戶。"],["03","依規定處理 KYC","依帳戶功能與 Bybit 規定，可能需要完成或轉移 KYC 身分驗證。"],["04","提交返傭資料","提交名稱、Bybit UID、返傭後台登入 Email 與申請級距。"],["05","帳戶與資料核對","BiBeck 核對帳戶推薦關係與申請資料。"],["06","完成返傭設定","完成後寄送通知與登入資訊。"],["07","使用返傭帳戶交易","返傭依成功開通帳戶產生的有效手續費計算。"]] as const;

export default function RebatePage() {
  return <SiteShell>
    <PageHero eyebrow="返傭說明" title="公開返傭級距 20%～40%" copy="公開級距依最近 30 日有效交易量推估；代理、社群、團隊或其他合作需求，可另外申請 40% 以上特殊合作方案。實際比例以資料核對與通知結果為準。" actions={<><ExternalLink href={REBATE_APPLICATION_URL} sponsored>取得 Bybit 返傭帳號</ExternalLink><ExternalLink href={REBATE_BACKOFFICE_URL} variant="secondary">登入 Bybit 返傭後台</ExternalLink></>} />
    <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl">
      <SectionTitle label="公開級距" title="依最近 30 日有效交易量申請 20%～40%" copy="公開級距依申請與資料核對結果生效；特殊合作 40% 以上不會因交易量自動取得，須個別評估與協商。"/>
      <div className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-3">{BIBECK_REBATE_TIERS.map((tier) => <article key={tier.id} className={`min-w-0 bg-[#121212] p-6 ${tier.isSpecial ? "border border-gold/45" : ""}`}><h2 className="text-lg font-semibold text-white">{tier.name}</h2><p className="mt-4 font-mono text-xl text-gold">{tier.shortLabel}</p><p className="mt-4 text-sm leading-6 text-white/72">{tier.volumeLabel}</p><p className="mt-3 text-xs leading-6 text-white/44">{tier.description}</p>{tier.isSpecial ? <ExternalLink href={REBATE_APPLICATION_URL} sponsored variant="secondary" className="mt-5 w-full">申請特殊合作方案</ExternalLink> : null}</article>)}</div>
      <p className="mt-5 text-xs leading-6 text-white/44">M 代表百萬，B 代表十億；例如 10M＝10,000,000、1B＝1,000,000,000 USDT。VIP 等級只作費率參考，不是 BiBeck 級距的絕對取得條件。</p>
    </div></section>
    <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="申請方式" title="一次完成註冊與返傭資料提交"/><ol className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([n,title,copy]) => <li key={n} className="bg-[#111] p-6"><span className="font-mono text-gold">{n}</span><h3 className="mt-4 font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-secondary">{copy}</p></li>)}</ol><div className="mt-8 border-l-2 border-gold bg-black/20 p-6 text-sm leading-7 text-secondary"><h3 className="font-semibold text-white">請使用 BiBeck 返傭帳戶進行交易</h3><p className="mt-3">只有透過 BiBeck 指定申請流程註冊，並成功綁定於 BiBeck 推薦關係下的 Bybit 返傭帳戶，使用該帳戶交易時才能獲得 BiBeck 返傭。</p><p className="mt-2">原有 Bybit 帳戶若未綁定於 BiBeck，即使已有交易量、VIP 等級或完成 KYC，也無法直接套用 BiBeck 返傭。返傭依成功開通的 BiBeck 返傭帳戶所產生的有效手續費計算。</p></div><div className="mt-8 grid gap-3 border border-white/10 bg-[#111] p-6 text-sm leading-7 text-secondary"><h3 className="font-semibold text-white">級距審查規則</h3><p>使用者可主動提交級距申請；若未主動申請，BiBeck 於{rebateReviewPolicy.reviewSchedule}統一檢視最近 30 日有效交易量。</p><p>{rebateReviewPolicy.firstShortfall}；{rebateReviewPolicy.secondShortfall}。{rebateReviewPolicy.special}。</p><p>{rebateReviewPolicy.effectiveTiming}，實際結果以通知為準。</p></div></div></section>
    <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice/></div></section>
  </SiteShell>;
}
