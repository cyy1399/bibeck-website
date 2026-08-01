"use client";

import { useState, type FormEvent } from "react";

export function HighVolumeAdminActions({ id, currentRate }: { id: string; currentRate: number | null }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const approvedRate = Number(new FormData(event.currentTarget).get("approvedRate"));
    const response = await fetch(`/api/admin/high-volume-applications/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedRate }),
    });
    const payload = await response.json() as { error?: string };
    setMessage(response.ok ? "預審已核准並寄出啟用指引。" : payload.error || "更新失敗");
    setBusy(false);
    if (response.ok) location.reload();
  }

  return <form onSubmit={submit} className="mt-8 border border-gold/30 bg-gold/[0.03] p-5">
    <h2 className="text-xl font-semibold text-white">核准預審比例</h2>
    <p className="mt-2 text-sm leading-7 text-secondary">此比例只是啟用案件的預審依據；仍須提交 UID 並確認外部後台設定後才會生效。</p>
    <div className="mt-5 flex flex-wrap items-end gap-3">
      <label className="text-sm text-white">暫定比例（%）<input className="calculator-input mt-2 block" name="approvedRate" type="number" min="20" max="100" step="0.01" defaultValue={currentRate ?? 20} required /></label>
      <button className="button-primary" type="submit" disabled={busy}>{busy ? "處理中…" : "核准並寄送啟用 CTA"}</button>
    </div>
    {message ? <p className="mt-4 text-sm text-secondary" role="status">{message}</p> : null}
  </form>;
}
