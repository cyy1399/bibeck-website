import type { Metadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { BIBECK_REBATE_TIERS } from "@/config/bibeck-rebate-tiers";
import { REBATE_APPLICATION_URL, REBATE_BACKOFFICE_URL } from "@/config/links";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Bybit 返傭級距與申請流程",
  description: "了解 BiBeck 20%～40% 公開返傭級距、40% 以上特殊合作方案、交易量門檻與返傭申請流程。",
  path: "/rebate",
});

const steps = [["01","前往返傭申請頁","從統一入口開始申請。"],["02","完成 Bybit 註冊","使用申請頁內的 BiBeck 指定連結建立 Bybit 帳號。"],["03","提交返傭資料","提交名稱、Bybit UID、返傭後台登入 Email 與申請級距。"],["04","帳戶資料核對","BiBeck 核對帳戶資料並處理返傭設定。"],["05","接收完成通知","完成後，登入資訊與申請結果將寄送至填寫的 Email。"]] as const;

export default function RebatePage() {
  return <SiteShell>
    <PageHero eyebrow="返傭說明" title="公開返傭級距 20%～40%" copy="公開級距依最近 30 日有效交易量推估；代理、社群、團隊或其他合作需求，可另外申請 40% 以上特殊合作方案。實際比例以資料核對與通知結果為準。" actions={<><ExternalLink href={REBATE_APPLICATION_URL} sponsored>取得 Bybit 返傭帳號</ExternalLink><ExternalLink href={REBATE_BACKOFFICE_URL} variant="secondary">登入 Bybit 返傭後台</ExternalLink></>} />
    <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl">
      <SectionTitle label="公開級距" title="依最近 30 日有效交易量申請 20%～40%" copy="公開級距依申請與資料核對結果生效；特殊合作 40% 以上不會因交易量自動取得，須個別評估與協商。"/>
      <div className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-3">{BIBECK_REBATE_TIERS.map((tier) => <article key={tier.id} className={`min-w-0 bg-[#121212] p-6 ${tier.isSpecial ? "border border-gold/45" : ""}`}><h2 className="text-lg font-semibold text-white">{tier.name}</h2><p className="mt-4 font-mono text-xl text-gold">{tier.shortLabel}</p><p className="mt-4 text-sm leading-6 text-white/72">{tier.volumeLabel}</p><p className="mt-3 text-xs leading-6 text-white/44">{tier.description}</p>{tier.isSpecial ? <ExternalLink href={REBATE_APPLICATION_URL} sponsored variant="secondary" className="mt-5 w-full">申請特殊合作方案</ExternalLink> : null}</article>)}</div>
      <p className="mt-5 text-xs leading-6 text-white/44">M 代表百萬，B 代表十億；例如 10M＝10,000,000、1B＝1,000,000,000 USDT。VIP 等級只作費率參考，不是 BiBeck 級距的絕對取得條件。</p>
    </div></section>
    <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="申請方式" title="一次完成註冊與返傭資料提交"/><ol className="mt-10 grid gap-px border border-white/10 bg-white/10 md:grid-cols-5">{steps.map(([n,title,copy]) => <li key={n} className="bg-[#111] p-6"><span className="font-mono text-gold">{n}</span><h3 className="mt-4 font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-secondary">{copy}</p></li>)}</ol><div className="mt-8 grid gap-4 border-l-2 border-gold bg-black/20 p-6 text-sm leading-7 text-secondary"><p><strong className="text-white">如何找到 Bybit UID：</strong>登入 Bybit 後，於帳戶或個人資料頁查看 UID；請勿提交密碼、驗證碼、API Secret、私鑰或助記詞。</p><p><strong className="text-white">如何登入返傭後台：</strong>待收到完成通知與登入資訊後，再使用外部返傭後台入口。</p></div></div></section>
    <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice/></div></section>
  </SiteShell>;
}
