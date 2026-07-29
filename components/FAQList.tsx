export type FAQItem = { question: string; answer: string };

export const generalFaqs: FAQItem[] = [
  {
    question: "BiBeck 是交易所的官方網站嗎？",
    answer: "不是。BiBeck 是獨立的第三方交易成本與返傭資訊平台，並非 Bybit、Binance、Bitget、BingX、OKX 或任何交易所的官方網站、關係企業或代表。BiBeck 提供交易手續費、VIP 等級、返傭方案與交易成本工具等資訊；實際費率、資格、活動與服務規則，仍以各交易所官方公告及帳戶實際顯示為準。",
  },
  {
    question: "返傭是什麼？",
    answer: "返傭是將符合條件的部分交易手續費，依指定比例回饋給使用者。返傭不會改變交易盈虧，也不代表投資獲利；其作用是降低符合條件交易所產生的實際交易成本。",
  },
  {
    question: "如何確認返傭帳戶是否成功綁定？",
    answer: "如需確認綁定狀態，請聯絡 support@bibeck.com，並提供交易所名稱、UID、註冊時間及必要的畫面資訊，由 BiBeck 協助確認。請勿透過電子郵件提供密碼、驗證碼、私鑰或助記詞。",
  },
  {
    question: "使用 BiBeck 會接觸我的交易資金嗎？",
    answer: "不會。BiBeck 不保管使用者資產、不要求使用者將資金轉入 BiBeck，也不應要求使用者提供密碼、驗證碼、私鑰或助記詞。交易、入金、出金及資產保管均在使用者所選交易所內進行。",
  },
  {
    question: "使用 BiBeck 會增加手續費嗎？",
    answer: "BiBeck 不會另外提高交易所向你收取的手續費。實際費率、VIP 等級與返傭條件仍由合作方依其條款決定。",
  },
];

export const bybitFaqs: FAQItem[] = [
  {
    question: "已有 Bybit 帳戶，如何使用 BiBeck 返傭？",
    answer: "若要使用 BiBeck 的 Bybit 返傭方案，需透過「取得 Bybit 返傭帳號」指定推薦連結註冊符合條件的 Bybit 帳戶。新使用者可透過指定連結完成註冊，並依 Bybit 要求完成身分驗證後使用。已有 Bybit 帳戶的使用者，如原帳戶無法直接歸戶至指定推薦關係，可能需要透過指定推薦連結註冊新的 Bybit 帳戶，再依 Bybit 官方規則評估是否能將既有帳戶的身分驗證資料轉移至新帳戶。身分轉移具有資格與帳戶狀態限制，並非所有帳戶都一定適用；請以 Bybit 實際審核結果為準。",
  },
  {
    question: "如何確認 Bybit 返傭帳戶是否成功綁定？",
    answer: "完成指定連結註冊及必要的身分驗證後，請點擊「登入 Bybit 返傭後台」，確認帳戶或 UID 是否已顯示。若系統尚未顯示，請先確認使用的是指定推薦連結建立的帳戶，再聯絡 support@bibeck.com，提供 Bybit UID、註冊時間及必要畫面，由 BiBeck 協助確認。請勿提供帳戶密碼、電子郵件驗證碼、Google Authenticator 驗證碼、私鑰或助記詞。",
  },
  {
    question: "Bybit 身分驗證可以轉移嗎？",
    answer: "可能可以，但須符合 Bybit 規則與帳戶狀態限制。接收身分驗證的目標帳戶必須保持未認證狀態。身分轉移只轉移身分驗證資訊，不會轉移推薦碼、代理關係、資產、電子郵件或手機號碼；轉移前後亦可能存在提現、法幣服務及帳戶狀態限制。",
  },
  {
    question: "在哪裡登入 Bybit 返傭後台？",
    answer: "請使用網站標示的「登入 Bybit 返傭後台」按鈕前往。若無法確認帳戶或 UID 狀態，請聯絡 support@bibeck.com 協助查核。",
  },
];

export function FAQList({ items = generalFaqs, limit }: { items?: FAQItem[]; limit?: number }) {
  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;

  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {visibleItems.map(({ question, answer }) => (
        <details key={question} className="faq-item group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left text-lg font-semibold text-white sm:text-xl">
            <span>{question}</span>
            <span className="faq-plus" aria-hidden="true" />
          </summary>
          <p className="max-w-3xl pb-7 pr-10 text-base leading-8 text-secondary">{answer}</p>
        </details>
      ))}
    </div>
  );
}
