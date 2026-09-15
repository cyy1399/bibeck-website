"use client";

import Link from "next/link";
import Script from "next/script";
import { useState, type FormEvent } from "react";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function BybitApplicationForm() {
  const [state, setState] = useState<{ status: "idle" | "submitting" | "success" | "error"; message?: string; caseNumber?: string }>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/rebate-applications", { method: "POST", body: new FormData(form) });
      const data = await response.json() as { error?: string; caseNumber?: string };
      if (!response.ok) return setState({ status: "error", message: data.error || "申請無法送出。" });
      form.reset();
      setState({ status: "success", caseNumber: data.caseNumber });
    } catch {
      setState({ status: "error", message: "網路連線失敗，請稍後再試。" });
    }
  }

  if (state.status === "success") return <section className="border border-gold/40 bg-gold/[0.04] p-6 sm:p-10" role="status"><p className="eyebrow">申請已收到</p><h2 className="mt-4 text-3xl font-semibold text-white">BiBeck 將核對你的帳戶與返傭資格。</h2><p className="mt-5 text-sm leading-7 text-secondary">案件編號：<strong className="text-white">{state.caseNumber}</strong>。我們不會透過此流程要求你的 Bybit 密碼、驗證碼、API Key、API Secret 或資產轉移。</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/calculator" className="cta-button button-primary">回到交易成本計算器</Link><a href="https://bybackoffice.com/user-login" target="_blank" rel="noopener noreferrer" className="cta-button button-secondary">登入 Bybit 返傭後台</a></div></section>;

  return <form onSubmit={submit} className="grid gap-6 border border-white/12 bg-[#111] p-6 sm:p-10">
    <input type="hidden" name="exchange" value="bybit"/><input type="hidden" name="source" value="native-application"/>
    <label className="application-field">名稱／稱呼<input className="calculator-input" name="displayName" required minLength={2} maxLength={50} autoComplete="name"/></label>
    <label className="application-field">Email<input className="calculator-input" name="contactEmail" type="email" required maxLength={254} autoComplete="email"/></label>
    <label className="application-field">Bybit UID<input className="calculator-input" name="uid" required inputMode="numeric" pattern="[0-9]{4,24}" maxLength={24} aria-describedby="uid-help"/><span id="uid-help">請輸入 4 至 24 位數字。</span></label>
    <label className="application-field">申請類型<select className="calculator-input" name="applicationType" required defaultValue=""><option value="" disabled>請選擇</option><option value="standard">一般返傭</option><option value="high-volume">高交易量</option><option value="quant-bot">量化 / Bot</option><option value="community-partner">KOL / 社群 / 代理</option><option value="other">其他合作</option></select></label>
    <label className="application-field">最近 30 日交易量<select className="calculator-input" name="volumeRange" required defaultValue=""><option value="" disabled>請選擇</option><option value="under-10m">未滿 10M USDT</option><option value="10m-50m">10M–50M USDT</option><option value="50m-200m">50M–200M USDT</option><option value="over-200m">200M USDT 以上</option><option value="uncertain">不確定</option></select></label>
    <label className="application-field">補充說明（選填）<textarea className="calculator-input" name="message" rows={5} maxLength={2_000}/></label>
    <label className="hidden" aria-hidden="true">網站<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <label className="flex items-start gap-3 text-sm leading-6 text-secondary"><input type="checkbox" name="accuracyConfirmed" value="true" required className="mt-1 accent-[var(--gold)]"/>我確認以上資料正確。</label>
    <label className="flex items-start gap-3 text-sm leading-6 text-secondary"><input type="checkbox" name="privacyConsent" value="true" required className="mt-1 accent-[var(--gold)]"/><span>我已閱讀並同意 <Link className="text-link inline" href="/privacy">隱私權政策</Link>與<Link className="text-link inline" href="/personal-data-notice">個人資料蒐集告知</Link>。</span></label>
    {siteKey ? <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive"/><div className="cf-turnstile" data-sitekey={siteKey}/></> : <input type="hidden" name="cf-turnstile-response" value="test-turnstile-token"/>}
    {state.status === "error" ? <p className="text-sm text-red-300" role="alert">{state.message}</p> : null}
    <button className="button-primary w-full" disabled={state.status === "submitting"} type="submit">{state.status === "submitting" ? "送出中…" : "送出 35% 返傭申請"}</button>
    <p className="text-xs leading-6 text-white/44">BiBeck 不會要求交易密碼、2FA 驗證碼、API Key、API Secret、私鑰、助記詞或資產轉移。</p>
  </form>;
}
