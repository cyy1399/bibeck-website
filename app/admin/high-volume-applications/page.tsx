import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listHighVolumePreReviews } from "@/lib/rebate-case-store";

export const metadata: Metadata = { title: "高交易量預審｜BiBeck Operations", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function HighVolumeApplicationsPage() {
  await requireAdmin("/admin/high-volume-applications");
  const cases = await listHighVolumePreReviews();
  return <main className="min-h-screen bg-[#0a0a0a] px-5 py-12 text-white"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">BiBeck Operations</p><h1 className="mt-3 text-3xl font-semibold">高交易量預審案件</h1></div><Link href="/admin/rebate-applications" className="text-link">返傭啟用案件</Link></div>
    <div className="mt-8 overflow-x-auto border border-white/10"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-white/5 text-secondary"><tr>{["案件編號","稱呼","Email","UID","狀態","核准比例","申請時間"].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-white/10">{cases.map((item) => <tr key={item.id}><td className="px-4 py-4"><Link href={`/admin/high-volume-applications/${item.id}`} className="text-gold">{item.caseNumber}</Link></td><td className="px-4">{item.displayName}</td><td className="px-4">{item.contactEmail}</td><td className="px-4">{item.currentUid || "—"}</td><td className="px-4">{item.status}{item.notificationError ? "（通知待重送）" : ""}</td><td className="px-4">{item.approvedRate === null ? "—" : `${item.approvedRate}%`}</td><td className="px-4">{item.createdAt.toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })}</td></tr>)}</tbody></table></div>
  </div></main>;
}
