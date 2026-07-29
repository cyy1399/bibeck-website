import type { Metadata } from "next";
import { HighVolumeApplicationForm } from "@/components/HighVolumeApplicationForm";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "高交易量快速審核", description: "提交可驗證的近期交易紀錄，申請 BiBeck 較高的暫定初始返傭比例。", path: "/high-volume-application" });

const reviewFactors = ["可驗證的歷史交易量", "最近 30 日與 90 日月均中的較低者", "交易量穩定度", "實際手續費貢獻", "未來交易量可信度", "合作價值、帳戶狀態與合規風險"];
const decisions = [
  ["核准", "核准暫定初始比例，首個完整交易月份後重新審核。"],
  ["有條件核准", "先採較保守比例，達成首月條件後再調整。"],
  ["補件", "補充最近 90 日交易量或可識別 UID 的交易紀錄。"],
  ["不適用快速審核", "先適用標準交易者 20%，之後依每月實際交易量調整。"],
] as const;

export default function HighVolumeApplicationPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="人工審核" title="高交易量快速審核" copy="已有穩定交易紀錄的交易者，可提交近期交易量證明，申請較高的初始返傭比例。最終比例仍須人工審核，不保證核准。" />
      <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-5xl">
        <SectionTitle label="審核原則" title="以可驗證紀錄為主，不採信單一預估數字" copy="主要認定交易量原則上採最近 30 日與最近 90 日平均月交易量中的較低者，並綜合穩定度、費率與帳戶狀態評估。" />
        <div className="mt-8 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">{reviewFactors.map((item) => <div key={item} className="min-w-0 bg-[#121212] p-5 text-sm leading-7 text-secondary">{item}</div>)}</div>
        <div className="mt-8 border-l-2 border-gold bg-[#101010] p-6 text-sm leading-7 text-secondary"><strong className="text-white">30 日觀察期</strong><p className="mt-2">核准的初始返傭比例為暫定級距。首個完整交易月份結束後，將依實際交易量重新審核，結果可能升等、維持、延長觀察或降等；幾乎無交易量時可降回標準交易者 20%。</p></div>
        <div className="mt-12"><SectionTitle label="審核結果" title="不只有通過或拒絕" copy="初步核准不代表返傭已生效，仍需完成指定帳戶註冊、UID 歸戶及必要驗證。" /><div className="mt-7 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">{decisions.map(([title, copy]) => <article key={title} className="min-w-0 bg-[#121212] p-6"><h3 className="font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-secondary">{copy}</p></article>)}</div></div>
        <div className="mt-12"><HighVolumeApplicationForm /></div>
      </div></section>
    </SiteShell>
  );
}
