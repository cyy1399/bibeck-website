export const faqs = [
  {
    question: "BiBeck 是 Bybit 官方網站嗎？",
    answer: "不是。BiBeck 是獨立第三方交易成本優化與返傭平台，並非由 Bybit 擁有、營運或官方背書，也不是 Bybit 員工或代表。",
  },
  {
    question: "返傭是什麼？",
    answer: "返傭是合作方依適用規則，將部分符合條件的交易手續費回饋給使用者。它可以降低實際交易成本，但不會改變市場風險，也不代表保證獲利。",
  },
  {
    question: "已有 Bybit 帳戶還能綁定嗎？",
    answer: "既有帳戶能否綁定取決於 Bybit 與合作方案當時的資格規則。請先透過 BiBeck 返傭頁確認流程；若不符合資格，可能需要依合作方規定處理，BiBeck 無法自行變更帳戶歸屬。",
  },
  {
    question: "如何確認帳戶是否成功綁定？",
    answer: "完成指定入口註冊與帳戶設定後，請登入返傭後台查看帳戶或返傭紀錄。若畫面尚未更新，應以返傭後台與合作方最終顯示為準。",
  },
  {
    question: "返傭多久發放？",
    answer: "返傭計算與發放時間依合作方案、交易資料結算與後台規則而定，並非固定保證。實際狀態請以返傭後台顯示為準。",
  },
  {
    question: "在哪裡查看返傭？",
    answer: "你可以從網站的「返傭後台」按鈕進入後台，查看可用的帳戶資訊與返傭紀錄。",
  },
  {
    question: "BiBeck 是否會接觸我的交易資金？",
    answer: "不會。BiBeck 不保管用戶資產、不要求你將交易資金匯入 BiBeck，也不代替使用者下單或操作帳戶。",
  },
  {
    question: "使用 BiBeck 會增加手續費嗎？",
    answer: "BiBeck 不會另外提高交易所向你收取的手續費。實際費率、VIP 等級與返傭條件仍由合作方依其條款決定。",
  },
];

export function FAQList({ limit }: { limit?: number }) {
  const items = typeof limit === "number" ? faqs.slice(0, limit) : faqs;

  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {items.map(({ question, answer }) => (
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
