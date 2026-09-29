import type { Metadata } from "next";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TopicGrid } from "@/components/Editorial";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata=createPageMetadata({title:"Investing｜風險、報酬與資產配置",description:"理解投資的風險與報酬、複利、分散、時間跨度、人生資本及負債與投資的取捨。",path:"/learn/investing"});
const topics=[{title:"Risk & Return",copy:"高預期報酬通常伴隨更大的不確定性與損失範圍。"},{title:"Compounding",copy:"時間能放大報酬，也會放大費用與錯誤。"},{title:"Diversification",copy:"避免單一事件決定全部結果。"},{title:"Time Horizon",copy:"資金使用時間決定能否等待市場恢復。"},{title:"Human Capital",copy:"職涯與收入穩定度會改變可承擔風險。"},{title:"Debt vs Investing",copy:"確定的借款成本與不確定的投資報酬需要分開比較。"}] as const;
export default function InvestingPage(){return <SiteShell><PageHero eyebrow="INVESTING" title="在追求報酬以前，先理解你承擔了什麼。" copy="投資不是尋找單一正確答案，而是在時間、風險、流動性與個人選擇之間建立一致的決策。"/><section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><TopicGrid topics={topics}/></div></section></SiteShell>}
