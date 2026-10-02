# Money Model V1 Executable Specification Contract

此合約只供規格驗證，不接入網站或 production runtime。

2026-10-01 的 REJECT FREEZE 保留為歷史基線。2026-10-02 closure 已實作下列狹窄 reference 合約；最新結論與測試見 `BIBECK_MONEY_MODEL_V1_FREEZE_BLOCKER_CLOSURE.md`。這不核准財務門檻、production advice engine 或產品實作。

## Evaluation pipeline

1. Profile normalization produces explicit `DomainValue<T>` values and lineage-aware resources/claims.
2. Deterministic arithmetic produces normalized metrics and flags.
3. Rules read only approved `ValueRef` entries.
4. Predicate AST returns `TRUE / FALSE / UNKNOWN`; unknown is never zero or false.
5. Rules are ordered by `phase → order → ruleId`.
6. Explicit override behavior is applied.
7. Matched semantic results are merged.
8. Stage, severity and missions are resolved independently.
9. A later localization layer renders semantic codes into canonical zh-TW copy.

No `eval()`、arbitrary property traversal or UI state is allowed.

## Ordering and overrides

Phase order is `DATA_QUALITY → CRITICAL → SURVIVAL → LIQUIDITY → CONTROL → GOAL_CONFLICT → ACCUMULATION → GROWTH → OPTIMIZATION`。同 phase 使用 integer `order`，仍相同時使用 stable rule ID lexical order。

- `CRITICAL_HALT`：停止所有後續規則；資本不變量違反使用此行為。
- `BLOCK_DOWNSTREAM`：只阻擋依賴明示 blockedInputRefs 的財務結論；R-015 現金流矛盾不能抹除已知逾期等獨立事實。
- `OVERRIDE_STAGE`：該規則可成為優先 stage candidate，但不刪除 side findings。
- `OVERRIDE_MAIN_QUEST`：可改變主要行動順序，例如先建立最低流動性。
- `NONE`：一般收集與排序。

## Tie-break and merge

V1 不使用財務健康分數。Primary candidate 使用 rule phase/order 的 deterministic lexicographic ordering。Claim 的 conceptual ordering（class、urgency、severity、certainty、reversibility）保留於 normalization/claim generation contract；尚未能確定性計算的 opportunity cost 明確排除於 executable V1。

Matched results 不互相覆蓋資料：findings、flags、blockers、missing information 會去重收集；只有一個 primary bottleneck 與 main quest。Side findings 仍保留。特定金融例外由明示規則表示，不依 registry array 偶然順序。

非 Discover 任務必須滿足 rule.requiredKnownInputs；缺漏欄位只阻止依賴該欄位的 action。已知獨立 action 優先於 Discover，後者可保留為 side mission。R-006 在未知 APR／成本分類時僅產生 CONFIRM_DEBT_COST。R-014 必須有已知完整無未解決主張的狀態，且不能清空前面已成立的 action。

## Stage and severity

Stage 取自 ordered primary candidate，表示最高優先未解決問題領域。Side-only finding 不單獨建立 stage。NO_MISSION 的 stage 為 null，不能由「沒有任務」證明 Optionality；Optionality 資格仍為 Research Required。

Severity 從所有 matched findings 獨立取最高語意級別：`CRITICAL > HIGH > MEDIUM > LOW > NONE`。它不由資產、Stage 或社會地位推導。

## Research isolation

AS-001 以 `minimumViableLiquidityMonths: 1` 顯式注入，帶 `LOW / RESEARCH_REQUIRED / AS-001` provenance。它不是通用財務真理。高成本債務分類、haircut、季節收入與台灣法稅規則都必須由未來版本化 configuration/model 提供，不存在時輸出 information gap。

## Oracle independence

`tests/executable-cases.ts` 手寫 explicit expected outcomes；reference evaluator 不產生、更新或回寫 expected fixtures。舊 24-case corpus 保留為 `STRUCTURE_ONLY`，新的 executable suite 是核心規則的獨立比較層。

Closure 明確修正 EXEC-001／010／016 的不安全期待，理由見 closure review。其餘舊 executable expectations 不變；六項 dedicated diagnostics 未修改。

## Portable output and provenance

DecisionOutput 1.0 的 conclusions 與 metrics 保存 rule/model version、evidence/assumption revision、ValueRef、原始 sourceInputRefs 與 evaluated snapshot。EvidenceRecord／AssumptionRecord 的 revision 從 registry 讀取；內容／來源／限制改變須 bump revision，不能保留舊引用冒充同一證據。Rule predicate/result/requirements 行為改變須 bump rule version。

validateDecisionOutput 是嚴格 serialization boundary，會拒絕 malformed nested data、不支持的語意／rule result、stale refs、unit/period/sign/context mismatch、缺漏 raw lineage 與 confidence/provenance 矛盾。它不是對外部原始資料真偽的認證。

完整 decision confidence 取自 confidenceAssessment；UNKNOWN、user-reported／estimated input、WORKING model 和 Research Required assumption 必須揭露原因並限制信心。保留的 modelConfidence 只供舊 reference rule-match fixtures 相容，不可作為使用者決策信心。
