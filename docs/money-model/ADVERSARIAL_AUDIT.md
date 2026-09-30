# BiBeck Money Model V1 Adversarial Audit

日期：2026-09-30
原始結論：**NOT READY TO FREEZE / NOT READY FOR PRODUCT IMPLEMENTATION**

後續狀態：`EXECUTION_CONTRACT.md` 所述 executable hardening 已解決 `AUD-B001`～`AUD-B005` 的結構性問題。此文件保留原始 adversarial findings；目前重新評估為 **READY FOR FREEZE CANDIDATE REVIEW**，但仍未 Frozen，也不是 production implementation。

本審查刻意嘗試破壞 `FinancialProfile → Metrics → Resources → Claims → Rules → Bottleneck → Priority → Mission`。目前規格能描述這條路徑，但還不能確定性執行整條路徑。

## 核心結論

1. `DecisionRule.conditions` 是自然語言字串；沒有 typed predicate、運算子、unknown propagation 或規則執行語意。
2. 沒有 Profile 正規化成 Claims／Resources 的合約，因此同一筆現金、收入、付款或目標資金可能被建立兩次。
3. 沒有規則排序、override、同級 tie-break、claim merge 或「非主要但仍未解決」的保存方式。
4. 現有 24 個 fixtures 是期望資料，不是決策引擎 oracle；validator 檢查欄位與參照，不會證明輸入真的導出該輸出。
5. 因此目前不能可靠回答「以我現在的狀況，我的錢下一步應該做什麼？」；若直接實作，UI 或 AI 必須補上未定義的人類判斷。

上述五項均為 Freeze Blocker。詳細、機器可讀分類位於 `audits/findings.ts`。

## Claims audit

HARD／PROTECTIVE／CHOSEN／OPTIMIZATION 可保留為 base class，不需要先增加分類。真正缺口是：

- `amount` 無法顯式區分未知與零。
- `dueDate` 可省略，但沒有說明是「不適用」或「未知」。
- 沒有 recurring／one-time／time window。
- 沒有 origin reference，無法知道 claim 是否來自 Liability、Obligation、Goal 或使用者直接輸入。
- partially funded 後是否改變 urgency／severity／stage 沒有規則。
- 沒有 claim fulfillment 對 resource、cash flow、liability balance 的 deterministic effect。

這些屬既有 attributes 無法完整表達的時間與來源資料，而不是類別不足。

## Resource audit

`type / amount / liquidity / restricted / purpose / availableFrom / source` 不足以定義 available resource：

- 缺少 underlying asset/income/support lineage 與 partition identity。
- 缺少 sole/joint/conditional ownership。
- `restricted:boolean` 無法描述誰限制、何時解除、可用於哪些 claims。
- `liquidity` 沒有 settlement、withdrawal lock、price volatility、tax/fee consequence。
- FUTURE_INCOME 與 EXTERNAL_SUPPORT 沒有 reliability/confidence；不能等同 owned cash。
- 沒有明示禁止 credit limit 成為資源。

在 lineage contract 凍結前，R-008 只能抓現有 allocation 中的超額或重複 assignment ID，抓不到「不同 Resource ID、同一底層資產」。

## Cash-flow and time audit

Net Monthly Income、Core Monthly Outflow、Core Cash Flow、Monthly Surplus 的算術本身清楚，但時間基準不完整。季節收入、獎金、稅、年繳保費、信用卡帳單、報銷、家庭移轉、事業收入可能被平均後掩蓋短期缺口，或同時出現在 expense、obligation 與 debt minimum。

不規則收入方法維持 Research Required；不得用未經研究的 haircut 或任意月份數代替。

## Zero-income audit

R-013 的方向正確：零收入不等於 SURVIVAL。但 CASE-020 只有「大量現金」一型。新增退休提款情境，要求區分 income、withdrawal cash flow、resource coverage 與 runway。學生家庭支持、失業高資產、無薪創辦人與投資提款仍需要 resource reliability 與 time-basis contract 才能完整判斷。

## Debt and liquidity audit

- 餘額大小沒有被直接當優先條件，這點可保留。
- 規格沒有把預期投資報酬當確定值，這點可保留。
- 促銷利率到期、浮動利率重新定價與提前清償成本缺少時間欄位與 effective-cost contract。
- 一個月 Minimum Viable Liquidity 仍為 `AS-001 / LOW / RESEARCH_REQUIRED`；validator 會阻止其狀態被靜默提高，也禁止規則文字出現通用 8% 門檻。
- 大型近期義務可使六個月帳面現金仍不足；穩定收入也不能自動核准把現金用盡。

## Goals and discretionary spending audit

Goal schema 目前要求 targetAmount 與 targetDate，因此不能原生表達未知目標；也沒有 abandoned/status、contribution capacity 或 funding lineage。不可行目標不得以提高投資風險解決。

R-011 的非道德化方向正確。已移除 CASE-012 對 R-011 的錯誤 linkage，並新增「高娛樂支出但所有高優先 claims 已完成」案例，合法結果是沒有強制任務。

## Stage and mission audit

Stage 不是永久等級、社會地位或使用者價值，Severity 必須獨立；這些產品原則正確。但多個 stages 同時觸發時，尚無 selection contract。生活事件使 Stage 倒退並不表示使用者失敗。

Mission schema 有 WHY／WHAT／IMPACT／VERIFY 文案欄位，但 `verificationMethod:string` 不是 verification evidence。實作前仍需定義何種資料能把 `USER_REPORTED_DONE` 升為 `VERIFIED_DONE`。

## Evidence and assumptions audit

目前 Evidence Registry 沒有外部 URL，因此沒有假引用、US 規則誤當台灣法律或外部 guidance 冒充 empirical proof。EV-001～EV-007 實際上是數學／定義／產品邊界，不足以驗證流動性門檻或高成本債務分類。

AS-001、AS-004 保持 Research Required。AS-005、AS-006 是 UX 約束；AS-007、AS-008 是產品語意，不應冒充財務實證。

## zh-TW terminology audit

獨立 recommendation registry 使用 KEEP／REVISE／NEEDS_RESEARCH。主要風險：

- 「主要瓶頸」可能帶責備感。
- 「安全流動性」可能像保證安全。
- Funding Conflict 與 Allocation Conflict 難以區分。
- Main Quest／Side Mission 的遊戲語感需研究。
- Minimum Viable Liquidity 在研究完成前不應直接顯示為使用者財務事實。

所有 canonical user-facing examples 仍為 zh-TW；內部 ID 與 schema keys 維持英文。

## Future app portability

目前 schemas/registries 未依賴 React，基本 domain portability 良好。但 raw zh-TW 字串直接進入 DecisionOutput／Mission，且規則仍是自然語言字串。若照此實作，web、iOS、Android 會各自重寫規則判斷或 copy mapping。實作前應凍結 platform-neutral predicate AST/decision table、copy key/parameters、serialization version 與 deterministic output contract。

## Original freeze decision

原審查要求先解決 `AUD-B001`～`AUD-B005`；目前已建立 typed predicates、deterministic resolver、獨立 reference evaluator、lineage/assignment invariants 與 semantic output。Research Required 項目仍未以猜測補齊，必須在 Freeze review 中保持隔離。
