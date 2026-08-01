import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, isAllowedAdmin, signIn } from "@/auth";

export const metadata: Metadata = { title: "營運管理登入｜BiBeck", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AdminLoginPage() { const session = await auth(); if (isAllowedAdmin(session?.user?.email)) redirect("/admin/rebate-applications"); return <main className="grid min-h-screen place-items-center bg-[#0a0a0a] px-5"><section className="w-full max-w-md border border-white/10 bg-[#121212] p-8"><p className="eyebrow">BiBeck Operations</p><h1 className="mt-5 text-3xl font-semibold text-white">營運管理登入</h1><p className="mt-4 text-sm leading-7 text-secondary">僅限 ADMIN_EMAIL_ALLOWLIST 中的 Google Workspace 帳號。請使用 hello@bibeck.com；admin@bibeck.com 為別名，不能用於 Google OAuth 登入。</p><form className="mt-7" action={async () => { "use server"; await signIn("google", { redirectTo: "/admin/rebate-applications" }); }}><button className="button-primary w-full" type="submit">使用 Google 登入</button></form></section></main>; }
