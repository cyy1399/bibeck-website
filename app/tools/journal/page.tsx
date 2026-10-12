import {TraderPage} from "@/components/TraderUI";
import {TradeJournal} from "@/components/TradeJournal";
import {createPageMetadata} from "@/config/seo";
export const metadata=createPageMetadata({title:"交易日誌與績效分析",description:"匯入標準 CSV，核對交易淨結果、費用、期望值與回撤。",path:"/tools/journal"});
export default function Page(){return <TraderPage kicker="JOURNAL & PERFORMANCE" title="知道你靠什麼賺，又在哪裡失去。" copy="先整理已完成交易，再把成本、樣本與策略分開看。"><TradeJournal/></TraderPage>}
