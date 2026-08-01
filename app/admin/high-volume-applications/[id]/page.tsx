import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HighVolumeAdminActions } from "@/components/HighVolumeAdminActions";
import { requireAdmin } from "@/lib/admin-auth";
import { getHighVolumePreReview } from "@/lib/rebate-case-store";

export const metadata: Metadata = { title: "高交易量預審詳情｜BiBeck Operations", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function HighVolumeApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/high-volume-applications/${id}`);
  const item = await getHighVolumePreReview(id);
  if (!item) notFound();
  return <main className="min-h-screen bg-[#0a0a0a] px-5 py-12 text-white"><div className="mx-auto max-w-4xl"><p className="eyebrow">High-volume pre-review</p><h1 className="mt-3 text-3xl font-semibold">{item.caseNumber}</h1><dl className="mt-8 grid gap-5 border border-white/10 bg-[#121212] p-6 sm:grid-cols-2">{[["稱呼",item.displayName],["Email",item.contactEmail],["目前 UID",item.currentUid || "—"],["狀態",item.status],["核准比例",item.approvedRate === null ? "—" : `${item.approvedRate}%`],["完整申請資料",JSON.stringify(item.applicationData, null, 2)]].map(([label,value]) => <div key={label} className={label === "完整申請資料" ? "sm:col-span-2" : ""}><dt className="text-xs text-secondary">{label}</dt><dd className="mt-2 whitespace-pre-wrap break-words text-sm">{value}</dd></div>)}</dl><HighVolumeAdminActions id={id} currentRate={item.approvedRate} /></div></main>;
}
