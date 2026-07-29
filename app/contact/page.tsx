import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { brandConfig, businessMailto, contactMailto, supportMailto } from "@/config/brand";

export const metadata: Metadata = {
  title: "聯絡我們",
  description: "聯絡 BiBeck 一般服務、Bybit 返傭客服或專業商務合作窗口。",
  alternates: { canonical: "/contact" },
};

const contacts = [
  { label: "一般聯絡", description: "一般問題、網站內容與品牌相關詢問", email: brandConfig.emails.contact, href: contactMailto, action: "寄送一般詢問" },
  { label: "返傭客服", description: "Bybit 註冊、歸戶、返傭與後台使用問題", email: brandConfig.emails.support, href: supportMailto, action: "聯絡 Bybit 返傭客服" },
  { label: "商務合作", description: "高額交易量、代理、KOL 與 40%+ 專業返傭方案", email: brandConfig.emails.business, href: businessMailto, action: "申請 Bybit 40%+ 專業合作方案" },
] as const;

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="page-hero relative border-b border-white/10 px-5 pb-16 pt-36 sm:px-8 lg:pt-44">
        <div className="mx-auto max-w-7xl"><p className="eyebrow">聯絡 BiBeck</p><h1 className="mt-6 text-4xl font-semibold text-white sm:text-6xl">找到正確的聯絡窗口</h1><p className="mt-6 max-w-2xl text-base leading-8 text-secondary">依照問題類型選擇一般聯絡、Bybit 返傭客服或商務合作，我們會由對應窗口處理。</p></div>
      </section>
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
        {contacts.map((contact) => <article key={contact.email} className="min-w-0 border border-white/10 bg-[#141414] p-7"><p className="eyebrow">{contact.label}</p><h2 className="mt-6 text-xl font-semibold text-white">{contact.description}</h2><a href={contact.href} className="mt-6 block break-all text-base font-semibold text-gold hover:text-[var(--gold-soft)]">{contact.email}</a><a href={contact.href} className="button-secondary mt-7 w-full">{contact.action}</a></article>)}
      </div></section>
    </SiteShell>
  );
}
