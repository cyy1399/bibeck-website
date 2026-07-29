import type { Metadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { FAQList } from "@/components/FAQList";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { BYBIT_REGISTER, REBATE_LOGIN } from "@/config/links";

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
        <div className="mx-auto max-w-4xl"><FAQList /></div>
      </section>
      <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">下一步</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">準備好降低交易成本？</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ExternalLink href={BYBIT_REGISTER} sponsored>取得返傭</ExternalLink>
            <ExternalLink href={REBATE_LOGIN} variant="secondary">返傭後台</ExternalLink>
          </div>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-4xl"><TrustNotice /></div></section>
    </SiteShell>
  );
}
