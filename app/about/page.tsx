import Link from "next/link";
import {TraderPage,Notice} from "@/components/TraderUI";
import {createPageMetadata} from "@/config/seo";
export const metadata=createPageMetadata({title:"關於 BiBeck",description:"讓交易計畫、成交、成本與檢討連成可以核對的工作流程。",path:"/about"});
export default function Page(){return <TraderPage kicker="ABOUT BIBECK" title="每個決定有依據，每個結果能核對。" copy="BiBeck 是為加密貨幣合約交易者建立的工作平台。"><div className="trader-prose"><section><h2>為什麼建立 BiBeck？</h2><p>交易者可以取得很多圖表與資訊，卻仍難以回答：這一筆承擔多少風險？費用花在哪裡？策略是否真的有效？我們把規劃、紀錄、成本與檢討連起來，讓答案可以追查。</p></section><section><h2>我們的原則</h2><p>資料與推估分開、費率與返傭分開、觀測績效與未來預期分開。遇到資料缺漏、樣本不足與服務限制，明確說明，不用漂亮的結果掩蓋。</p></section><section><h2>從 Beck 手上的資源開始</h2><p>BiBeck 由 Beck 持續建立。交易成本與合作資源是起點，交易者的工作流程是方向；網站會隨研究、驗證與回饋修正。</p></section><Notice>BiBeck 不保管資產，不承諾交易獲利。合作收入會揭露；不為增加返傭而鼓勵使用者提高交易量。</Notice><div className="trader-tabs"><Link href="/roadmap">功能進度</Link><Link href="/affiliate-disclosure">合作揭露</Link><Link href="/contact">聯絡與回饋</Link></div></div></TraderPage>}
