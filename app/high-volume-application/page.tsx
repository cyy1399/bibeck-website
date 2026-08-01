import type { Metadata } from "next";
import { HighVolumeApplicationForm } from "@/components/HighVolumeApplicationForm";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "申請提高返傭比例", description: "已完成 Bybit 20% 返傭開通且具穩定交易量的使用者，可提交資料申請提高返傭比例。", path: "/high-volume-application" });

const reviewFactors = ["可驗證的歷史交易量", "最近 30 日與 90 日月均中的較低者", "交易量穩定度", "實際手續費貢獻", "未來交易量可信度", "合作價值、帳戶狀態與合規風險"];
const decisions = [
  ["核准", "核准提高比例，後續仍會依實際交易紀錄重新審核。"],
  ["有條件核准", "先採較保守的提高比例，達成後續條件後再調整。"],
  ["補件", "補充最近 90 日交易量或可識別 UID 的交易紀錄。"],
  ["維持目前比例", "目前資料不足以提高比例，繼續適用已開通的 20% 方案。"],
] as const;

export default function HighVolumeApplicationPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="開通後申請" title="申請提高返傭比例" copy="所有一般 Bybit 返傭帳戶開通後，初始返傭比例為 20%。已完成開通且具備穩定交易量的使用者，可以另行申請提高返傭比例；最終結果仍須人工審核，不保證核准。" />
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-5xl">
        <SectionTitle label="審核原則" title="以可驗證紀錄為主，不採信單一預估數字" copy="主要認定交易量原則上採最近 30 日與最近 90 日平均月交易量中的較低者，並綜合穩定度、費率與帳戶狀態評估。" />
        <div className="mt-8 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">{reviewFactors.map((item) => <div key={item} className="min-w-0 bg-[#121212] p-5 text-sm leading-7 text-secondary">{item}</div>)}</div>
        <div className="mt-8 border-l-2 border-gold bg-[#101010] p-6 text-sm leading-7 text-secondary"><strong className="text-white">30 日觀察期</strong><p className="mt-2">核准提高後的返傭比例為暫定級距。觀察期結束後，將依實際交易量重新審核，結果可能升等、維持、延長觀察或降等。</p></div>
        <div className="mt-12"><SectionTitle label="審核結果" title="不只有通過或拒絕" copy="提高比例申請只適用於已完成 20% 開通的帳戶；核准與生效仍以人工設定及通知結果為準。" /><div className="mt-7 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">{decisions.map(([title, copy]) => <article key={title} className="min-w-0 bg-[#121212] p-6"><h3 className="font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-secondary">{copy}</p></article>)}</div></div>
        <div className="mt-12"><HighVolumeApplicationForm /></div>
      </div></section>
    </SiteShell>
  );
}
