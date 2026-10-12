import Link from "next/link";
import {notFound} from "next/navigation";
import {TraderPage,Notice} from "@/components/TraderUI";
import {lessons} from "@/config/trader-content";
import {createPageMetadata} from "@/config/seo";
export function generateStaticParams(){return lessons.map(l=>({topic:l.slug}));}
export async function generateMetadata({params}:{params:Promise<{topic:string}>}){const topic=(await params).topic;const lesson=lessons.find(x=>x.slug===topic);return lesson?createPageMetadata({title:lesson.title,description:lesson.summary,path:`/learn/${topic}`}):{};}
export default async function Page({params}:{params:Promise<{topic:string}>}){const topic=(await params).topic;const lesson=lessons.find(x=>x.slug===topic);if(!lesson)notFound();return <TraderPage kicker="TRADER KNOWLEDGE" title={lesson.title} copy={lesson.summary}><div className="trader-prose">{lesson.sections.map(s=><section key={s.title}><h2>{s.title}</h2><p>{s.body}</p></section>)}<Notice>機制依交易所、合約與帳戶模式而異。以下官方來源供核對，請以最新產品規則為準。</Notice><a href={lesson.source} target="_blank" rel="noopener noreferrer" className="text-gold">查看官方說明 ↗</a><div className="trader-tabs mt-8"><Link href={lesson.tool}>使用對應工具 ↗</Link><Link href="/learn">所有學習內容</Link></div></div></TraderPage>}
