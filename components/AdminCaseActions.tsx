"use client";

import { useState, type FormEvent } from "react";
import { rebateStatusLabels, statusTransitions, type RebateActivationStatus } from "@/config/rebate-activation";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return <button type="button" className="text-xs text-gold underline" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); }}>{copied ? "已複製" : `複製${label}`}</button>;
}

export function AdminCaseActions({ id, displayName, uid, email, status, hasNotificationError }: { id: string; displayName: string; uid: string; email: string; status: RebateActivationStatus; hasNotificationError: boolean }) {
  const [completeOpen, setCompleteOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const allowedStatusChanges = statusTransitions[status].filter((item) => item !== "COMPLETED");

  async function post(payload: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/rebate-requests/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setMessage(data.error || "更新失敗"); return; }
      location.reload();
    } catch { setMessage("更新失敗，請稍後再試。"); }
    finally { setBusy(false); }
  }

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await post({ ...Object.fromEntries(data), notifyUser: data.get("notifyUser") === "true" });
  }

  return <section className="border border-white/10 bg-[#121212] p-6"><h2 className="text-xl font-semibold text-white">案件操作</h2>
    {status === "PENDING" ? <button type="button" onClick={() => setCompleteOpen(true)} className="button-primary mt-5 w-full">確認已開通</button> : null}
    {allowedStatusChanges.length > 0 ? <form onSubmit={update} className="mt-5 grid gap-4"><label className="text-sm text-secondary">其他狀態<select name="newStatus" required className="calculator-input mt-2 w-full"><option value="">請選擇</option>{allowedStatusChanges.map((item) => <option key={item} value={item}>{rebateStatusLabels[item]}</option>)}</select></label><label className="text-sm text-secondary">使用者公開說明<textarea name="publicMessage" rows={3} maxLength={1000} className="calculator-input mt-2 w-full" /></label><label className="text-sm text-secondary">管理員內部備註<textarea name="internalMessage" rows={3} maxLength={2000} className="calculator-input mt-2 w-full" /></label><label className="flex items-start gap-3 text-sm leading-6 text-secondary"><input type="checkbox" name="notifyUser" value="true" defaultChecked className="mt-1 accent-[var(--gold)]" />寄送狀態通知 Email；需要補件時系統仍會強制寄送。</label><button disabled={busy} className="button-secondary w-full" type="submit">更新案件</button></form> : <p className="mt-4 text-sm text-secondary">案件已結束；如需更正，應另行建立可稽核的營運處理紀錄。</p>}
    {hasNotificationError && status === "COMPLETED" ? <button disabled={busy} type="button" onClick={() => post({ retryNotification: true })} className="button-secondary mt-5 w-full">重新寄送通知</button> : null}
    {message ? <p className="mt-4 text-sm text-red-300" role="status">{message}</p> : null}
    {completeOpen ? <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-5" role="dialog" aria-modal="true" aria-labelledby="complete-title"><form onSubmit={async (event) => { event.preventDefault(); const confirmed = new FormData(event.currentTarget).get("completionConfirmed") === "true"; await post({ newStatus: "COMPLETED", completionConfirmed: confirmed }); }} className="w-full max-w-lg border border-gold/40 bg-[#121212] p-6"><h3 id="complete-title" className="text-2xl font-semibold text-white">確認已完成 Bybit 返傭設定？</h3><dl className="mt-5 space-y-2 text-sm text-secondary"><div>名稱：{displayName}</div><div>UID：{uid}</div><div>Email：{email}</div><div>設定比例：20%</div></dl><label className="mt-5 flex items-start gap-3 text-sm leading-6 text-white"><input type="checkbox" name="completionConfirmed" value="true" required className="mt-1 accent-[var(--gold)]" />我已在外部返傭後台完成此 UID 的 20% 返傭設定。</label><div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setCompleteOpen(false)} className="button-secondary">取消</button><button type="submit" disabled={busy} className="button-primary">確認並寄送通知</button></div></form></div> : null}
  </section>;
}
