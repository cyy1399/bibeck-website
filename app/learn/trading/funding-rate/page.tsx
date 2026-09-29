import type { Metadata } from "next";
import { ArticleLayout } from "@/components/ArticleLayout";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata=createPageMetadata({title:"Funding Rate 是什麼？｜交易數據",description:"理解永續合約 Funding Rate 的用途、判讀方式、重要時點、常見誤解與搭配指標。",path:"/learn/trading/funding-rate"});
export default function FundingRatePage(){return <ArticleLayout eyebrow="TRADER DATA · MARKET DATA" title="Funding Rate 是什麼？" description="它反映永續合約市場多空持倉間的定期資金交換，但不是單獨預測行情方向的訊號。" updatedAt="2026-09-29" sections={[
  {title:"這是什麼？",content:<p>Funding Rate 是永續合約為了讓合約價格貼近現貨價格，而由多方與空方之間定期交換的費用。費率方向與支付方會依交易所規則及市場狀態改變。</p>},
  {title:"為什麼要看？",content:<p>它能協助理解槓桿市場的持倉成本與擁擠程度。對持有永續合約的交易者而言，Funding 也是實際交易成本的一部分。</p>},
  {title:"怎麼看？",content:<p>先確認費率正負、結算週期與交易所計算方式，再觀察費率是否長時間偏離常態。不同交易所與合約不可直接假設完全相同。</p>},
  {title:"什麼時候特別重要？",content:<p>高槓桿需求、價格快速波動、重大事件前後，或部位需要跨越多個結算週期時，Funding 對成本與風險的影響會更明顯。</p>},
  {title:"常見誤解",content:<p>正 Funding 不代表價格一定下跌，負 Funding 也不代表價格一定上漲。費率可以反映擁擠，但市場可能維持擁擠很長時間。</p>},
  {title:"與其他指標如何搭配？",content:<p>可與 Open Interest、現貨與合約成交量、Basis、Liquidation 及價格結構一起觀察，以建立更完整的市場脈絡。</p>},
]} sources={[{label:"Bybit Help Center — Funding fee calculation",href:"https://www.bybit.com/en/help-center/article/Funding-fee-calculation"},{label:"CME Group — Understanding futures basis",href:"https://www.cmegroup.com/education/courses/introduction-to-futures/understanding-futures-basis.html"}]} related={[{label:"交易者要看的數據",href:"/learn/trading"},{label:"交易成本計算器",href:"/calculator"}]}/>}
