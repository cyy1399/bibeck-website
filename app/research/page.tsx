import Link from "next/link";
import {TraderPage,Notice} from "@/components/TraderUI";
import {ResearchCalculator} from "@/components/ResearchCalculator";
import {createPageMetadata} from "@/config/seo";
export const metadata=createPageMetadata({title:"策略研究",description:"期望值試算、策略假設與樣本外驗證流程。",path:"/research"});
export default function Page(){return <TraderPage kicker="STRATEGY RESEARCH" title="讓策略可以被驗證，也可以被否定。" copy="保存假設、計入成本，再比較回測、模擬與實盤的差異。"><ResearchCalculator/><section className="trader-section"><h2>一份研究應該包含</h2><div className="trader-grid">{[['01','規則與資料','標的、期間、進出場、風險、參數與當時可取得的資料。'],['02','成交與成本','費用、資金費率、滑價、部分成交與流動性假設。'],['03','驗證與版本','保留全部嘗試；樣本外、不同環境、模擬與實盤分開。']].map(([n,t,c])=><article className="trader-panel" key={n}><p className="eyebrow">{n}</p><h2 className="mt-4">{t}</h2><p>{c}</p></article>)}</div></section><Notice>目前可使用期望值試算與研究指南。歷史重播、策略回測、程式執行與 AI 研究助手尚未開放。</Notice><div className="trader-tabs"><Link href="/learn/backtest">回測可信度指南 ↗</Link><Link href="/tools/journal">檢查實際交易結果 ↗</Link><Link href="/roadmap">研究功能進度 ↗</Link></div></TraderPage>}
