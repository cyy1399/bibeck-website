import Link from "next/link";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
export function TraderPage({kicker,title,copy,children}:{kicker:string;title:string;copy:string;children:ReactNode}){return <SiteShell><div className="trader-page"><header className="trader-page-head"><p className="eyebrow">{kicker}</p><h1>{title}</h1><p>{copy}</p></header>{children}</div></SiteShell>}
export function FeatureCard({number,title,copy,href,status}:{number?:string;title:string;copy:string;href:string;status?:string}){return <Link href={href} className="trader-feature focus-ring"><div className="flex justify-between gap-4"><span className="eyebrow">{number||"BIBECK"}</span><span className="trader-badge">{status||"閱讀"}</span></div><h2>{title} <span aria-hidden="true">↗</span></h2><p>{copy}</p></Link>}
export function Notice({children}:{children:ReactNode}){return <div className="trader-notice">{children}</div>}
export function Metric({label,value,detail}:{label:string;value:string;detail?:string}){return <div className="trader-metric"><p>{label}</p><strong>{value}</strong>{detail&&<small>{detail}</small>}</div>}
