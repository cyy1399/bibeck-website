import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { bybitFaqs, FAQList, generalFaqs } from "@/components/FAQList";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { BYBIT_REGISTER, REBATE_LOGIN } from "@/config/links";
import { bybitActionLabels } from "@/config/actions";

export const metadata: Metadata = {
  title: "返傭常見問題",
  description: "BiBeck、Bybit 返傭、帳戶綁定、返傭發放、資金安全與手續費常見問題。",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="常見問題" title="註冊前，先把重要問題說清楚。" copy="先了解 BiBeck 的第三方身分、返傭資格、後台流程與資金界線，再決定是否使用服務。" />
      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow">通用問題</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">跨交易所都適用的重要資訊</h2>
          <div className="mt-8"><FAQList items={generalFaqs} /></div>
          <p className="eyebrow mt-16">Bybit 專屬問題</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">Bybit 註冊、綁定與身分驗證</h2>
          <div className="mt-8"><FAQList items={bybitFaqs} /></div>
          <ExternalLink href="https://www.bybit.com/zh-TW/help-center/article/How-to-Transfer-Your-Identity-to-Another-Account" variant="ghost" className="mt-6 !min-h-0 !justify-start !px-0 !tracking-normal">Bybit 身分轉移說明</ExternalLink>
        </div>
      </section>
      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">下一步</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">準備好降低交易成本？</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ExternalLink href={BYBIT_REGISTER} sponsored>{bybitActionLabels.rebateSignup}</ExternalLink>
            <ExternalLink href={REBATE_LOGIN} variant="secondary">{bybitActionLabels.rebateDashboard}</ExternalLink>
            <Link href="/calculator" className="button-secondary">{bybitActionLabels.costCalculator}</Link>
          </div>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-4xl"><TrustNotice /></div></section>
    </SiteShell>
  );
}
