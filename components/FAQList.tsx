import Link from "next/link";
import { BYBIT_ACCOUNT_SUPPORT, HIGH_VOLUME_MAILTO, REBATE_APPLICATION_URL } from "@/config/links";

type FAQLink = { href: string; label: string; external?: boolean; sponsored?: boolean };
export type FAQItem = { question: string; answer: string; links?: FAQLink[]; category?: string };

export const generalFaqs: FAQItem[] = [
  { category:"返傭與成本", question:"BiBeck 標準返傭是多少？", answer:"一般符合資格且成功建立 BiBeck 推薦關係的帳戶，標準返傭為 35%。實際返傭仍依符合資格的交易手續費與系統紀錄為準。" },
  { category:"返傭與成本", question:"如果我產生 1,000 USDT 手續費，可以拿回多少？", answer:"若這 1,000 USDT 全部屬於符合返傭資格的交易手續費，以 35% 標準返傭試算，可取得 350 USDT 返傭。" },
  { category:"透明度", question:"BiBeck 怎麼賺錢？", answer:"以目前基礎合作條件為例，代理端取得 40% 的返傭分潤，BiBeck 將其中 35 個百分點返還給客戶，保留 5 個百分點作為服務與營運收入。高交易量與特殊合作條件依個別方案確認。" },
  { category:"安全與信任", question:"BiBeck 是 Bybit 官方平台嗎？", answer:"不是。BiBeck 為獨立第三方交易成本與返傭資訊平台，並非 Bybit 官方網站、關係企業或代表。" },
  { category:"安全與信任", question:"BiBeck 會要求我的密碼或驗證碼嗎？", answer:"不會。BiBeck 不會要求 Bybit 密碼、2FA 驗證碼、API Key、API Secret、私鑰、助記詞或資產轉移。" },
  { category:"帳戶與申請", question:"原本已有 Bybit 帳戶怎麼辦？", answer:"是否能建立 BiBeck 推薦關係，需依 Bybit 帳戶狀態與官方規則確認。KYC 身分轉移不等於推薦關係轉移。", links:[{href:BYBIT_ACCOUNT_SUPPORT,label:"查看 Bybit 官方帳戶說明",external:true}] },
  { category:"高交易量與合作", question:"高交易量可以談其他條件嗎？", answer:"可以。若你有較高交易量、量化、Bot、做市或其他專業交易需求，可進一步洽談返傭、VIP 與專屬費率條件，實際條件依個別方案確認。", links:[{href:HIGH_VOLUME_MAILTO,label:"洽談高交易量方案"}] },
  { category:"帳戶與申請", question:"如何申請 BiBeck 35% 返傭？", answer:"請在 BiBeck 官網原生申請頁提交名稱、Email、Bybit UID、申請類型與交易量區間。資料會由伺服器驗證並交由 BiBeck 人工核對。", links:[{href:REBATE_APPLICATION_URL,label:"開始申請"}] },
];

export const homeFaqs = generalFaqs.slice(0, 5);
export const bybitFaqs = generalFaqs;

export function FAQList({ items = generalFaqs, limit, grouped = false }: { items?: FAQItem[]; limit?: number; grouped?: boolean }) {
  const visible = typeof limit === "number" ? items.slice(0, limit) : items;
  const categories = grouped ? [...new Set(visible.map((item) => item.category).filter((value): value is string => Boolean(value)))] : [""];
  return <div className="grid gap-10">{categories.map((category) => { const categoryItems = grouped ? visible.filter((item) => item.category === category) : visible; return <section key={category || "all"} aria-labelledby={category ? `faq-${category}` : undefined}>{category ? <h3 id={`faq-${category}`} className="eyebrow mb-4">{category}</h3> : null}<div className="divide-y divide-white/10 border-y border-white/10">{categoryItems.map(({ question, answer, links }) => <details key={question} className="faq-item group"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left text-lg font-semibold text-white sm:text-xl"><span>{question}</span><span className="faq-plus" aria-hidden="true" /></summary><div className="max-w-3xl pb-7 pr-4 text-base leading-8 text-secondary sm:pr-10"><p className="break-words">{answer}</p>{links?.length ? <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{links.map((link) => link.external ? <a key={link.href} href={link.href} target="_blank" rel={`noopener noreferrer${link.sponsored ? " sponsored" : ""}`} className="text-link" aria-label={`${link.label}（開啟外部網站）`}>{link.label} <span aria-hidden="true">↗</span></a> : link.href.startsWith("mailto:") ? <a key={link.href} href={link.href} className="text-link">{link.label}</a> : <Link key={link.href} href={link.href} className="text-link">{link.label} <span aria-hidden="true">→</span></Link>)}</div> : null}</div></details>)}</div></section>; })}</div>;
}
