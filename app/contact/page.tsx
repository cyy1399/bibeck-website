import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { brandConfig, contactMailto, supportMailto } from "@/config/brand";
import { createPageMetadata } from "@/config/seo";
import { TranslatedText } from "@/components/TranslatedText";
import Link from "next/link";
import { rebateActivationReadiness } from "@/config/rebate-activation";

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
  const activation = rebateActivationReadiness();
  return (
    <SiteShell>
      <section className="page-hero relative border-b border-white/10 px-5 pb-16 pt-36 sm:px-8 lg:pt-44">
        <div className="mx-auto max-w-7xl"><p className="eyebrow"><TranslatedText message="nav.contact" /></p><h1 className="mt-6 text-4xl font-semibold text-white sm:text-6xl"><TranslatedText message="page.contactTitle" /></h1><p className="mt-6 max-w-2xl text-base leading-8 text-secondary"><TranslatedText message="page.contactDescription" /></p></div>
      </section>
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-5xl"><div className="mb-8 border-l-2 border-gold bg-[#121212] p-6"><h2 className="text-xl font-semibold text-white">已完成 Bybit 註冊？</h2><p className="mt-3 text-sm leading-7 text-secondary">請使用「開通 Bybit 返傭」表單提交 UID，不需要自行撰寫 Email 申請。客服 Email 僅處理 UID 填寫錯誤、找不到 UID、無法歸戶、補件、KYC 轉移、完成後未顯示及返傭紀錄異常。</p>{activation.enabled ? <Link href="/rebate/activate" className="button-primary mt-5">繼續開通 Bybit 返傭</Link> : <span className="button-secondary mt-5 cursor-not-allowed opacity-50">開通功能準備中</span>}</div><div className="grid gap-5 md:grid-cols-2">
        {contacts.map((contact) => <article key={contact.email} className="min-w-0 border border-white/10 bg-[#141414] p-7"><p className="eyebrow">{contact.label}</p><h2 className="mt-6 text-xl font-semibold text-white">{contact.description}</h2><a href={contact.href} className="mt-6 block break-all text-base font-semibold text-gold hover:text-[var(--gold-soft)]">{contact.email}</a><a href={contact.href} className="button-secondary mt-7 w-full">{contact.action}</a></article>)}
      </div></div></section>
    </SiteShell>
  );
}
