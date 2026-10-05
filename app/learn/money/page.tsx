import type { Metadata } from "next";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TopicGrid } from "@/components/Editorial";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata=createPageMetadata({title:"Money｜現金流、財務安全與人生資本",description:"理解收入、支出、資產、負債、現金流與人生資本如何共同影響財務選擇。",path:"/learn/money"});
const topics=[{title:"現金流",copy:"收入進來之後，實際留下多少與流向哪裡。"},{title:"Financial Runway",copy:"在沒有新收入時，流動資源能支撐必要支出多久。"},{title:"緊急預備金",copy:"不是固定答案，而是責任、穩定度與風險的緩衝。"},{title:"人生資本",copy:"技能、收入能力、選擇權與未來時間也是資本。"},{title:"負債負擔",copy:"利率、期限與每月付款如何壓縮未來選擇。"},{title:"資產配置",copy:"讓不同資產服務不同時間與目的。"}] as const;
export default function MoneyPage(){return <SiteShell><PageHero eyebrow="MONEY" title="先看懂你的現金流，再談資產往哪裡去。" copy="金錢管理不是把每一筆支出變成罪惡感，而是辨識安全、責任、選擇與未來之間的關係。"/><section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><TopicGrid topics={topics}/></div></section></SiteShell>}
