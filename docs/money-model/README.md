# BiBeck Money Model V1

本目錄是 Money OS 決策引擎的規格來源，不是產品 UI，也不是可執行的財務建議引擎。

核心問題：**「以我現在的狀況，我的錢下一步應該做什麼？」**

核心循環：Understand → Prioritize → Act → Measure → Progress。

核心原則：Reality is the game. BiBeck is the interface.

## 語言與系統邊界

- 使用者體驗的標準來源語言是 `zh-TW`，不是先寫英文再翻譯。
- TypeScript 型別、鍵值、函式、列舉、模型與規則 ID 使用英文。
- 未來可增加 `en-US`、`ja-JP`，但不得改變內部合約。
- MVP 不是選股器、交易機器人、投資報酬最佳化器、稅務引擎、通用財務分數或遊戲化排名。
- AI 只能解釋、摘要、教學、降低複雜度與回答追問；不得改公式、猜資料、推翻規則、虛構主張或擅自重解使用者目標。

## 五層架構

1. **Financial State**：收入、支出、資產、負債、近期義務、目標、扶養人、資本用途。
2. **Metrics**：確定性的公式與期間化資金缺口。
3. **Models**：`cash_flow_v1`、`liquidity_v1`、`debt_priority_v1`、`goal_funding_v1`、`investable_capital_v1`。
4. **Decision Engine**：以規則階層決定問題領域與優先順序，不產生任意加權總分。
5. **Experience**：目前狀態、主要瓶頸、原因、任務、選項、缺漏資訊與進展。

管線：User Data → Normalize → Validate → Calculate → Detect Risks → Detect Bottlenecks → Determine Priority → Generate Options → Generate Missions → Explain → User Acts → State Changes → Recalculate。

## 指標定義

- `NetMonthlyIncome = Σ averageMonthlyNetIncome`
- `CoreMonthlyOutflow = NecessaryExpenses + MandatoryDebtPayments + OtherRecurringRequiredObligations`
- `CoreCashFlow = UsableMonthlyIncome - CoreMonthlyOutflow`
- `MonthlySurplus = NetMonthlyIncome - NecessaryExpenses - DiscretionaryExpenses - MandatoryDebtPayments - OtherMonthlyRequiredObligations`
- `NetWorth = TotalAssets - TotalLiabilities`（狀態指標，不是單獨的優先規則）
- `AvailableSafetyLiquidity{30d|90d|365d}`：流動資產扣除各期間必要義務與保留金額。
- `FinancialRunway = AvailableSafetyLiquidity / CoreMonthlyOutflow`，必須同時解讀義務、收入穩定度、收入集中度、扶養人與恢復時間。
- `BiBeckDebtServiceRatio = MonthlyMandatoryDebtPayments / TakeHomeIncome`，不得標示為傳統 DTI。
- `IncomeConcentration = LargestIncomeSource / TotalMonthlyIncome`，由系統計算。
- `LongTermInvestableCapital = max(SustainableAllocatableCapital - HigherPriorityCapitalClaims, 0)`。

Human Capital 不計入資產負債表或淨值。Asset Class 與 Capital Bucket 不同；Crypto 可服務不同資本用途，Trading 是活動，Bybit 是執行場所，Rebate 是成本最佳化。

## 優先架構

基礎類別是 P0 HARD、P1 PROTECTIVE、P2 CHOSEN、P3 OPTIMIZATION；類別不是完整優先順序。決策依序考慮急迫性、嚴重度、確定性、可逆性與機會成本，並在適當時納入使用者優先。

階層：立即生存／逾期 → 近期流動性 → 重大不可避免／保護性風險 → 高確定資源流失 → 資本形成 → 長期成長 → 最佳化。

Stage（SURVIVAL、STABILITY、CONTROL、ACCUMULATION、GROWTH、OPTIONALITY）表示目前最高優先問題領域，不是等級或身分；Severity 獨立表示。

## 衝突處理

- 逾期先處理；30 日必要義務有缺口時先補缺口。
- 高成本債務由管轄區／債務模型分類，不硬編通用 8% 門檻。
- 最低可行流動性目前只有 `AS-001` 的低信心研究假設；達成前維持債務最低還款，達成後才進入債務加速並保留最低流動性。
- 可支配消費不是錯誤。只有它與更高優先資本主張合計超過可用資源時，才產生 `ALLOCATION_CONFLICT`，並讓使用者比較減少支出、降低目標、延後期限、增加收入或調整優先。
- 目標資金不得同時完整計入長期可投資資本。系統顯示限制與後果，但不決定哪個人生目標更有意義。
- 債務與投資不可只比較 APR 和預期報酬；還要考慮還款後流動性、成本確定性、現金流釋放、提前清償成本、目標與投資期間、風險限制。允許狀態為 `DEBT_PRIORITY`、`INVESTMENT_ELIGIBLE`、`SPLIT_REASONABLE`、`NEED_MORE_INFORMATION`；`INVESTMENT_ELIGIBLE` 不等於立即投資。

## 進展與任務

Financial Progress、Knowledge Progress、Execution Progress 分開追蹤。完成任務不等於真實財務已改善。通常最多一個主要任務、零至三個次要任務；無未解決主張時，合法輸出是「今天沒有需要處理的財務任務。去生活。」

## 驗證

```bash
pnpm spec:validate
pnpm typecheck
pnpm lint
pnpm test
```

`schemas/` 定義資料合約；`registries/` 保存規則、模型、證據、假設與術語；`tests/` 保存 24 個合成案例與 4 個優先衝突案例；`validation/` 檢查 ID、參照、追溯、來源與資源不變量。

## Adversarial audit status

`ADVERSARIAL_AUDIT.md` 與 `audits/` 保留原始審查歷史。Executable hardening 已加入 predicate AST、reference evaluator、resource lineage、claims 與獨立 expected fixtures，但不能由既有測試通過推定全部 blockers 已解決。2026-10-01 正式結論為 **REJECT FREEZE**；見 `BIBECK_MONEY_MODEL_V1_FREEZE_REVIEW.md` 的 FR-B001～FR-B005。完整 domain contract 尚未 Frozen，不授權產品實作、merge 或部署。
