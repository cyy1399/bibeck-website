export type Note = {
  slug: string; category: "理財" | "投資"; title: string; summary: string;
  date: string; minutes: number; sections: { title: string; paragraphs: string[] }[];
  sources: { label: string; href: string }[];
};
const emergencySource = { label: "CFPB｜建立緊急預備金", href: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/" };
export const notes: Note[] = [
  {
    slug: "salary-first-step", category: "理財", title: "薪水入帳以後，第一筆錢應該放在哪裡？",
    summary: "從每月還款、生活費到緊急預備金，整理一個能實際執行的分配順序。", date: "2026-10-11", minutes: 3,
    sections: [
      { title: "先辨認：餘額不等於可以花的錢", paragraphs: ["薪水入帳後，先列出下一次收入以前必須支付的帳單、最低還款與生活費。銀行餘額裡，有一部分其實已經有用途。", "以下是一套整理現金流的方法，金額與順序需要配合自己的收支、到期日與家庭責任調整。"] },
      { title: "把這筆收入分成四個用途", paragraphs: ["第一，保留必要帳單與到期還款。第二，安排到下一次領薪水的生活費。第三，在負擔得起的範圍內累積緊急預備金。第四，留下可調整的緩衝；確認近期沒有缺口後，再討論長期儲蓄或投資。", "示例：收入 50,000 元，必要帳單與還款 15,000 元、生活費 20,000 元、預備金 10,000 元、緩衝 5,000 元，合計 50,000 元。這只是計算示例，不是固定比例，也不是你的個人配置建議。"] },
      { title: "今天可以做的一件事", paragraphs: ["打開帳戶，寫下下一次領薪日前所有必要付款的金額與日期。先確保付得出來，再為剩下的錢命名。帳戶之間的轉帳是資金移動，記帳時不要重複當成收入或支出。", "預備金用來應付非日常的突發支出或收入中斷，應與日常花費分開辨認。若分配後出現負數，先縮減可延後支出或處理付款安排，不要用預期投資獲利填補缺口。"] },
    ], sources: [emergencySource],
  },
  {
    slug: "emergency-fund", category: "理財", title: "緊急預備金，該怎麼算？",
    summary: "先算每月必要支出，再把收入穩定度與家庭責任放進考量。", date: "2026-10-11", minutes: 3,
    sections: [
      { title: "從必要支出開始", paragraphs: ["列出維持基本生活不能省掉的支出：居住、基本飲食、交通、醫療與保險，以及必須繳付的還款。娛樂或可暫停的訂閱，與必要開支分開。", "規劃公式：預備金目標＝每月必要支出 × 預計支應月數。假設必要支出 20,000 元，暫以 3 個月規劃，目標就是 60,000 元。3 個月是這個示例的假設，不是人人適用的官方標準。"] },
      { title: "月數不是考試答案", paragraphs: ["CFPB 指出，所需預備金依個人情況而異。可以從過往突發支出、工作收入中斷時可能需要的恢復時間，以及需要照顧的人開始估算。", "收入波動大、找下一份工作時間較長，或有扶養責任，通常需要更大的緩衝。若一次存不到目標，先累積能處理一筆常見突發支出的金額，再逐步增加。"] },
      { title: "已知的帳單另外準備", paragraphs: ["明年保費、稅款或已安排的旅費，是能預先規劃的支出。為它們另外提列，避免把所有大筆開銷都算成緊急事件。", "預備金需要安全、方便取用，並與平常可花的錢分開。使用後重新累積；不要把尚未入帳的收入、信用額度或價格波動大的資產直接當成可用預備金。"] },
    ], sources: [emergencySource],
  },
  {
    slug: "debt-before-investing", category: "理財", title: "有貸款，應該先還錢還是先投資？",
    summary: "把確定的借款成本、未知的投資報酬和手上的現金，分開判斷。", date: "2026-10-11", minutes: 3,
    sections: [
      { title: "先把貸款條件找出來", paragraphs: ["列出每筆負債的餘額、年利率、其他費用、最低還款、到期日與提前清償條件。只有月付金，還不足以比較貸款成本。", "先按時繳付必要還款，再評估額外資金要放在哪裡。提前還款若有違約金，應把這筆費用也算進去。"] },
      { title: "利息與投資報酬，確定性不同", paragraphs: ["減少本金可以降低依契約計算的未來利息，但投資報酬未必實現，也可能虧損。Investor.gov 將清償信用卡與其他高利負債列為投資前的重要考量。", "不要拿宣傳中的報酬率，直接與貸款利率相比。還需要考慮損失的可能、費用、資金使用時間，以及投資期間能否正常繳款。低利貸款是否提前還清，則需要另外評估。"] },
      { title: "別讓還款把現金用光", paragraphs: ["即使想加速還款，也要保留近期必要支出與適當的應急現金。否則突發開銷可能迫使自己再次借入更昂貴的錢。", "下一步：整理借款條件，試算提前還款後能節省多少成本，再檢查剩餘現金能否支應生活。沒有足夠資訊時，先向貸款機構取得清償試算，而不是猜。"] },
    ], sources: [{ label: "Investor.gov｜信用卡與高利負債", href: "https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/pay-credit-cards-or-other-high-interest" }],
  },
  {
    slug: "transaction-costs", category: "投資", title: "交易之前，先看懂自己付了哪些成本",
    summary: "手續費只是起點；價差、滑價與持有成本，也會改變最後的結果。", date: "2026-10-11", minutes: 3,
    sections: [
      { title: "先確認收費的基礎", paragraphs: ["有些費用按成交金額計算，有些按次收費，也有最低費用。閱讀費率表時，先確認計算單位、適用條件、買賣是否各收一次，以及是否另有稅負或其他費用。", "假設一次成交金額 100,000 元、單邊費率 0.1%，該次費用為 100 元。若買入與賣出各成交 100,000 元，且兩邊費率相同，合計費用為 200 元。這是示例，並非任何平台的實際報價。"] },
      { title: "費率表以外的成本", paragraphs: ["買賣價差是買價與賣價的差距；滑價是預期價格與實際成交價格的差異。借款利息、特定商品的持有費用或資金費率，則要依商品與期間另外核對。", "費用明細、成交價格與持有費用應分開記錄。不要把已反映在成交損益中的價差或滑價再扣一次；資金費率也可能是收取或支付，不能一律當成支出。"] },
      { title: "用實際紀錄核對", paragraphs: ["記下交易前的預期成本，交易後對照成交與帳務明細。Investor.gov 提醒投資人理解所支付的費用；比較服務時，應看完整收費而不只是廣告上的單一費率。", "返還或折扣只有在符合條件且實際取得時，才抵減相應費用。成本較低不代表商品適合自己，也不代表交易能獲利。"] },
    ], sources: [{ label: "Investor.gov｜理解投資費用", href: "https://www.investor.gov/introduction-investing/getting-started/understanding-fees" }],
  },
];
export const noteHref = (note: Note): `/notes/${string}` => `/notes/${note.slug}`;
