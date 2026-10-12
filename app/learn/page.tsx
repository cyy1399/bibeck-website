import {TraderPage,FeatureCard} from "@/components/TraderUI";
import {lessons} from "@/config/trader-content";
import {createPageMetadata} from "@/config/seo";
export const metadata=createPageMetadata({title:"合約交易學習",description:"從槓桿、強平、費用與回測疑問開始，建立可核對的交易理解。",path:"/learn"});
export default function Page(){return <TraderPage kicker="LEARN THROUGH QUESTIONS" title="從你真正遇到的問題開始。" copy="先理解機制，再用工具核對；學習成果是更清楚的判斷，不是交易次數。"><div className="trader-grid">{lessons.map((l,i)=><FeatureCard key={l.slug} number={`0${i+1}`} title={l.title} copy={l.summary} href={`/learn/${l.slug}`}/>)}</div></TraderPage>}
