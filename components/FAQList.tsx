import Link from "next/link";
import { BYBIT_ACCOUNT_SUPPORT, BYBIT_KYC_TRANSFER, REBATE_APPLICATION_URL, SUPPORT_EMAIL } from "@/config/links";

type FAQLink = { href: string; label: string; external?: boolean; sponsored?: boolean };
export type FAQItem = { question: string; answer: string; links?: FAQLink[]; category?: string };
const supportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("BiBeck 返傭帳戶與 KYC 協助")}`;

export const generalFaqs: FAQItem[] = [
  { category:"返傭與交易成本", question:"BiBeck 返傭是什麼？", answer:"BiBeck 返傭是依成功開通並符合返傭條件的帳戶實際產生之符合條件交易手續費，按適用比例提供的回饋。返傭不是投資收益，也不改變交易盈虧。" },
  { category:"返傭與交易成本", question:"BiBeck 標準返傭是多少？", answer:"BiBeck 標準返傭比例為 40%。實際返傭依成功開通並符合返傭條件的 BiBeck Bybit 帳戶所產生的符合條件交易手續費計算。" },
  { category:"返傭與交易成本", question:"40% 如何計算？", answer:"返傭試算以帳戶實際適用的 VIP 後符合條件交易手續費為基礎。例如 VIP 後手續費為 1,000 USDT，40% 返傭為 400 USDT，返傭後成本為 600 USDT。" },
  { category:"返傭與交易成本", question:"VIP 與 BiBeck 可以一起計算嗎？", answer:"可以。交易成本計算器先套用推估的 Bybit VIP 費率，再以 VIP 後手續費試算 BiBeck 40% 返傭；VIP 與 Trader Status 是彼此獨立的制度。" },
  { category:"返傭與交易成本", question:"我可以省多少？", answer:"實際節省依交易量、商品、Maker 或 Taker、VIP 等級、帳戶資格與符合條件的手續費而異。計算器提供 30 日與年度估算，不代表保證結果。", links:[{href:"/calculator",label:"免費計算交易成本"}] },
  { category:"帳戶與申請", question:"如何取得 BiBeck 返傭帳戶？", answer:"請由 BiBeck 指定申請入口開始，依頁面指示建立符合推薦關係的 Bybit 帳戶並提交 UID、Email 與必要資料。", links:[{href:REBATE_APPLICATION_URL,label:"取得 Bybit 返傭帳號",external:true,sponsored:true}] },
  { category:"帳戶與申請", question:"哪些帳戶可以獲得 BiBeck 返傭？", answer:"只有使用成功開通並綁定於 BiBeck 推薦關係下的 Bybit 返傭帳戶進行符合條件的交易，才會產生 BiBeck 返傭。其他未綁定於 BiBeck 的 Bybit 帳戶不適用。" },
  { category:"帳戶與申請", question:"只完成 Bybit 註冊就會自動取得返傭嗎？", answer:"不會。完成註冊不代表返傭已生效；仍需提交必要資料、完成帳戶與推薦關係核對，並收到返傭開通完成通知。" },
  { category:"帳戶與申請", question:"返傭多久生效？", answer:"實際生效時間取決於資料完整度、帳戶核對與外部返傭設定。完成設定前請勿假設返傭已生效；最終以完成通知及返傭後台紀錄為準。" },
  { category:"帳戶與申請", question:"Email 有什麼用途？", answer:"Email 用於返傭申請聯絡、開通與狀態通知，以及返傭後台相關說明。請勿透過 Email 提供密碼、驗證碼、API Secret、私鑰或助記詞。" },
  { category:"Trader Status", question:"Member、Pro、Black 是什麼？", answer:"這些是 BiBeck Trader Status。Member 為一般帳戶；最近 30 日有效交易量達 50M 或 200M USDT 可分別對應 Pro 或 Black 里程碑。正式 Status 仍需完成必要資料確認。" },
  { category:"Trader Status", question:"Trader Status 會改變 40% 標準返傭嗎？", answer:"不會。Member、Pro 與 Black 的 BiBeck 標準返傭比例皆為 40%。Trader Status 主要反映交易活動里程碑，以及高交易量活動、額外獎勵或合作方案的資格評估。" },
  { category:"Trader Status", question:"高交易量交易者有額外優惠嗎？", answer:"高交易量交易者可能取得高交易量活動、額外獎勵或專屬合作方案的資格評估。實際內容依當期活動、合作條件及 BiBeck 最終確認結果為準，並非固定額外返傭。" },
  { category:"Trader Status", question:"達到 Pro 或 Black 後會自動升級嗎？", answer:"計算器可依目前輸入的最近 30 日交易量推估 Trader Status，但網站不會自動同步真實帳戶交易量。正式 Pro 或 Black 身分仍需完成必要資料確認。" },
  { category:"Trader Status", question:"交易量下降後會被降級嗎？", answer:"BiBeck Trader Status 採里程碑概念，一般短期交易量下降不會自動降低標準 40% 返傭，也不應造成頻繁 Status 升降；當期額外獎勵、活動與合作資格仍可能依當期規則重新判定。" },
  { category:"Trader Status", question:"額外獎勵是固定的嗎？", answer:"不是。任何額外活動、交易量獎勵或合作內容皆依當期活動、Bybit 合作條件與 BiBeck 確認結果為準，不保證固定金額或固定額外比例。" },
  { category:"Existing Account / KYC", question:"我已經有 Bybit 帳戶怎麼辦？", answer:"既有帳戶通常不能直接新增或更換為 BiBeck 推薦關係。請先查閱 Bybit 最新帳戶規則，再由 BiBeck 指定流程建立符合條件的返傭帳戶。", links:[{href:BYBIT_ACCOUNT_SUPPORT,label:"查看 Bybit 官方帳戶說明",external:true}] },
  { category:"Existing Account / KYC", question:"舊帳戶可以直接套用 BiBeck 嗎？", answer:"通常不可以。BiBeck 返傭只適用於成功建立 BiBeck 推薦關係並完成返傭開通的帳戶，實際推薦關係限制以 Bybit 最新官方規則為準。" },
  { category:"Existing Account / KYC", question:"新的 BiBeck 返傭帳戶需要 KYC 怎麼辦？", answer:"若身分已驗證於另一個 Bybit 帳戶，可依 Bybit 官方身分轉移規則確認資格。KYC 身分轉移不等於推薦關係、資產、Email 或手機號碼轉移。", links:[{href:BYBIT_KYC_TRANSFER,label:"查看 Bybit 官方 KYC 身分轉移說明",external:true}] },
  { category:"Existing Account / KYC", question:"KYC 身分轉移是什麼？", answer:"KYC 身分轉移只處理身分驗證資訊，接收帳戶與原帳戶都須符合 Bybit 條件；它不會轉移推薦關係、資產、Email、手機號碼或帳戶其他資料。" },
  { category:"Existing Account / KYC", question:"KYC 遇到問題怎麼辦？", answer:"KYC 核准、身分轉移資格、資產、提領、帳戶限制與安全驗證由 Bybit 官方處理。BiBeck 可協助返傭 UID、申請資料及開通流程問題。", links:[{href:BYBIT_ACCOUNT_SUPPORT,label:"查看 Bybit 官方說明",external:true},{href:supportHref,label:"聯絡 BiBeck"}] },
  { category:"安全與信任", question:"BiBeck 是 Bybit 官方嗎？", answer:"不是。BiBeck 是獨立第三方交易成本與返傭資訊平台，並非 Bybit 官方網站、關係企業或代表。" },
  { category:"安全與信任", question:"BiBeck 會保管資產嗎？", answer:"不會。BiBeck 不保管使用者資產，也不要求將資金轉入 BiBeck。交易、入金、出金與資產保管均在使用者所選交易所進行。" },
  { category:"安全與信任", question:"BiBeck 會要求密碼嗎？", answer:"不會。BiBeck 不會要求交易所密碼、Email 驗證碼、Google Authenticator 驗證碼、私鑰或助記詞。" },
  { category:"安全與信任", question:"BiBeck 會要求 API Secret 嗎？", answer:"不會。現階段返傭申請與 Trader Status 確認不需要 API Key 或 API Secret；請勿向任何人提供 API Secret。" },
  { category:"安全與信任", question:"費率資料從哪裡來？", answer:"費率與 VIP 資訊以交易所公開資料為主要來源，頁面會提供官方來源連結與更新日期。實際費率仍以帳戶當下顯示及交易所最新規則為準。" },
];

export const homeFaqs = [generalFaqs[0], generalFaqs[1], generalFaqs[6], generalFaqs[11], generalFaqs[21]];
export const bybitFaqs = generalFaqs;

export function FAQList({ items = generalFaqs, limit, grouped = false }: { items?: FAQItem[]; limit?: number; grouped?: boolean }) {
  const visible = typeof limit === "number" ? items.slice(0, limit) : items;
  const categories = grouped ? [...new Set(visible.map((item) => item.category).filter((value): value is string => Boolean(value)))] : [""];
  return <div className="grid gap-10">{categories.map((category) => { const categoryItems = grouped ? visible.filter((item) => item.category === category) : visible; return <section key={category || "all"} aria-labelledby={category ? `faq-${category}` : undefined}>{category ? <h3 id={`faq-${category}`} className="eyebrow mb-4">{category}</h3> : null}<div className="divide-y divide-white/10 border-y border-white/10">{categoryItems.map(({ question, answer, links }) => <details key={question} className="faq-item group"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left text-lg font-semibold text-white sm:text-xl"><span>{question}</span><span className="faq-plus" aria-hidden="true" /></summary><div className="max-w-3xl pb-7 pr-4 text-base leading-8 text-secondary sm:pr-10"><p className="break-words">{answer}</p>{links?.length ? <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{links.map((link) => link.external ? <a key={link.href} href={link.href} target="_blank" rel={`noopener noreferrer${link.sponsored ? " sponsored" : ""}`} className="text-link" aria-label={`${link.label}（開啟外部網站）`}>{link.label} <span aria-hidden="true">↗</span></a> : link.href.startsWith("mailto:") ? <a key={link.href} href={link.href} className="text-link">{link.label}</a> : <Link key={link.href} href={link.href} className="text-link">{link.label} <span aria-hidden="true">→</span></Link>)}</div> : null}</div></details>)}</div></section>; })}</div>;
}
