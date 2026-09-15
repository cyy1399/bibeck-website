import Link from "next/link";
import { BYBIT_ACCOUNT_SUPPORT, LINE_OFFICIAL_URL, REBATE_APPLICATION_URL } from "@/config/links";

type FAQLink = { href: string; label: string; external?: boolean; sponsored?: boolean };
export type FAQItem = { question: string; answer: string; links?: FAQLink[]; category?: string };

export const generalFaqs: FAQItem[] = [
  { category:"返傭與成本", question:"BiBeck 標準返傭是多少？", answer:"一般符合資格且成功建立 BiBeck 推薦關係的帳戶，標準返傭為 35%。實際返傭仍依符合資格的交易手續費與系統紀錄為準。" },
  { category:"返傭與成本", question:"如果我產生 1,000 USDT 手續費，可以拿回多少？", answer:"若這 1,000 USDT 全部屬於符合返傭資格的交易手續費，以 35% 標準返傭試算，可取得 350 USDT 返傭。" },
  { category:"透明度", question:"BiBeck 怎麼賺錢？", answer:"以目前基礎合作條件為例，代理端取得 40% 的返傭分潤，BiBeck 將其中 35 個百分點返還給客戶，保留 5 個百分點作為服務與營運收入。高交易量與特殊合作條件依個別方案確認。" },
  { category:"安全與信任", question:"BiBeck 是 Bybit 官方平台嗎？", answer:"不是。BiBeck 為獨立第三方交易成本與返傭資訊平台，並非 Bybit 官方網站、關係企業或代表。" },
  { category:"安全與信任", question:"BiBeck 會要求我的密碼或驗證碼嗎？", answer:"不會。BiBeck 不會要求 Bybit 密碼、2FA 驗證碼、API Key、API Secret、私鑰、助記詞或資產轉移。" },
  { category:"帳戶與申請", question:"原本已有 Bybit 帳戶怎麼辦？", answer:"是否能建立 BiBeck 推薦關係，需依 Bybit 帳戶狀態與官方規則確認。KYC 身分轉移不等於推薦關係轉移。", links:[{href:BYBIT_ACCOUNT_SUPPORT,label:"查看 Bybit 官方帳戶說明",external:true}] },
  { category:"高交易量與合作", question:"高交易量可以談其他條件嗎？", answer:"可以。若你有較高交易量、量化、Bot、做市或其他專業交易需求，可透過 LINE 洽談返傭、VIP 與專屬費率條件，實際條件依個別方案確認。", links:[{href:LINE_OFFICIAL_URL,label:"LINE 洽談高交易量方案",external:true}] },
  { category:"帳戶與申請", question:"如何申請 BiBeck 35% 返傭？", answer:"請先透過 BiBeck 指定連結註冊 Bybit 帳號，再於官網提交名稱、Email、Bybit UID 與交易量區間，最後等待 BiBeck 核對並透過 Email 通知結果。", links:[{href:REBATE_APPLICATION_URL,label:"開始申請"}] },
  { category:"帳戶與申請", question:"申請 BiBeck 返傭需要哪些步驟？", answer:"1. 透過 BiBeck 指定連結註冊 Bybit 帳號。2. 在 BiBeck 官網填寫返傭申請。3. 等待 BiBeck 核對帳戶推薦關係並透過 Email 通知結果。" },
  { category:"帳戶與申請", question:"我可以直接填原本的 Bybit UID 嗎？", answer:"只有成功建立 BiBeck 推薦關係並符合返傭資格的 Bybit 帳戶，才能取得 BiBeck 返傭。原有帳戶是否能建立推薦關係，需依 Bybit 官方規則與帳戶狀態確認。" },
  { category:"高交易量與合作", question:"高交易量、KOL 或代理要填一般返傭表單嗎？", answer:"若主要需求為高交易量、KOL、社群、量化、Bot 或代理合作，請直接透過 BiBeck LINE 官方帳號洽談，不需要先填一般返傭申請。", links:[{href:LINE_OFFICIAL_URL,label:"LINE 洽談合作",external:true}] },
];

export const homeFaqs = generalFaqs.slice(0, 5);
export const bybitFaqs = generalFaqs;

export function FAQList({ items = generalFaqs, limit, grouped = false }: { items?: FAQItem[]; limit?: number; grouped?: boolean }) {
  const visible = typeof limit === "number" ? items.slice(0, limit) : items;
  const categories = grouped ? [...new Set(visible.map((item) => item.category).filter((value): value is string => Boolean(value)))] : [""];
  return <div className="grid gap-10">{categories.map((category) => { const categoryItems = grouped ? visible.filter((item) => item.category === category) : visible; return <section key={category || "all"} aria-labelledby={category ? `faq-${category}` : undefined}>{category ? <h3 id={`faq-${category}`} className="eyebrow mb-4">{category}</h3> : null}<div className="divide-y divide-white/10 border-y border-white/10">{categoryItems.map(({ question, answer, links }) => <details key={question} className="faq-item group"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left text-lg font-semibold text-white sm:text-xl"><span>{question}</span><span className="faq-plus" aria-hidden="true" /></summary><div className="max-w-3xl pb-7 pr-4 text-base leading-8 text-secondary sm:pr-10"><p className="break-words">{answer}</p>{links?.length ? <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{links.map((link) => link.external ? <a key={link.href} href={link.href} target="_blank" rel={`noopener noreferrer${link.sponsored ? " sponsored" : ""}`} className="text-link" aria-label={`${link.label}（開啟外部網站）`}>{link.label} <span aria-hidden="true">↗</span></a> : link.href.startsWith("mailto:") ? <a key={link.href} href={link.href} className="text-link">{link.label}</a> : <Link key={link.href} href={link.href} className="text-link">{link.label} <span aria-hidden="true">→</span></Link>)}</div> : null}</div></details>)}</div></section>; })}</div>;
}
