import Link from "next/link";
import { BYBIT_ACCOUNT_SUPPORT, BYBIT_KYC_TRANSFER, REBATE_APPLICATION_URL, SUPPORT_EMAIL } from "@/config/links";

type FAQLink = { href: string; label: string; external?: boolean; sponsored?: boolean };
export type FAQItem = { question: string; answer: string; links?: FAQLink[]; category?: string };
const supportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("BiBeck 返傭帳戶與 KYC 協助")}`;

export const generalFaqs: FAQItem[] = [
  { category:"返傭與交易成本", question:"BiBeck 返傭是什麼？", answer:"BiBeck 返傭是依成功開通並符合返傭條件的帳戶實際產生之符合條件交易手續費，按適用比例提供的回饋。返傭不是投資收益，也不改變交易盈虧。" },
  { category:"返傭與交易成本", question:"BiBeck 標準返傭是多少？", answer:"BiBeck 標準返傭比例為 35%。實際返傭依成功開通並符合返傭條件的 BiBeck Bybit 帳戶所產生的符合資格交易手續費計算。" },
  { category:"返傭與交易成本", question:"如果我產生 1,000 USDT 的交易手續費，可以返多少？", answer:"若這 1,000 USDT 全部屬於符合 BiBeck 返傭資格的有效交易手續費，以標準 35% 返傭計算，返傭金額為 350 USDT。實際返傭仍依帳戶資格、有效手續費與系統紀錄為準。" },
  { category:"返傭與交易成本", question:"35% 是從交易量直接計算嗎？", answer:"不是。BiBeck 返傭是依符合資格的實際交易手續費計算，不是直接用交易量乘以 35%。" },
  { category:"返傭與交易成本", question:"有 VIP 還可以取得 BiBeck 返傭嗎？", answer:"符合資格的情況下，VIP 先降低帳戶實際交易費率，BiBeck 返傭再依實際符合資格的交易手續費計算。可使用交易成本計算器試算。", links:[{href:"/calculator",label:"算算我能拿回多少"}] },
  { category:"返傭與交易成本", question:"BiBeck 的 35% 代表總交易成本一定降低 35% 嗎？", answer:"35% 指 BiBeck 標準返傭比例。實際總成本降低幅度還會受到 VIP、Maker / Taker、產品費率及實際交易條件影響，應以實際計算結果為準。" },
  { category:"返傭與交易成本", question:"我可以省多少？", answer:"實際節省依交易量、商品、Maker 或 Taker、VIP 等級、帳戶資格與符合條件的手續費而異。計算器提供 30 日與年度估算，不代表保證結果。", links:[{href:"/calculator",label:"算算我能拿回多少"}] },
  { category:"帳戶與申請", question:"如何取得 BiBeck 返傭帳戶？", answer:"請由 BiBeck 指定申請入口開始，依頁面指示建立符合推薦關係的 Bybit 帳戶並提交 UID、Email 與必要資料。", links:[{href:REBATE_APPLICATION_URL,label:"取得 35% 返傭帳戶",external:true,sponsored:true}] },
  { category:"帳戶與申請", question:"哪些帳戶可以獲得 BiBeck 返傭？", answer:"只有使用成功開通並綁定於 BiBeck 推薦關係下的 Bybit 返傭帳戶進行符合條件的交易，才會產生 BiBeck 返傭。其他未綁定於 BiBeck 的 Bybit 帳戶不適用。" },
  { category:"帳戶與申請", question:"只完成 Bybit 註冊就會自動取得返傭嗎？", answer:"不會。完成註冊不代表返傭已生效；仍需提交必要資料、完成帳戶與推薦關係核對，並收到返傭開通完成通知。" },
  { category:"帳戶與申請", question:"返傭多久生效？", answer:"實際生效時間取決於資料完整度、帳戶核對與外部返傭設定。完成設定前請勿假設返傭已生效；最終以完成通知及返傭後台紀錄為準。" },
  { category:"帳戶與申請", question:"Email 有什麼用途？", answer:"Email 用於返傭申請聯絡、開通與狀態通知，以及返傭後台相關說明。請勿透過 Email 提供密碼、驗證碼、API Secret、私鑰或助記詞。" },
  { category:"高交易量與合作", question:"交易量越高，返傭比例會自動提高嗎？", answer:"不會。BiBeck 一般符合資格帳戶採標準 35% 返傭。若你有較高交易量或專業交易需求，可另外申請高交易量合作條件評估，實際合作條件由 BiBeck 個別確認。", links:[{href:"/partners#high-volume",label:"洽談高交易量方案"}] },
  { category:"高交易量與合作", question:"什麼情況適合洽談高交易量方案？", answer:"如果你有較高的 30 日交易量，或使用量化、Bot、做市等高頻或專業交易方式，可以聯繫 BiBeck 進一步評估 VIP、Maker / Taker、有效費率與整體交易成本。", links:[{href:"/partners#high-volume",label:"查看高交易量合作說明"}] },
  { category:"高交易量與合作", question:"高交易量方案一定會有高於 35% 的返傭嗎？", answer:"不一定。35% 是 BiBeck 一般符合資格帳戶的標準返傭。高交易量方案屬於個別合作評估，實際條件依交易量、交易結構與合作需求確認。" },
  { category:"高交易量與合作", question:"Partner 是交易者等級嗎？", answer:"不是。Partner 是 BiBeck 與 KOL、Creator、交易社群、量化團隊、Bot、TradingView Creator 或交易工具等建立的商務合作關係，與一般交易者的返傭資格分開。", links:[{href:"/partners",label:"查看合作方案"}] },
  { category:"Existing Account / KYC", question:"我已經有 Bybit 帳戶怎麼辦？", answer:"既有帳戶通常不能直接新增或更換為 BiBeck 推薦關係。請先查閱 Bybit 最新帳戶規則，再由 BiBeck 指定流程建立符合條件的返傭帳戶。", links:[{href:BYBIT_ACCOUNT_SUPPORT,label:"查看 Bybit 官方帳戶說明",external:true}] },
  { category:"Existing Account / KYC", question:"舊帳戶可以直接套用 BiBeck 嗎？", answer:"通常不可以。BiBeck 返傭只適用於成功建立 BiBeck 推薦關係並完成返傭開通的帳戶，實際推薦關係限制以 Bybit 最新官方規則為準。" },
  { category:"Existing Account / KYC", question:"新的 BiBeck 返傭帳戶需要 KYC 怎麼辦？", answer:"若身分已驗證於另一個 Bybit 帳戶，可依 Bybit 官方身分轉移規則確認資格。KYC 身分轉移不等於推薦關係、資產、Email 或手機號碼轉移。", links:[{href:BYBIT_KYC_TRANSFER,label:"查看 Bybit 官方 KYC 身分轉移說明",external:true}] },
  { category:"Existing Account / KYC", question:"KYC 身分轉移是什麼？", answer:"KYC 身分轉移只處理身分驗證資訊，接收帳戶與原帳戶都須符合 Bybit 條件；它不會轉移推薦關係、資產、Email、手機號碼或帳戶其他資料。" },
  { category:"Existing Account / KYC", question:"KYC 遇到問題怎麼辦？", answer:"KYC 核准、身分轉移資格、資產、提領、帳戶限制與安全驗證由 Bybit 官方處理。BiBeck 可協助返傭 UID、申請資料及開通流程問題。", links:[{href:BYBIT_ACCOUNT_SUPPORT,label:"查看 Bybit 官方說明",external:true},{href:supportHref,label:"聯絡 BiBeck"}] },
  { category:"安全與信任", question:"BiBeck 是 Bybit 官方嗎？", answer:"不是。BiBeck 是獨立第三方交易成本與返傭資訊平台，並非 Bybit 官方網站、關係企業或代表。" },
  { category:"安全與信任", question:"BiBeck 會保管資產嗎？", answer:"不會。BiBeck 不保管使用者資產，也不要求將資金轉入 BiBeck。交易、入金、出金與資產保管均在使用者所選交易所進行。" },
  { category:"安全與信任", question:"BiBeck 會要求密碼嗎？", answer:"不會。BiBeck 不會要求交易所密碼、Email 驗證碼、Google Authenticator 驗證碼、私鑰或助記詞。" },
  { category:"安全與信任", question:"BiBeck 會要求 API Secret 嗎？", answer:"不會。現階段返傭申請與合作評估不需要 API Key 或 API Secret；請勿向任何人提供 API Secret。" },
  { category:"安全與信任", question:"費率資料從哪裡來？", answer:"費率與 VIP 資訊以交易所公開資料為主要來源，頁面會提供官方來源連結與更新日期。實際費率仍以帳戶當下顯示及交易所最新規則為準。" },
];

export const homeFaqs = [generalFaqs[0], generalFaqs[1], generalFaqs[2], generalFaqs[3], generalFaqs[4]];
export const bybitFaqs = generalFaqs;

export function FAQList({ items = generalFaqs, limit, grouped = false }: { items?: FAQItem[]; limit?: number; grouped?: boolean }) {
  const visible = typeof limit === "number" ? items.slice(0, limit) : items;
  const categories = grouped ? [...new Set(visible.map((item) => item.category).filter((value): value is string => Boolean(value)))] : [""];
  return <div className="grid gap-10">{categories.map((category) => { const categoryItems = grouped ? visible.filter((item) => item.category === category) : visible; return <section key={category || "all"} aria-labelledby={category ? `faq-${category}` : undefined}>{category ? <h3 id={`faq-${category}`} className="eyebrow mb-4">{category}</h3> : null}<div className="divide-y divide-white/10 border-y border-white/10">{categoryItems.map(({ question, answer, links }) => <details key={question} className="faq-item group"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left text-lg font-semibold text-white sm:text-xl"><span>{question}</span><span className="faq-plus" aria-hidden="true" /></summary><div className="max-w-3xl pb-7 pr-4 text-base leading-8 text-secondary sm:pr-10"><p className="break-words">{answer}</p>{links?.length ? <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{links.map((link) => link.external ? <a key={link.href} href={link.href} target="_blank" rel={`noopener noreferrer${link.sponsored ? " sponsored" : ""}`} className="text-link" aria-label={`${link.label}（開啟外部網站）`}>{link.label} <span aria-hidden="true">↗</span></a> : link.href.startsWith("mailto:") ? <a key={link.href} href={link.href} className="text-link">{link.label}</a> : <Link key={link.href} href={link.href} className="text-link">{link.label} <span aria-hidden="true">→</span></Link>)}</div> : null}</div></details>)}</div></section>; })}</div>;
}
