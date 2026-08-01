import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "@/components/AdminCaseActions";
import { rebateActivationStatuses, rebateStatusLabels, type RebateActivationStatus } from "@/config/rebate-activation";
import { requireAdmin } from "@/lib/admin-auth";
import { listActivationCases } from "@/lib/rebate-case-store";

export const metadata: Metadata = { title: "Bybit 返傭開通申請｜BiBeck Operations", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin("/admin/rebate-requests");
  const params = await searchParams;
  const status = rebateActivationStatuses.includes(params.status as RebateActivationStatus) ? params.status as RebateActivationStatus : undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const cases = await listActivationCases({ query: params.q, status, page });
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (status) query.set("status", status);
  const pageHref = (nextPage: number) => { const next = new URLSearchParams(query); next.set("page", String(nextPage)); return `?${next}`; };

  return <main className="min-h-screen bg-[#0a0a0a] px-5 py-12 text-white"><div className="mx-auto max-w-7xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">BiBeck Operations</p><h1 className="mt-3 text-3xl font-semibold">Bybit 返傭開通申請</h1></div><Link href="/" className="text-link">返回網站</Link></div>
    <form className="mt-8 grid gap-3 border border-white/10 bg-[#121212] p-5 md:grid-cols-[1fr_14rem_auto]"><input className="calculator-input" name="q" defaultValue={params.q} placeholder="搜尋名稱、UID 或 Email" /><select className="calculator-input" name="status" defaultValue={status || ""}><option value="">所有狀態</option>{rebateActivationStatuses.map((item) => <option key={item} value={item}>{rebateStatusLabels[item]}</option>)}</select><button className="button-primary" type="submit">搜尋</button></form>
    <div className="mt-6 overflow-x-auto border border-white/10"><table className="w-full min-w-[1080px] text-left text-sm"><thead className="bg-white/5 text-secondary"><tr>{["名稱或稱呼", "Bybit UID", "Email", "申請時間", "返傭比例", "狀態", "操作"].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-white/10">{cases.map((item) => <tr key={item.id} className={item.notificationStatus === "FAILED" ? "bg-red-950/20" : ""}>
      <td className="px-4 py-4">{item.displayName}</td>
      <td className="px-4 font-mono">{item.uid}<span className="ml-2"><CopyButton value={item.uid} label=" UID" /></span></td>
      <td className="px-4">{item.contactEmail}<span className="ml-2"><CopyButton value={item.contactEmail} label=" Email" /></span></td>
      <td className="px-4">{item.createdAt.toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })}</td><td className="px-4">20%</td><td className="px-4">{rebateStatusLabels[item.status as RebateActivationStatus]}{item.notificationStatus === "FAILED" ? <span className="ml-2 text-red-300">通知失敗</span> : null}</td><td className="px-4"><Link href={`/admin/rebate-requests/${item.id}`} className="text-gold">查看完整案件</Link></td>
    </tr>)}</tbody></table></div>
    <div className="mt-6 flex justify-end gap-3">{page > 1 ? <Link className="button-secondary" href={pageHref(page - 1)}>上一頁</Link> : null}{cases.length === 50 ? <Link className="button-secondary" href={pageHref(page + 1)}>下一頁</Link> : null}</div>
  </div></main>;
}
