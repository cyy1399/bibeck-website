import Link from "next/link";
import { brandConfig } from "@/config/brand";

export type FAQItem = { question: string; answer: string; link?: { href: string; label: string } };

export const generalFaqs: FAQItem[] = [
  {
    question: "BiBeck 是交易所的官方網站嗎？",
    answer: "不是。BiBeck 是獨立的第三方交易成本與返傭資訊平台，並非任何交易所的官方網站、關係企業或代表。BiBeck 提供交易手續費、VIP 等級、返傭方案與交易成本工具等資訊。實際費率、資格、活動與服務規則，仍以各交易所官方公告及帳戶實際顯示為準。",
  },
  {
    question: "返傭是什麼？",
    answer: "返傭是將符合條件的部分交易手續費，依指定比例回饋給使用者。返傭不會改變交易盈虧，也不代表投資獲利；其主要作用是降低符合條件交易所產生的實際交易成本。",
  },
  {
    question: "使用 BiBeck 需要額外付費嗎？",
    answer: "不需要。使用 BiBeck 的交易成本計算器、返傭資訊與符合條件的返傭服務，目前不會向使用者另外收取費用。BiBeck 的收入可能來自合作交易所提供的合作分潤。",
  },
  {
    question: "為什麼 BiBeck 可以提供返傭？",
    answer: "BiBeck 透過與合作交易所或合作夥伴建立推廣關係，可能取得部分合作分潤。BiBeck 再依帳戶資格、交易量及合作方案，將部分分潤回饋給符合條件的使用者，因此形成返傭機制。實際比例與資格仍以當下方案及審核結果為準。",
  },
  {
    question: "我的交易成本真的會降低嗎？",
    answer: "若帳戶符合返傭資格，套用交易所 VIP 費率及 BiBeck 返傭後，實際交易成本通常會低於未使用返傭方案時。實際節省金額會依交易所、交易商品、Maker 或 Taker、VIP 等級、交易量與返傭比例而不同。你可以使用「交易成本計算器」進行估算。",
    link: { href: "/calculator", label: "交易成本計算器" },
  },
  {
    question: "如何確認返傭帳戶是否成功綁定？",
    answer: `如需確認綁定狀態，請聯絡 ${brandConfig.publicEmails.support}，並提供交易所名稱、UID、註冊時間及必要的畫面資訊，由 BiBeck 協助確認。請勿提供帳戶密碼、電子郵件驗證碼、Google Authenticator 驗證碼、私鑰或助記詞。`,
  },
  {
    question: "使用 BiBeck 會接觸我的交易資金嗎？",
    answer: "不會。BiBeck 不保管使用者資產，也不要求使用者將資金轉入 BiBeck。交易、入金、出金及資產保管均在使用者所選交易所內進行。BiBeck 不應要求使用者提供密碼、驗證碼、私鑰或助記詞。",
  },
  {
    question: "使用 BiBeck 會增加手續費嗎？",
    answer: "一般情況下，使用 BiBeck 不會額外提高交易所原本收取的交易手續費。BiBeck 返傭是從符合條件的合作分潤中提供回饋，而不是在原手續費之外再向使用者加收費用。實際費率仍以交易所帳戶顯示為準。",
  },
  {
    question: "BiBeck 會提供投資建議嗎？",
    answer: "不會。BiBeck 不提供個人化投資建議、不代客操作，也不保證任何投資獲利。網站主要提供交易成本資訊、返傭服務與相關工具。使用者應自行評估交易風險並閱讀各交易所相關條款。",
  },
  {
    question: "為什麼有些帳戶需要重新註冊？",
    answer: "部分交易所的返傭或合作資格，會依帳戶註冊時建立的推薦關係判定。如果原帳戶沒有透過指定推薦連結建立，可能無法直接加入返傭方案，因此可能需要重新註冊符合資格的帳戶。各交易所規則不同，請前往對應交易所頁面查看詳細說明。",
  },
  {
    question: "返傭比例什麼時候調整？",
    answer: "一般透過 BiBeck 申請返傭帳號的使用者，初始皆適用標準交易者 20%。BiBeck 會在每月 1 日統計前一個完整月份的實際交易量，並依交易量級距決定升等、降等或維持原方案。若帳戶尚未累積一個完整月份，將在完成第一個完整月份後的下一個月 1 日進行首次分級。",
  },
  {
    question: "可以一開始就取得較高返傭比例嗎？",
    answer: "一般申請者不會在註冊時直接取得較高級距，初始皆為標準交易者 20%。只有具備穩定且可驗證交易紀錄的高額交易量個體戶、專業交易者、量化交易者、代理或特殊合作夥伴，經人工評估與協商後，才可能在合作開始時適用較高的暫定返傭比例。",
    link: { href: "/high-volume-application", label: "高交易量快速審核" },
  },
];

export const homeFaqs: FAQItem[] = [generalFaqs[0], generalFaqs[1], generalFaqs[2], generalFaqs[6], generalFaqs[7]];

export const bybitFaqs: FAQItem[] = [
  {
    question: "已有 Bybit 帳戶，如何使用 BiBeck 返傭？",
    answer: "若要使用 BiBeck 的 Bybit 返傭方案，需透過「取得 Bybit 返傭帳號」指定推薦連結註冊符合條件的 Bybit 帳戶。新使用者可透過指定連結完成註冊，並依 Bybit 要求完成身分驗證後使用。已有 Bybit 帳戶的使用者，如原帳戶無法直接歸戶至指定推薦關係，可能需要透過指定推薦連結註冊新的 Bybit 帳戶，再依 Bybit 官方規則評估是否能將既有帳戶的身分驗證資料轉移至新帳戶。身分轉移具有資格與帳戶狀態限制，並非所有帳戶都一定適用；請以 Bybit 實際審核結果為準。",
  },
  {
    question: "如何確認 Bybit 返傭帳戶是否成功綁定？",
    answer: `完成指定連結註冊及必要的身分驗證後，請點擊「登入 Bybit 返傭後台」，確認帳戶或 UID 是否已顯示。若系統尚未顯示，請先確認使用的是指定推薦連結建立的帳戶，再聯絡 ${brandConfig.publicEmails.support}，提供 Bybit UID、註冊時間及必要畫面，由 BiBeck 協助確認。請勿提供帳戶密碼、電子郵件驗證碼、Google Authenticator 驗證碼、私鑰或助記詞。`,
  },
  {
    question: "Bybit 身分驗證可以轉移嗎？",
    answer: "可能可以，但須符合 Bybit 規則與帳戶狀態限制。接收身分驗證的目標帳戶必須保持未認證狀態。身分轉移只轉移身分驗證資訊，不會轉移推薦碼、代理關係、資產、電子郵件或手機號碼；轉移前後亦可能存在提現、法幣服務及帳戶狀態限制。",
  },
  {
    question: "在哪裡登入 Bybit 返傭後台？",
    answer: `請使用網站標示的「登入 Bybit 返傭後台」按鈕前往。若無法確認帳戶或 UID 狀態，請聯絡 ${brandConfig.publicEmails.support} 協助查核。`,
  },
];

export function FAQList({ items = generalFaqs, limit }: { items?: FAQItem[]; limit?: number }) {
  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;

  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {visibleItems.map(({ question, answer, link }) => (
        <details key={question} className="faq-item group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left text-lg font-semibold text-white sm:text-xl">
            <span>{question}</span>
            <span className="faq-plus" aria-hidden="true" />
          </summary>
          <div className="max-w-3xl pb-7 pr-4 text-base leading-8 text-secondary sm:pr-10">
            <p className="break-words">{answer}</p>
            {link ? <Link href={link.href} className="text-link mt-3">{link.label}<span aria-hidden="true">→</span></Link> : null}
          </div>
        </details>
      ))}
    </div>
  );
}
