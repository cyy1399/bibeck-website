import type { Metadata } from "next";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { BUSINESS_EMAIL, BUSINESS_PARTNERSHIP_MAILTO, HIGH_VOLUME_EMAIL_MAILTO as HIGH_VOLUME_MAILTO, LINE_OFFICIAL_URL } from "@/config/links";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "BiBeck 高交易量與合作方案｜交易者、KOL、量化與社群合作",
  description: "BiBeck 為高交易量交易者、量化團隊、交易 Bot、KOL、內容創作者與交易社群提供交易成本分析、35% 標準返傭與客製合作方案評估。",
  path: "/partners",
});

const reviewItems = ["交易量", "VIP", "Maker / Taker", "有效費率", "交易模式", "合作需求"] as const;
const partnerTypes = ["KOL / 內容創作者", "交易社群", "量化團隊", "交易 Bot", "TradingView 創作者", "交易工具／服務商"] as const;
const partnerCapabilities = ["使用者 35% 標準返傭方案", "合作分潤", "專屬合作追蹤", "聯名內容", "活動合作", "專屬合作頁面", "其他客製合作"] as const;

export default function PartnersPage() {
  return <SiteShell>
    <PageHero eyebrow="高交易量與商務合作" title="高交易量與商務合作方案" copy="BiBeck 為高交易量交易者、量化團隊、交易社群、內容創作者與交易工具提供進一步的交易成本與合作方案評估。" actions={<><a className="cta-button button-primary" href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer">加入 LINE 洽談合作</a><a className="cta-button button-secondary" href={BUSINESS_PARTNERSHIP_MAILTO}>Email 聯絡</a></>} />
    <section id="high-volume" className="scroll-mt-24 px-5 py-20 sm:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]"><SectionTitle label="高交易量交易者" title="交易量越大，費率差異越值得被認真處理。" copy="BiBeck 標準返傭為 35%。如果你有較高交易量、專業交易、Bot、Quant 或做市需求，我們可以依實際交易結構進一步評估交易成本與合作條件。"/><div className="border border-gold/40 bg-gold/[0.04] p-6 sm:p-8"><h2 className="text-xl font-semibold">評估重點</h2><ul className="mt-5 grid gap-3 sm:grid-cols-2">{reviewItems.map((item)=><li key={item} className="border-l border-gold/50 pl-3 text-sm text-secondary">{item}</li>)}</ul><p className="mt-6 text-xs leading-6 text-white/44">高交易量方案屬於個別合作條件評估，不代表自動取得高於 35% 的返傭或不同 Bybit 官方費率。</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><a className="cta-button button-primary" href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer">LINE 洽談高交易量方案</a><a className="cta-button button-secondary" href={HIGH_VOLUME_MAILTO}>Email 聯絡</a></div></div></div></section>
    <section className="section-muted border-y border-white/10 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><SectionTitle label="商務合作" title="與交易者一起成長" copy="如果你經營交易社群、內容、量化策略、Bot 或交易工具，BiBeck 可依實際導入、交易活動與合作模式，評估適合的商務合作方案。"/><div className="mt-10 grid gap-6 lg:grid-cols-2"><article className="border border-white/12 bg-[#111] p-6"><h2 className="text-xl font-semibold">適合對象</h2><ul className="mt-5 grid gap-3 sm:grid-cols-2">{partnerTypes.map((item)=><li key={item} className="text-sm text-secondary">— {item}</li>)}</ul></article><article className="border border-white/12 bg-[#111] p-6"><h2 className="text-xl font-semibold">可評估的合作方式</h2><ul className="mt-5 grid gap-3 sm:grid-cols-2">{partnerCapabilities.map((item)=><li key={item} className="text-sm text-secondary">— {item}</li>)}</ul></article></div><div className="mt-8 flex flex-col items-start gap-4"><div className="flex flex-col gap-3 sm:flex-row"><a className="cta-button button-primary" href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer">LINE 洽談合作</a><a className="cta-button button-secondary" href={BUSINESS_PARTNERSHIP_MAILTO}>Email 聯絡</a></div><p className="break-words text-sm text-secondary">合作 Email：<a className="text-link break-all" href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a></p></div></div></section>
    <section className="px-5 pb-20 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice/></div></section>
  </SiteShell>;
}
