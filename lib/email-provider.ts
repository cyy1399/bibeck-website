import { brandConfig } from "../config/brand.ts";
export type TransactionalEmail = { to: string | string[]; subject: string; html: string; replyTo?: string; idempotencyKey: string; attachments?: { filename: string; content: string }[] };
export async function sendTransactionalEmail(message: TransactionalEmail, fetcher: typeof fetch = fetch): Promise<void> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY; if (!apiKey) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  const response = await fetcher("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": message.idempotencyKey }, body: JSON.stringify({ from: process.env.EMAIL_FROM || `BiBeck <${brandConfig.internalEmails.primary}>`, to: Array.isArray(message.to) ? message.to : [message.to], reply_to: message.replyTo, subject: message.subject, html: message.html, attachments: message.attachments }) });
  if (!response.ok) throw new Error(`EMAIL_PROVIDER_FAILED_${response.status}`);
}
export function emailLayout(title: string, paragraphs: string[], rows: [string, string][], action?: { label: string; href: string }): string {
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#161616"><h1>${escapeEmailHtml(title)}</h1>${paragraphs.map((p) => `<p>${escapeEmailHtml(p)}</p>`).join("")}<table style="width:100%;border-collapse:collapse">${rows.map(([label, value]) => `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #ddd">${escapeEmailHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #ddd">${escapeEmailHtml(value)}</td></tr>`).join("")}</table>${action ? `<p style="margin-top:24px"><a href="${escapeEmailHtml(action.href)}">${escapeEmailHtml(action.label)}</a></p>` : ""}</div>`;
}
export function escapeEmailHtml(value: string): string { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character); }
