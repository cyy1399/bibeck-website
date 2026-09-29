import type { Metadata } from "next";
import { PageHero } from "@/components/Sections";
import { SectionHeader } from "@/components/Editorial";
import { SiteShell } from "@/components/SiteShell";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata=createPageMetadata({title:"關於 BiBeck｜Builder、Learner、Operator",description:"BiBeck 從 Founder CYY 的學習與實作出發，建立能幫助人理解金錢、投資、Crypto 與交易成本的知識和工具。",path:"/philosophy"});
export default function PhilosophyPage(){return <SiteShell><PageHero eyebrow="ABOUT BIBECK" title="理解金錢，做更好的選擇。" copy="BiBeck 的定位是 Knowledge + Tools + Cost Optimization：先建立理解，再使用工具，最後才降低能降低的交易成本。"/><section className="px-5 py-20 sm:px-8"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]"><SectionHeader eyebrow="BUILDER · LEARNER · OPERATOR" title="Founder 是精神來源，不是所有答案的來源。"/><div className="article-prose"><p>我沒有所有答案。但我相信，金錢世界裡很多看似複雜的問題，都可以被拆解、計算與理解。</p><p>我建立 BiBeck，是因為我自己也正在經歷相同的過程：工作、累積資產、建立事業、學習投資，也會犯錯。</p><p>我希望把過程中真正有用的知識、數據與工具留下來。如果這些東西能幫助我做出更好的選擇，也希望它能幫助你。</p><p>因此 BiBeck 不以金融老師或 Guru 的姿態提供答案，也不提供喊單、明牌、買賣建議、報酬保證或行情方向預測。</p></div></div></section></SiteShell>}
