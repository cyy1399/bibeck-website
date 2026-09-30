# BiBeck Money Model V1 Freeze Candidate

狀態：**READY FOR FREEZE CANDIDATE REVIEW — 5 個結構性 blockers 已由 executable specification hardening 解決；仍不是 production Money Engine。**

## 建議凍結

- 五層架構與 MVP 系統邊界。
- Financial Profile 核心 schema 與 `DataPoint<T>` 來源追蹤。
- Financial Claim 與 Financial Resource 抽象。
- 30／90／365 日義務與安全流動性分離。
- Stage 定義，以及 Stage 不是遊戲化排名的語意。
- Mission 類型、狀態與 WHY／WHAT／IMPACT／VERIFY 合約。
- DecisionOutput 合約。
- 八項核心不變量：資源不超額、用途配置不超過資產、硬性主張優先、重大逾期優先、未知必要資料不得產生高信心確定配置、無未解決主張不製造任務、保留資金不得重複計入安全資本、矛盾現金流先核對。
- `zh-TW` 是標準產品語言；內部英文識別碼與外部台灣繁體中文分離。
- AI 位於結構化 DecisionOutput 之後，不能靜默改變確定性結果。
- 規則、假設、證據、模型、測試的雙向可追溯要求。

## 尚未凍結／需要研究

- Minimum Viable Liquidity 的最終門檻；`約 1 × Core Monthly Outflow` 只屬 `AS-001`、LOW、RESEARCH_REQUIRED。
- Dynamic Safety Target。
- 各管轄區高成本債務分類門檻；V1 不採通用 8%。
- 不規則收入的完整規則。
- 保護／保險邏輯。
- 台灣法律、稅務與監管層。
- Risk Capacity、Risk Tolerance、Asset Allocation、Optionality 模型。
- 使用者可理解性研究與最終核准的財務術語。
- 矛盾資料的「重大差異」判定範圍。
- 目標可行性與恢復時間模型。

## 已知張力，不是已解決真理

1. 最低流動性與高成本債務之間採分階段工作邏輯，但門檻仍需研究。
2. 可支配消費與資本形成只有在資源不足時才形成配置衝突，不進行道德判斷。
3. 必要目標會限制長期可投資資本，但系統不替使用者評斷人生意義。
4. 債務與投資決策不能化約成單一利率比較。
5. 多目標競爭時分離 System Priority 與 User Priority。

## 凍結條件

`AUD-B001`～`AUD-B005` 已分別由 typed predicate AST、獨立 expected fixtures/reference evaluator、resource lineage validator、hardened claim contract，以及 phase/order/override/merge contract 解決。下一步是人類 Freeze Candidate review；只有產品、財務研究、台灣法遵與工程審閱完成後，才可標記為 Frozen。`WORKING` 不等於 `VALIDATED`，`DRAFT` 術語不等於 `APPROVED`，Research Required thresholds 仍不得變成財務事實。
