import type { Metadata } from "next";
import Link from "next/link";
import { RebateActivationForm } from "@/components/RebateActivationForm";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { rebateActivationReadiness } from "@/config/rebate-activation";

export const metadata: Metadata = { title: "開通 Bybit 返傭｜BiBeck", description: "完成 Bybit 註冊後提交 UID，由 BiBeck 人工設定 20% 返傭。", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function RebateActivatePage() {
  const readiness = rebateActivationReadiness();
  const signupUrl = process.env.BYBIT_REBATE_SIGNUP_URL || "https://partner.bybit.com/b/t00000016";
  return <SiteShell><PageHero eyebrow="Bybit 返傭" title="開通 Bybit 返傭" copy="完成 Bybit 註冊後，請提交名稱、UID 與聯絡 Email。BiBeck 將核對帳戶並人工設定 20% 返傭比例。" /><section className="px-5 py-16 sm:px-8"><div className="mx-auto max-w-6xl"><div className="mb-8 grid gap-4 md:grid-cols-2"><div className="border border-white/10 bg-[#121212] p-6"><p className="eyebrow">尚未註冊 Bybit？</p><ExternalLink href={signupUrl} sponsored>取得 Bybit 返傭帳號</ExternalLink></div><div className="border border-gold/30 bg-gold/[0.03] p-6"><p className="eyebrow">已完成註冊？</p><p className="mt-3 text-sm leading-7 text-secondary">請填寫下方表單，繼續開通返傭。</p></div></div>{readiness.enabled ? <RebateActivationForm siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} /> : <div className="border border-gold/30 bg-[#121212] p-8"><p className="eyebrow">功能準備中</p><h2 className="mt-5 text-2xl font-semibold text-white">返傭開通線上申請功能準備中</h2><p className="mt-4 text-sm leading-7 text-secondary">如需協助，請聯絡 support@bibeck.com。</p><Link href="/contact" className="button-secondary mt-6">查看客服說明</Link></div>}</div></section></SiteShell>;
}
