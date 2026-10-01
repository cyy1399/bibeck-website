# Money Model V1 Executable Specification Contract

此合約只供規格驗證，不接入網站或 production runtime。

2026-10-01 正式審閱狀態：**REJECT FREEZE**。下列 pipeline／override／merge 描述是候選要求，不代表 reference implementation 已完整做到。實際缺口與最小修復見 `BIBECK_MONEY_MODEL_V1_FREEZE_REVIEW.md` 的 FR-B001～FR-B005。

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
- `BLOCK_DOWNSTREAM`：完成 DATA_QUALITY phase 後停止財務結論；缺漏或矛盾資料使用此行為。
- `OVERRIDE_STAGE`：該規則可成為優先 stage candidate，但不刪除 side findings。
- `OVERRIDE_MAIN_QUEST`：可改變主要行動順序，例如先建立最低流動性。
- `NONE`：一般收集與排序。

## Tie-break and merge

V1 不使用財務健康分數。Primary candidate 使用 rule phase/order 的 deterministic lexicographic ordering。Claim 的 conceptual ordering（class、urgency、severity、certainty、reversibility）保留於 normalization/claim generation contract；尚未能確定性計算的 opportunity cost 明確排除於 executable V1。

Matched results 不互相覆蓋資料：findings、flags、blockers、missing information 會去重收集；只有一個 primary bottleneck 與 main quest。Side findings 仍保留。特定金融例外由明示規則表示，不依 registry array 偶然順序。

## Stage and severity

Stage 取自 ordered primary candidate，表示最高優先未解決問題領域。Side-only finding 不單獨建立 stage。現有 reference 的 `NO_MISSION → OPTIONALITY` 僅為未驗證 mapping，不能由「沒有任務」證明 Optionality；FR-B001 要求完整性／衝突檢查，Optionality 資格仍為 Research Required。

Severity 從所有 matched findings 獨立取最高語意級別：`CRITICAL > HIGH > MEDIUM > LOW > NONE`。它不由資產、Stage 或社會地位推導。

## Research isolation

AS-001 以 `minimumViableLiquidityMonths: 1` 顯式注入，帶 `LOW / RESEARCH_REQUIRED / AS-001` provenance。它不是通用財務真理。高成本債務分類、haircut、季節收入與台灣法稅規則都必須由未來版本化 configuration/model 提供，不存在時輸出 information gap。

## Oracle independence

`tests/executable-cases.ts` 手寫 explicit expected outcomes；reference evaluator 不產生、更新或回寫 expected fixtures。舊 24-case corpus 保留為 `STRUCTURE_ONLY`，新的 executable suite 是核心規則的獨立比較層。
