import type { Metadata } from "next";
import Link from "next/link";
import { RebateActivationForm } from "@/components/RebateActivationForm";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { rebateActivationReadiness } from "@/config/rebate-activation";

export const metadata: Metadata = { title: "返傭啟用申請｜BiBeck", description: "完成 Bybit 註冊後提交 UID，由 BiBeck 人工確認並設定返傭比例。", robots: { index: false, follow: false }, alternates: { canonical: "/rebate/activate" } };
export const dynamic = "force-dynamic";
export default async function RebateActivatePage({ searchParams }: { searchParams: Promise<{ preReview?: string }> }) { const readiness = rebateActivationReadiness(); const preReview = (await searchParams).preReview?.trim().toUpperCase() ?? ""; return <SiteShell><PageHero eyebrow="Bybit 返傭" title="返傭啟用申請" copy="完成 Bybit 註冊後，請提交 UID。BiBeck 將依後台紀錄人工確認歸戶關係並設定返傭比例。一般新帳號起始比例為 20%；如已有高交易量預審案件，請一併填入案件編號。" /><section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-4xl">{readiness.enabled ? <RebateActivationForm preReview={preReview} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} /> : <div className="border border-gold/30 bg-[#121212] p-8"><p className="eyebrow">功能準備中</p><h2 className="mt-5 text-2xl font-semibold text-white">返傭啟用申請尚未開放</h2><p className="mt-4 text-sm leading-7 text-secondary">正式資料庫、通知或安全驗證尚未完成設定，因此目前不接受線上 UID。請勿透過一般 Email 傳送密碼或驗證碼。</p><Link href="/contact" className="button-secondary mt-6">查看客服說明</Link></div>}</div></section></SiteShell>; }
