import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { moneyStages, stageHref } from "@/config/money-roadmap";
import { createPageMetadata } from "@/config/seo";
export const metadata = createPageMetadata({ title: "理財流程", description: "從財務盤點、收支與預算，到安全、資產累積與財富自由的八個階段。", path: "/money" });
export default function MoneyPage() {
  return <SiteShell><section className="px-5 pb-20 pt-32 sm:px-8 sm:pt-40"><div className="mx-auto max-w-5xl"><p className="eyebrow">從開始理財，到財富自由</p><h1 className="mt-6 text-4xl font-semibold text-white sm:text-6xl">理財，一步一步來。</h1><p className="mt-6 max-w-2xl text-base leading-8 text-secondary">先知道自己的錢，再安排生活，逐步累積選擇。點選階段，查看要做什麼、做到什麼程度。</p><p className="mt-4 text-sm leading-7 text-white/45">這是 BiBeck 的行動路徑。依現況選擇起點；債務與預備金可並行，紀錄與檢視需持續。</p><ol className="mt-12 border-t border-white/12">{moneyStages.map((stage, index) => <li key={stage.slug}><Link href={stageHref(stage)} className="focus-ring group grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b border-white/12 py-6 hover:bg-white/[0.025] sm:grid-cols-[3rem_1fr_auto] sm:px-4"><span className="text-sm text-gold">{String(index + 1).padStart(2, "0")}</span><div><h2 className="text-xl font-medium text-white group-hover:text-gold">{stage.title}</h2><p className="mt-2 text-sm leading-7 text-secondary">{stage.summary}</p></div><span aria-hidden="true" className="text-gold">→</span></Link></li>)}</ol><p className="mt-8 text-sm leading-7 text-white/45">階段是行動與檢查清單，不是收入、身價或人生的排名。</p></div></section></SiteShell>;
}
