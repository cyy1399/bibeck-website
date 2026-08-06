import Link from "next/link";
import { BYBIT_ACCOUNT_SUPPORT, BYBIT_KYC_TRANSFER, REBATE_APPLICATION_URL, SUPPORT_EMAIL } from "@/config/links";
import { rebateReviewPolicy } from "@/config/rebate-review-policy";

type FAQLink = { href:string; label:string; external?:boolean; sponsored?:boolean };
export type FAQItem = { question:string; answer:string; links?:FAQLink[] };

const supportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("BiBeck 返傭帳戶與 KYC 轉移協助")}`;

export const generalFaqs: FAQItem[] = [
  { question:"BiBeck 是 Bybit 官方平台嗎？", answer:"不是。BiBeck 是獨立第三方交易成本與返傭服務平台，並非 Bybit 官方網站、官方代表或交易所經營者。" },
  { question:"哪些帳戶可以獲得 BiBeck 返傭？", answer:"只有透過 BiBeck 指定申請流程註冊，並成功綁定於 BiBeck 推薦關係下的 Bybit 返傭帳戶，使用該帳戶交易時才能獲得 BiBeck 返傭。使用者原有的 Bybit 帳戶若未綁定於 BiBeck，即使已有交易量、VIP 等級或完成 KYC，也無法直接套用 BiBeck 返傭。返傭只會依成功開通的 BiBeck 返傭帳戶所產生的有效手續費計算。" },
  { question:"我已經有 Bybit 帳戶，可以直接套用 BiBeck 返傭嗎？", answer:"通常不可以。BiBeck 返傭只適用於透過 BiBeck 指定申請流程註冊，並成功建立推薦關係的返傭帳戶。原有帳戶的推薦關係通常無法任意新增、移除或更換。請透過 BiBeck 指定申請流程建立新的返傭帳戶，並使用該帳戶進行後續交易。實際帳戶資格與推薦關係限制以 Bybit 最新官方規則為準。", links:[{href:BYBIT_ACCOUNT_SUPPORT,label:"查看 Bybit 官方帳戶設定說明",external:true}] },
  { question:"新的 BiBeck 返傭帳戶需要 KYC，該怎麼處理？", answer:"若你的個人身分目前已驗證於另一個 Bybit 帳戶，可依 Bybit 官方提供的身分轉移功能，確認是否符合將 KYC 身分轉移至新返傭帳戶的條件。身分轉移僅轉移 KYC 驗證資訊，不會轉移原帳戶的推薦關係、資產、註冊 Email、手機號碼或其他帳戶資料。接收身分的帳戶必須符合 Bybit 規定，轉移期間也可能受到提領或法幣功能限制。實際資格、限制與操作方式以 Bybit 最新官方說明為準。", links:[{href:BYBIT_KYC_TRANSFER,label:"查看 Bybit 官方 KYC 身分轉移說明",external:true}] },
  { question:"KYC 身分轉移或帳戶設定遇到問題怎麼辦？", answer:"涉及 KYC 核准、帳戶安全、提領限制、法幣功能、資產、推薦關係或身分轉移資格的問題，請先查閱 Bybit 官方說明或聯絡 Bybit 官方客服。若需要確認 BiBeck 返傭帳戶、UID、申請資料或返傭開通流程，可透過 Email 聯絡 BiBeck，我們將協助確認返傭申請相關資訊。", links:[{href:BYBIT_ACCOUNT_SUPPORT,label:"查看 Bybit 官方說明",external:true},{href:supportHref,label:"聯絡 BiBeck"}] },
  { question:"如何申請 BiBeck 返傭？", answer:"點擊「取得 Bybit 返傭帳號」，前往申請頁並依照步驟完成 Bybit 註冊，再提交名稱、UID、返傭後台登入 Email 與申請級距。", links:[{href:REBATE_APPLICATION_URL,label:"取得 Bybit 返傭帳號",external:true,sponsored:true}] },
  { question:"只完成 Bybit 註冊就會自動開通返傭嗎？", answer:"不會。完成註冊後仍需提交返傭開通資料。完成帳戶核對與返傭設定後，才會寄送通知與登入資訊。" },
  { question:"返傭級距是多少？", answer:"最近 30 日有效交易量未滿 10M 為 20%；10M 起為 25%；50M 起為 30%；200M 起為 35%；500M 起可申請 40%。" },
  { question:"可以申請 40% 以上嗎？", answer:"代理、社群、團隊或其他特殊合作需求，可申請 40% 以上方案，實際比例依合作條件個別審核。" },
  { question:"達到交易量後會自動升級嗎？", answer:`返傭比例不會在交易量達標當下即時變更。使用者可以主動提交級距申請；若未主動申請，BiBeck 會於${rebateReviewPolicy.reviewSchedule}統一檢視帳戶最近 30 日有效交易量。符合較高級距並完成資料核對後，將調整返傭比例並寄送通知。` },
  { question:"交易量下降後會被降級嗎？", answer:`為避免短期交易量波動頻繁影響返傭比例，${rebateReviewPolicy.firstShortfall}。若${rebateReviewPolicy.secondShortfall}，BiBeck 將於調整前寄送通知；恢復達標後取消觀察狀態。${rebateReviewPolicy.special}。` },
  { question:"級距調整何時生效？", answer:"級距調整於資料核對與返傭設定完成後生效，不回溯適用於調整前已產生的交易手續費。實際時間以通知內容為準。" },
  { question:"返傭是投資收益嗎？", answer:"不是。返傭是依實際交易手續費計算的部分回饋，不代表交易獲利。" },
  { question:"BiBeck 會要求密碼或驗證碼嗎？", answer:"不會。BiBeck 不會要求 Bybit 密碼、驗證碼、API Key、API Secret、私鑰或助記詞。" },
  { question:"Email 有什麼用途？", answer:"Email 將作為返傭後台登入帳號，並用於接收開通通知、登入說明與級距調整通知。" },
];

export const homeFaqs = generalFaqs.slice(0,5);
export const bybitFaqs = generalFaqs;

export function FAQList({items=generalFaqs,limit}:{items?:FAQItem[];limit?:number}) {
  const visible=typeof limit==="number"?items.slice(0,limit):items;
  return <div className="divide-y divide-white/10 border-y border-white/10">{visible.map(({question,answer,links})=><details key={question} className="faq-item group"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left text-lg font-semibold text-white sm:text-xl"><span>{question}</span><span className="faq-plus" aria-hidden="true"/></summary><div className="max-w-3xl pb-7 pr-4 text-base leading-8 text-secondary sm:pr-10"><p className="break-words">{answer}</p>{links?.length ? <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{links.map((link)=>link.external?<a key={link.href} href={link.href} target="_blank" rel={`noopener noreferrer${link.sponsored?" sponsored":""}`} className="text-link" aria-label={`${link.label}（開啟外部網站）`}>{link.label} <span aria-hidden="true">↗</span></a>:link.href.startsWith("mailto:")?<a key={link.href} href={link.href} className="text-link">{link.label}</a>:<Link key={link.href} href={link.href} className="text-link">{link.label} <span aria-hidden="true">→</span></Link>)}</div>:null}</div></details>)}</div>;
}
