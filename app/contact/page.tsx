import type { Metadata } from "next";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { brandConfig, mailto } from "@/config/brand";
import { BUSINESS_EMAIL, LINE_OFFICIAL_URL } from "@/config/links";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "聯絡 BiBeck", description: "透過 BiBeck LINE 官方帳號聯絡返傭客服、高交易量或商務合作；Email 保留作正式紀錄與備用聯絡。", path: "/contact" });

export default function ContactPage() {
  return <SiteShell>
    <PageHero eyebrow="聯絡" title="聯絡 BiBeck" copy="返傭問題、高交易量需求或商務合作，都可以直接透過 LINE 聯絡 BiBeck。" actions={<a href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="cta-button button-primary">加入 LINE 官方帳號</a>}/>
    <section className="px-5 py-20 sm:px-8"><div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
      <article className="border border-gold/40 bg-gold/[0.04] p-7 sm:p-8"><p className="eyebrow">主要聯絡渠道</p><h2 className="mt-5 text-2xl font-semibold">LINE 官方帳號</h2><p className="mt-4 text-sm leading-7 text-secondary">返傭問題、帳戶開通、高交易量與合作洽談。</p><a href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="cta-button button-primary mt-7 w-full">加入 LINE 官方帳號</a></article>
      <article className="border border-white/12 bg-[#111] p-7 sm:p-8"><p className="eyebrow">正式紀錄與備用聯絡</p><h2 className="mt-5 text-2xl font-semibold">Email</h2><p className="mt-4 text-sm leading-7 text-secondary">正式審核、開通通知及商務文件仍使用 Email。</p><div className="mt-6 grid gap-3 text-sm"><a href={mailto(brandConfig.publicEmails.support, "BiBeck 客服支援")} className="text-link break-all">客服：{brandConfig.publicEmails.support}</a><a href={mailto(BUSINESS_EMAIL, "BiBeck 商務合作")} className="text-link break-all">商務：{BUSINESS_EMAIL}</a></div></article>
    </div></section>
  </SiteShell>;
}
