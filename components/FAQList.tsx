import Link from "next/link";
import { brandConfig } from "@/config/brand";
import { REBATE_APPLICATION_URL } from "@/config/links";
export type FAQItem = { question: string; answer: string; link?: { href: string; label: string; external?: boolean } };

export const generalFaqs: FAQItem[] = [
  { question:"BiBeck 是 Bybit 官方平台嗎？", answer:"不是。BiBeck 是獨立第三方交易成本與返傭服務平台，並非 Bybit 官方網站、官方代表或交易所經營者。" },
  { question:"如何申請 BiBeck 返傭？", answer:"點擊「取得 Bybit 返傭帳號」，前往申請頁並依照步驟完成 Bybit 註冊，再提交名稱、UID、返傭後台登入 Email 與申請級距。", link:{href:REBATE_APPLICATION_URL,label:"取得 Bybit 返傭帳號",external:true} },
  { question:"只完成 Bybit 註冊就會自動開通返傭嗎？", answer:"不會。完成註冊後仍需繼續提交返傭開通資料。BiBeck 完成帳戶核對與返傭設定後，才會寄送完成通知與登入資訊。" },
  { question:"返傭級距是多少？", answer:"最近 30 日有效交易量未滿 10M 為 20%；10M 起為 25%；50M 起為 30%；200M 起為 35%；500M 起可申請 40%。" },
  { question:"可以申請 40% 以上嗎？", answer:"代理、社群、團隊或其他特殊合作需求，可申請 40% 以上方案，實際比例依合作條件個別審核。" },
  { question:"達到交易量後會自動升級嗎？", answer:"不會。計算器提供級距推估，實際比例仍須完成申請與資料核對。" },
  { question:"返傭是投資收益嗎？", answer:"不是。返傭是依實際交易手續費計算的部分回饋，不代表交易獲利。" },
  { question:"BiBeck 會要求密碼或驗證碼嗎？", answer:"不會。BiBeck 不會要求 Bybit 密碼、驗證碼、API Key、API Secret、私鑰或助記詞。" },
  { question:"Email 有什麼用途？", answer:`Email 將作為返傭後台登入帳號，並用於接收開通通知與登入說明。如需支援，請聯絡 ${brandConfig.publicEmails.support}；請勿提供密碼、驗證碼、私鑰或助記詞。` },
];
export const homeFaqs = generalFaqs.slice(0,5);
export const bybitFaqs = generalFaqs;
export function FAQList({items=generalFaqs,limit}:{items?:FAQItem[];limit?:number}) { const visible=typeof limit==="number"?items.slice(0,limit):items; return <div className="divide-y divide-white/10 border-y border-white/10">{visible.map(({question,answer,link})=><details key={question} className="faq-item group"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left text-lg font-semibold text-white sm:text-xl"><span>{question}</span><span className="faq-plus" aria-hidden="true"/></summary><div className="max-w-3xl pb-7 pr-4 text-base leading-8 text-secondary sm:pr-10"><p className="break-words">{answer}</p>{link ? link.external ? <a href={link.href} target="_blank" rel="noopener noreferrer sponsored" className="text-link mt-3">{link.label} <span aria-hidden="true">↗</span></a> : <Link href={link.href} className="text-link mt-3">{link.label} <span aria-hidden="true">→</span></Link> : null}</div></details>)}</div>; }
