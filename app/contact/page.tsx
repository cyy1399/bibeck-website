import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { brandConfig, contactMailto, supportMailto } from "@/config/brand";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "聯絡 BiBeck",
  description: "聯絡 BiBeck 一般服務、網站內容與返傭客服支援窗口。",
  path: "/contact",
});

const contacts = [
  { label: "一般聯絡", description: "網站內容、品牌合作、媒體與其他一般問題", email: brandConfig.publicEmails.contact, href: contactMailto, action: "寄送一般詢問" },
  { label: "客服支援", description: "返傭帳戶、綁定、註冊、身分驗證、返傭後台與計算器問題", email: brandConfig.publicEmails.support, href: supportMailto, action: "聯絡客服支援" },
] as const;

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="page-hero relative border-b border-white/10 px-5 pb-16 pt-36 sm:px-8 lg:pt-44">
        <div className="mx-auto max-w-7xl"><p className="eyebrow">聯絡 BiBeck</p><h1 className="mt-6 text-4xl font-semibold text-white sm:text-6xl">找到正確的聯絡窗口</h1><p className="mt-6 max-w-2xl text-base leading-8 text-secondary">依照問題類型選擇一般聯絡或客服支援，我們會由對應窗口處理。</p></div>
      </section>
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
        {contacts.map((contact) => <article key={contact.email} className="min-w-0 border border-white/10 bg-[#141414] p-7"><p className="eyebrow">{contact.label}</p><h2 className="mt-6 text-xl font-semibold text-white">{contact.description}</h2><a href={contact.href} className="mt-6 block break-all text-base font-semibold text-gold hover:text-[var(--gold-soft)]">{contact.email}</a><a href={contact.href} className="button-secondary mt-7 w-full">{contact.action}</a></article>)}
      </div></section>
    </SiteShell>
  );
}
