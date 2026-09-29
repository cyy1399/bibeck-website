import type { Metadata } from "next";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TopicGrid } from "@/components/Editorial";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata=createPageMetadata({title:"Trading｜交易者要看的數據",description:"理解總體、市場與執行數據是什麼、為什麼重要、如何搭配，以及常見誤解。",path:"/learn/trading"});
const topics=[{title:"Macro",copy:"CPI、PCE、NFP、JOLTS、GDP 與 Fed。"},{title:"Funding Rate",copy:"永續合約多空持倉間的定期資金交換。",href:"/learn/trading/funding-rate"},{title:"Open Interest",copy:"市場尚未平倉合約的總量。"},{title:"Liquidation",copy:"槓桿部位因保證金不足而被強制平倉。"},{title:"Basis & Volume",copy:"期限價差與成交活動的脈絡。"},{title:"Execution",copy:"Spread、Slippage 與 Maker/Taker 成本。"}] as const;
export default function TradingPage(){return <SiteShell><PageHero eyebrow="TRADER DATA" title="交易者到底要看什麼？" copy="每個數據都需要定義、時間與其他指標。單一數字不是因果，也不是漲跌保證。"/><section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><TopicGrid topics={topics}/></div></section></SiteShell>}
