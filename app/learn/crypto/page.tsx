import type { Metadata } from "next";
import { PageHero } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TopicGrid } from "@/components/Editorial";
import { createPageMetadata } from "@/config/seo";
export const metadata: Metadata=createPageMetadata({title:"Crypto｜資產、保管與市場風險",description:"理解 Bitcoin、Ethereum、Stablecoins、交易所、錢包、保管、槓桿及市場數據。",path:"/learn/crypto"});
const topics=["Bitcoin","Ethereum","Stablecoins","CEX","Wallet","Custody","Leverage","Funding","Open Interest","Liquidation"].map(title=>({title,copy:"釐清定義、用途、風險與最常見的誤解。"}));
export default function CryptoPage(){return <SiteShell><PageHero eyebrow="CRYPTO" title="Crypto 是資產世界的一部分，不是整個世界。" copy="參與之前，先理解資產本身、保管方式、平台風險、槓桿與市場結構。"/><section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><TopicGrid topics={topics}/></div></section></SiteShell>}
