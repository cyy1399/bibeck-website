import {TraderPage} from "@/components/TraderUI";
import {PositionPlanner} from "@/components/PositionPlanner";
import {createPageMetadata} from "@/config/seo";
export const metadata=createPageMetadata({title:"合約倉位與風險計算",description:"用損失預算、費用、滑價與數量步進，規劃線性 USDT 合約倉位。",path:"/tools/position"});
export default async function Page({searchParams}:{searchParams:Promise<{demo?:string}>}){return <TraderPage kicker="TRADE PLANNER" title="先決定損失，再決定倉位。" copy="輸入價格與可承擔風險，看清楚這一筆交易的成本與計畫。"><PositionPlanner demo={(await searchParams).demo==='1'}/></TraderPage>}
