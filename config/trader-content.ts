export const traderModules=[
 {href:"/market",title:"市場",description:"從價格、資金費率與未平倉量，理解合約市場。",status:"市場資料"},
 {href:"/tools/position",title:"交易規劃",description:"從損失預算推算倉位，計入雙邊費用與滑價。",status:"可使用"},
 {href:"/tools/journal",title:"紀錄與績效",description:"匯入標準 CSV，核對淨盈虧、費用與回撤金額。",status:"可使用"},
 {href:"/workspace",title:"我的交易",description:"接續此裝置的計畫與紀錄，建立自己的檢討流程。",status:"本機工作區"},
 {href:"/research",title:"策略研究",description:"先確認期望值，再以樣本外與實盤驗證假設。",status:"研究框架"},
 {href:"/exchanges",title:"交易所與成本",description:"費率、執行條件與返傭，各自核對而不混為一談。",status:"成本工具"},
 {href:"/learn",title:"學習",description:"從真實交易疑問理解槓桿、強平、費用與證據。",status:"情境教學"},
 {href:"/community",title:"研究交流",description:"以可重現的案例交流，不以短期獲利排名。",status:"交流指南"},
];
export const lessons=[
 {slug:"risk-budget",title:"開幾倍槓桿，才是正確的問題嗎？",summary:"先決定可承擔損失，再計算數量與保證金。",sections:[{title:"先看損失預算",body:"同樣槓桿，數量與停損距離不同，損失就不同。先設定單筆可承擔金額，再用進場、停損、費用與滑價估算倉位。風險比例是個人選擇，不存在人人適用的數字。"},{title:"槓桿改變保證金需求",body:"對同一數量的線性部位，調整槓桿不會讓每一元價格變動的盈虧變小；它主要改變所需保證金，也影響強平條件。高槓桿不是低風險。"},{title:"計畫不保證最大損失",body:"跳空、滑價、停損未成交與平台異常都可能使損失超過預算。全倉及抵押品變動需另外核對，不把逐倉簡化公式套用到所有帳戶。"}],tool:"/tools/position",source:"https://www.bybit.com/en/help-center/article/FAQ-USDT-Perpetual-and-Expiry-Contracts"},
 {slug:"liquidation",title:"圖表沒碰到價格，為什麼仍可能被強平？",summary:"成交價、標記價、停損觸發價格，是不同的東西。",sections:[{title:"價格類型不同",body:"圖表可能顯示最新成交價格，強平機制卻使用標記價格。兩者可能不同。核對合約、時點、保證金模式與官方強平紀錄，不能只看一張 K 線。"},{title:"停損與強平是兩套機制",body:"停損可能由成交價、標記價或其他價格觸發；觸發也不代表一定成交。若強平先到，停損就不能保證保護部位。"},{title:"別把熱圖當成全部倉位",body:"清算熱圖中的估算區域與已發生清算不同。模型無法知道所有交易者的實際槓桿與持倉，也不代表價格必定前往某區域。"}],tool:"/market",source:"https://www.bybit.com/en/help-center/article/Inverse-Contract-FAQ"},
 {slug:"net-performance",title:"帳面賺錢，為什麼淨結果不同？",summary:"分開交易盈虧、費用、資金費率與已入帳返傭。",sections:[{title:"核對每一項",body:"淨結果 = 已實現毛盈虧 − 交易費用 + 資金費率淨收付 + 已入帳返傭。資金費率可能是正或負，預估返傭不能當成已收到。"},{title:"不要重複計算",body:"若盈虧已用實際成交價格計算，滑價是執行品質分析，不再另外扣一次。存款、提款、帳戶轉帳不是交易收入。"},{title:"勝率不是全部",body:"勝率需搭配平均盈利、平均虧損、費用與樣本數。少量交易獲利不等於可重複優勢；沒有虧損樣本時 Profit Factor 不能當成保證。"}],tool:"/tools/journal",source:"https://www.bybit.com/en/help-center/article/FAQ-USDT-Perpetual-and-Expiry-Contracts"},
 {slug:"funding",title:"持有永續合約，資金費率怎麼算？",summary:"看清費率、方向、結算時點與合約規則。",sections:[{title:"結算當下核對",body:"資金費率通常依結算時持倉名目金額與適用費率計算，正負方向決定付款或收款。不同合約的結算間隔可能不同，請看官方產品規則。"},{title:"預估不是已發生",body:"顯示的當期費率可能在結算前變動。用目前費率外推多天是情境，不能當成保證成本或固定收益。"},{title:"別忽略保證金",body:"當可用餘額不足，資金費用可能影響部位保證金與強平風險。真正結果需對照結算紀錄，不單看計算器。"}],tool:"/market",source:"https://www.bybit.com/en/help-center/article/Funding-fee-calculation"},
 {slug:"backtest",title:"漂亮的回測，如何檢查是否可信？",summary:"先檢查未來資訊、成本、成交模型與樣本外資料。",sections:[{title:"不能看見未來",body:"策略只能使用當時已知資料。未完成 K 線、未來價格或錯誤的多時間框架引用可能製造不真實結果。"},{title:"保留全部嘗試",body:"試很多參數再挑最佳，容易過度擬合。記錄調整過程，保留未參與選擇的樣本外資料；分市場環境檢查，不只看合計。"},{title:"回測、模擬、實盤分開",body:"回測成交模型無法完整重現訂單隊列、滑價、市場衝擊與平台異常。計入費用與資金費率，再用模擬及小規模實盤比較偏差。"}],tool:"/research",source:"https://www.tradingview.com/support/solutions/43000614705-strategy-produces-unrealistically-good-results-by-peeking-into-the-future/"},
];
