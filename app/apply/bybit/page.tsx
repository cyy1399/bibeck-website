import type { Metadata } from "next";
import Link from "next/link";
import { BybitApplicationForm } from "@/components/BybitApplicationForm";
import { PageHero, SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { brandConfig } from "@/config/brand";
import { BYBIT_REGISTER, LINE_OFFICIAL_URL } from "@/config/links";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "申請 Bybit 35% 返傭", description: "依序註冊 Bybit、在 BiBeck 官網提交 UID，並透過 Email 接收 35% 返傭申請審核結果。", path: "/apply/bybit" });

const steps = [
  { number:"01", title:"透過 BiBeck 指定連結註冊 Bybit 帳號", copy:"只有透過 BiBeck 指定推薦連結成功建立推薦關係的 Bybit 帳號，才能進入 BiBeck 返傭開通流程。" },
  { number:"02", title:"填寫返傭申請", copy:"完成 Bybit 註冊後，提交名稱、Email、Bybit UID 與最近 30 日交易量，BiBeck 將依 UID 核對推薦關係。" },
  { number:"03", title:"等待審核通知", copy:"BiBeck 完成核對後，會透過 Email 通知申請結果與後續開通資訊。" },
] as const;

export default function ApplyBybitPage() {
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "首頁", item: brandConfig.websiteUrl }, { "@type": "ListItem", position: 2, name: "申請 Bybit 35% 返傭", item: `${brandConfig.websiteUrl}/apply/bybit` }] };
  return <SiteShell>
    <PageHero eyebrow="Bybit 35% 返傭" title="申請 BiBeck 35% 返傭" copy="請先透過 BiBeck 指定連結註冊 Bybit 帳戶，再提交申請。BiBeck 不會要求你的交易密碼、驗證碼、API Key 或資產轉移。"/>
    <section className="px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl">
      <SectionTitle label="一般返傭申請" title="註冊、提交、等待 Email 通知。" copy="未透過 BiBeck 指定連結成功建立推薦關係的帳號，無法取得 BiBeck 返傭。"/>
      <ol className="mt-10 grid gap-px bg-white/10 md:grid-cols-3">{steps.map((step)=><li key={step.number} className={`bg-[#111] p-6 sm:p-8 ${step.number === "01" ? "ring-1 ring-inset ring-gold/60" : ""}`}><span className="font-mono text-gold">{step.number}</span><h2 className="mt-4 text-xl font-semibold leading-8">{step.title}</h2><p className="mt-4 text-sm leading-7 text-secondary">{step.copy}</p>{step.number === "01" ? <a href={BYBIT_REGISTER} target="_blank" rel="noopener noreferrer sponsored" className="cta-button button-primary mt-6 w-full">註冊 Bybit 返傭帳號</a> : null}</li>)}</ol>
      <aside className="mt-6 border-l-2 border-gold bg-black/20 p-5"><h2 className="font-semibold">已經有 Bybit 帳號？</h2><p className="mt-3 text-sm leading-7 text-secondary">原有帳戶是否可建立 BiBeck 推薦關係，需依 Bybit 帳戶狀態與官方規則確認。KYC 身分轉移不代表推薦關係自動轉移。</p><div className="mt-4 flex flex-wrap gap-4"><Link href="/rebate" className="text-link">查看返傭說明</Link><a href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="text-link">LINE 聯絡 BiBeck</a></div></aside>
      <div className="mx-auto mt-12 max-w-3xl"><h2 className="mb-6 text-2xl font-semibold">02｜填寫返傭申請</h2><BybitApplicationForm/><div className="mt-6 border border-white/10 p-5"><p className="font-semibold">申請過程有問題？</p><a href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="cta-button button-secondary mt-4">LINE 聯絡 BiBeck</a></div></div>
    </div></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }}/>
  </SiteShell>;
}
