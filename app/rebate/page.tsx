import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/Sections";
import { LocalizedPageHero } from "@/components/TranslatedText";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { ExchangeActionButtons } from "@/components/ExchangeActionButtons";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "交易所返傭方案與運作方式",
  description: "了解 BiBeck 交易所返傭的運作方式、Bybit 返傭級距、每月審核制度與資格限制。",
  path: "/rebate",
});

const steps = [
  ["01", "透過指定連結建立帳戶", "使用支援交易所的 BiBeck 指定連結建立符合資格的返傭帳戶。"],
  ["02", "返回 BiBeck 提交 UID", "填寫名稱、Bybit UID 與接收通知的 Email，建立待人工設定案件。"],
  ["03", "人工設定 20%", "BiBeck 營運者核對 UID，並在外部返傭後台人工完成一般帳戶的 20% 設定。"],
  ["04", "收到完成通知", "營運者確認完成後，系統寄送 Email；提高返傭比例屬於完成開通後的另一項申請流程。"],
] as const;

export default function RebatePage() {
  return (
    <SiteShell>
      <LocalizedPageHero eyebrow="nav.rebate" title="page.rebateTitle" description="page.rebateDescription" />
      <section className="px-5 py-24 sm:px-8"><div className="mx-auto max-w-7xl">
        <SectionTitle label="運作方式" title="從建立帳戶到人工確認" copy="所有一般 Bybit 返傭帳戶首次開通固定為 20%；完成開通且具穩定交易量後，才可另行申請提高返傭比例。" />
        <div className="mt-12 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2">{steps.map(([number, title, copy]) => <article key={number} className="bg-[#121212] p-7"><p className="font-mono text-sm text-gold">{number}</p><h2 className="mt-5 text-xl font-semibold text-white">{title}</h2><p className="mt-3 text-sm leading-7 text-secondary">{copy}</p></article>)}</div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row"><ExchangeActionButtons exchangeSlug="bybit" calculatorHref="/calculator" /><Link href="/platform/bybit#rebate" className="cta-button button-secondary">查看 Bybit 返傭級距</Link></div>
      </div></section>
      <section className="px-5 pb-20 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice /></div></section>
    </SiteShell>
  );
}
