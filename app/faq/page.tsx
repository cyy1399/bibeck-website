import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { FAQList, generalFaqs } from "@/components/FAQList";
import { LocalizedPageHero } from "@/components/TranslatedText";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { BYBIT_REGISTER, REBATE_LOGIN } from "@/config/links";
import { bybitActionLabels } from "@/config/actions";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "交易所返傭常見問題",
  description: "了解 BiBeck 返傭、帳戶綁定、資金安全與交易手續費的跨交易所通用問題。",
  path: "/faq",
});

export default function FAQPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: generalFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <LocalizedPageHero eyebrow="nav.faq" title="page.faqTitle" description="page.faqDescription" />
      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow">通用問題</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">跨交易所都適用的重要資訊</h2>
          <div className="mt-8"><FAQList items={generalFaqs} /></div>
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
            <Link href="/calculator" className="cta-button button-secondary">{bybitActionLabels.costCalculator}</Link>
          </div>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-4xl"><TrustNotice /></div></section>
    </SiteShell>
  );
}
