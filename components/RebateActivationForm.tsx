"use client";

import Link from "next/link";
import Script from "next/script";
import { useState, type FormEvent } from "react";

const inputClass = "calculator-input mt-2 w-full";
export function RebateActivationForm({ siteKey }: { siteKey: string }) {
  const [result, setResult] = useState<{ caseNumber: string; maskedUid: string } | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try {
      const response = await fetch("/api/rebate/activate", { method: "POST", body: new FormData(event.currentTarget), headers: { Accept: "application/json" } });
      const payload = await response.json() as { error?: string; caseNumber?: string; maskedUid?: string };
      if (!response.ok) throw new Error(payload.error || "申請無法送出，請稍後再試。");
      setResult({ caseNumber: payload.caseNumber!, maskedUid: payload.maskedUid! });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "申請無法送出，請稍後再試。"); }
    finally { setSubmitting(false); }
  }
  if (result) return <div className="border border-gold/35 bg-gold/[0.04] p-7" role="status"><p className="eyebrow">申請已送出</p><h2 className="mt-5 text-2xl font-semibold text-white">案件編號：{result.caseNumber}</h2><div className="mt-5 space-y-2 text-secondary"><p>Bybit UID：{result.maskedUid}</p><p>目前狀態：待人工設定</p><p>預設返傭比例：20%</p></div><p className="mt-5 text-sm leading-7 text-secondary">BiBeck 將核對您的 UID，並在外部返傭後台人工完成設定。設定完成後，系統會寄送 Email 通知。這個畫面只代表 BiBeck 已收到申請，不代表返傭已完成開通。</p></div>;
  return <form onSubmit={submit} className="grid gap-7 border border-white/10 bg-[#121212] p-6 sm:p-8" noValidate>
    <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" /><input type="hidden" name="exchange" value="bybit" /><input type="hidden" name="source" value="rebate-activation-page" />
    <div className="border-l-2 border-gold bg-black/25 p-5"><strong className="text-white">安全提醒</strong><p className="mt-2 text-sm leading-7 text-secondary">BiBeck 不會要求您的 Bybit 密碼、Email 驗證碼、簡訊驗證碼、Google Authenticator 驗證碼、API Secret、私鑰或助記詞。</p></div>
    <div className="grid gap-5 lg:grid-cols-3"><Field label="名稱或稱呼" name="displayName" placeholder="例如：王先生" minLength={2} maxLength={50} required /><Field label="Bybit UID" name="uid" placeholder="請輸入 Bybit 帳戶 UID" inputMode="numeric" pattern="[0-9]{4,24}" required hint="UID 是 BiBeck 核對帳戶及設定返傭比例的必要資料。" /><Field label="接收返傭設定通知的 Email" name="contactEmail" type="email" placeholder="name@example.com" required hint="只用於申請、補件及設定完成通知，可與 Bybit 登入 Email 不同。" /></div>
    <label className="flex items-start gap-3 text-sm leading-7 text-secondary"><input type="checkbox" name="consent" value="true" required className="mt-1.5 accent-[var(--gold)]" /><span>我已閱讀並同意《<Link href="/privacy" className="text-gold">隱私權政策</Link>》、《<Link href="/terms" className="text-gold">使用條款</Link>》及《<Link href="/personal-data-notice" className="text-gold">個人資料蒐集告知</Link>》，並同意 BiBeck 使用上述資料處理 Bybit 返傭開通申請。</span></label>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" /><div className="cf-turnstile" data-sitekey={siteKey} data-theme="dark" />
    {error ? <p role="alert" className="text-sm leading-7 text-red-300">{error}</p> : null}<button type="submit" disabled={submitting} className="button-primary w-full disabled:opacity-50">{submitting ? "送出中…" : "送出返傭開通申請"}</button>
  </form>;
}
type FieldProps = { label: string; name: string; type?: string; required?: boolean; hint?: string; placeholder?: string; minLength?: number; maxLength?: number; inputMode?: "numeric"; pattern?: string };
function Field({ label, hint, ...props }: FieldProps) { return <label className="min-w-0 text-sm font-medium text-white">{label}<input className={inputClass} {...props} />{hint ? <span className="mt-2 block text-xs leading-6 text-secondary">{hint}</span> : null}</label>; }
