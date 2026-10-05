# BiBeck Money OS MVP — UX Flow Specification V1

日期：2026-10-02。狀態：產品／UX 規格草稿，待產品審閱與使用者測試，不是已實作功能或正式金融政策。標準產品語言 zh-TW；工程識別碼維持英文。

UX branch：`feature/bibeck-money-os-mvp-ux`。Frozen source：`feature/bibeck-money-model-v1` at `cfff3150fb5e6a258596fa54caa745023bcde894`。APPROVE FREEZE 只涵蓋結構性 domain/reference contracts，WORKING / LOW / Research Required 模型並未升格。

## 1. 產品論點、範圍與成功條件

BiBeck 是 Money Operating System，不以返傭為核心。核心問題：**「以我現在的狀況，我的錢下一步應該做什麼？」**

Understand → Prioritize → Act → Measure → Progress。Reality is the game. BiBeck is the interface.

V1 對象不熟悉財務術語，主要只知道賺錢與花錢，不預設已投資。一次協助找出目前最值得先處理的問題，或如實說明還不能判斷，不試圖解決整個財務人生。使用者應理解錢現在去哪裡、哪個問題先處理、如何行動、行動後真實狀態有何變化。資訊探索也是有效進展；沒有任務可以離開。

成功條件是以少量資訊得到可理解、可追溯的優先事項／探索方向，更新真實狀態後看懂變化。不用使用次數、每天登入、投資交易或返傭轉換定義成功。本文件不新增 analytics。

本次只產出本文件，不新增 production React、routes/components、帳號、auth、API、database、onboarding UI、dashboard、AI 服務或部署。不改 public web、`/bybit` 或 frozen contracts。頁面名稱是概念，不是已建立路由；session 僅引用未來另行授權的認證邊界。

依據：[Freeze Blocker Closure](../money-model/BIBECK_MONEY_MODEL_V1_FREEZE_BLOCKER_CLOSURE.md)、[Execution Contract](../money-model/EXECUTION_CONTRACT.md)、[Metric Contracts](../money-model/METRIC_CONTRACTS.md)，以及 financial-profile/resource/claim、mission、decision-output、provenance、domain-value schemas，profile-normalizer、reference-evaluator、output-validator，ValueRef/rule/model registries 與 closure tests。舊 STRUCTURE_ONLY corpus 不是 UX oracle；舊「沒有任務 = OPTIONALITY」已被 closure 更正。

UI 解讀合法 DecisionOutput，不另做決策。若後續實作發現真正不相容，停止該範圍、記錄並回報，不改 flags、threshold、合約或用 LLM 補答案。

## 2. 最小 signed-in IA 與 public web 邊界

| 目的地 | 回答的問題 | 內容 |
| --- | --- | --- |
| 目前狀況 | 我現在怎麼樣？ | Snapshot、優先事項、真實最近變化、少量指標 |
| 下一步 | 現在能做什麼？ | 同一 output 的一項 Main Quest 與 0–3 Side Missions、原因／更新入口 |
| 我的資料 | 哪些資料要補或改？ | 原始資料、日期、未知項目、完整性確認、編輯 |

手機三項文字導覽，不建複雜 sidebar；Snapshot 不另成第四項。Why、瓶頸、任務、更新是 drill-down；首次輸入與回訪編輯共用資料 surface。桌機維持同一 IA，future native 不必重設資訊架構。

PUBLIC WEB 回答「這個世界怎麼運作？」；MONEY OS 回答「那我現在該怎麼辦？」。Money / Investing / Crypto / Trading 公開知識分類不複製成 signed-in 導覽。可按需開學習內容，返回保留位置，不要求讀完文章才能得到結果。

Bybit/rebate 不出現在 beginner entry/onboarding、Snapshot 主 CTA 或預設任務。Money → Investing → Crypto → Trading → Cost → Rebate 順序保留。只有已交易、有相關需求且無更高優先問題時，未來才考慮已受模型支持的成本最佳化；本 V1 不新增交易者判定、任務 producer 或推薦，不修改 `/bybit`。

## 3. 最小輸入集與 progressive onboarding

### 3.1 必答問題不等於必須知道數字

REQUIRED_INITIAL 是初次需要回答的問題，在合約支持處「不知道」是有效回答；CONDITIONAL 只在存在該項或決策需要時問；OPTIONAL_LATER 不阻止先得到局部價值。未填不等於沒有、沒有不等於每個子欄位都是 N/A。

Phase 1 約六組初次問題，約 60 秒是待測試的操作目標，不保證所有人完成、不倒數、不做完整率分數；有條件分支就逐筆處理。Phase 2 只補 current missingInformation 或 mission dependencies。Phase 3 回訪／真實事件再補。允許隨時「先看目前結果」，可能得到 Discover，而非付款／投資建議。

| 問題／欄位草稿 | 分類 | Frozen mapping / 口徑 | 原因與 unknown 行為 |
| --- | --- | --- | --- |
| 主要使用哪種幣別？所在地是台灣嗎？ | REQUIRED_INITIAL | profile.primaryCurrency/country；TWD/TW 可預填但須確認 | 不以語系推定；混合幣別不自動換匯 |
| 每月實際拿到多少收入？是固定月收入嗎？ | REQUIRED_INITIAL | income[].averageMonthlyNetIncome、type/stability；net/monthly basis | 借款與賣資產本金不是收入；不規則／未知口徑不自行平均 |
| 每月不能不付的生活費大約多少？ | REQUIRED_INITIAL | expenses.necessaryMonthly 或 MONTHLY components | 排除另填的債務／必付項；不知道保留 UNKNOWN，估計明示本人回報 |
| 有未清貸款／卡款嗎？是否已逾期？ | REQUIRED_INITIAL | liabilities inventory / delinquencyStatus | 沒有／有／不知道分流；已知逾期可先 repair，不需全 APR |
| 除上述費用，還有哪些必付支出？ | REQUIRED_INITIAL | recurring obligations 與 dated occurrences | 包含其他每月必付、已知有到期日的大筆支出及未支付逾期；只查 30 日不能宣告全年完整 |
| 有哪些已保留用途、一定要先處理的款項／目標？ | REQUIRED_INITIAL | assignments/goals/claims discovery | 可答不知道；不把尚未生成的空 claims 當 complete |
| 每筆債務最低付款、種類、是否有擔保 | CONDITIONAL | minimumMonthlyPayment/type/secured、economicPaymentId | 有債務才問；最低付款缺一筆使相關 CMO/DSR 未知，identity 由 adapter 管理 |
| 債務目前餘額 | CONDITIONAL | liabilities[].balance | 完整 snapshot 時需要；未知不抹除已知逾期，NW 暫未知 |
| 總費用年百分率／成本資料 | CONDITIONAL | apr；獨立 costClassification | APR 未知可 Discover；單有 APR 不自動分類高成本，不加入通用門檻 |
| 到期日、金額、已保留多少、是否同一付款 | CONDITIONAL | obligation amount/dueDate/recurrence/reservedAmount + assignment | required obligation 存在才問；未查清則相關 horizon liquidity 未知，不假扣款 |
| 今天自己的現金／可立即領用存款？哪些不能動用？ | CONDITIONAL | linked Asset/FinancialResource，ownership/availability/restriction | 第一輪可略過；liquidity/runway/debt action 需要再問；額度、未入帳薪水、他人支援不算 owned cash |
| 可調整的每月支出 | OPTIONAL_LATER | discretionaryMonthly / DISCRETIONARY components | 不影響已知負 CCF 的早期 repair；未知使 surplus 未知，不道德化消費 |
| 其他每月必付項是否確定沒有 | CONDITIONAL | otherMonthlyRequired 或 OTHER_REQUIRED components | 明示沒有才 0；不能默默略過；與 obligation/payment 去重 |
| 其他資產、不動產、投資、共有資產 | OPTIONAL_LATER | assets inventory / valuation/ownership | 不逼問完整淨值；不完整就不展示總 NW，共有／不支持變現保留未知 |
| 目標金額、日期、已配置金額、優先 | OPTIONAL_LATER | goals + valid GOAL_FUNDING claim / assignments | 記錄本人選擇，不替人決定人生目標，不造可行性／投資比例 |
| 扶養、支援、收入集中／恢復、提前清償費用 | OPTIONAL_LATER | household/income/liability details | 有相關問題再補；無支持模型不造風險級別，支援不是現有資產 |
| 自己認為每月存下多少 | OPTIONAL_LATER | reportedMonthlySavings | 同口徑核對，不以回報覆蓋計算，也不強迫兩數相等 |

### 3.2 第一個價值不需要完整八項指標

| 價值 | 最少支持資料 | 可以晚補 | 不可承諾 |
| --- | --- | --- | --- |
| 已知逾期修復 | 至少一筆已知 DELINQUENT/DEFAULT 及來源，無已證明資源 invariant 違反 | 收入、全 APR、所有資產 | 未知清償額／方案或自動扣款 |
| 負核心現金流 | 同幣別、approved net monthly 收入；完整必要生活費、其他 recurring 必付、債務最低付款／identity | 自選消費、淨值、所有目標 | 缺依賴也知道 CCF，或正 CCF 即健康／可投資 |
| 探索債務成本 | 完整 liabilities discovery，其中 APR／支持分類未知 | 缺值的猜測、全部資產 | 以 APR alone 給高成本結論或 debt acceleration |
| 完整基本 snapshot / no-action | 八 core 已知、basis/inventories 完整、已知零未解決 priority claims、無獨立 action | 未支持的投資／Optionality 資格 | 空 array 證明無主張、全部未研究問題不存在 |

KNOWN zero income 合法，但 DSR 零分母仍 UNKNOWN；不得為了 no-action 改成 0。partial profile 可給已支持 action＋side Discover，不做全局「填完才能用」。

### 3.3 未來 adapter 的資料誠實性（本次不實作）

- NormalizationOptions 需 snapshotId/asOf/monthlyPeriodId、currency/net/stock 確認、approvedMonthlyIncomeIds、complete inventories、resources/assignments/claims。使用者填自然語言確認，不填工程 metadata。
- 本人資料 USER_REPORTED；CALCULATED 結果不將來源升為 VERIFIED。觀測日期不等於保存時間。「估計」是 UX 品質提示，現 profile 沒有通用 estimated amount 欄位，不改 schema；後續 adapter 須保留提示且不能改 confidence authority。
- 「沒有其他收入／貸款」經確認才 complete 空 inventory；沒有問不是否定。只盤點 cash 不等於 `complete.assets`；只填 30d 不等於 `complete.obligations`。現 reference 共用 completeness，不能 UX 私造局部 complete 以保證 90/365d。
- aggregates 排除 debt/obligation 重疊需本人確認，不能暗設 aggregatesExcludeDebtAndObligations。components 取代而非補加重複 aggregates。
- 同一付款、資產、recurring occurrence 用穩定經濟 identity，保留金額對齊 assignment，只扣一次。使用者看「這個帳戶多少／哪些錢另有用途」，不看 resource/claim jargon。
- claims generation/completeness 是獨立 implementation gate；本人說「沒問題」不是完整 claim inventory，與已知逾期等事實須一致。
- irregular/annual periodization、currency conversion、joint NW/unsupported realization 不猜。不能把未來薪水當現在現金。
- APR 的顯示／內部口徑須 adapter review 明示，不猜百分數或比例，不把 nominal/promotional 率等同總費用年百分率。成本分類 producer 須單獨核准，使用者不能勾 HIGH_COST 冒充模型。

## 4. First value moment

ENTRY → 用途／資料控制說明 → 六組問題 → 先看目前結果。沒有年齡、投資經驗、交易所帳號、銀行連接或巨型問卷前置要求。

只有 engine 支持時才顯示模板：「依目前資料，你現在最值得先處理的是：讓每月必要支出不再超過收入。收入 30,000 元，核心必要支出 35,000 元，差額−5,000 元。」資產未完整可顯示限制，但不抹除獨立 CCF 結論。

第一個結果提供：優先事項 → 為什麼 → 系統用了哪些資訊 → 哪些還不知道 → 哪些變化會改判。最後一項只解釋 matched 依賴，如 CCF 不再負／逾期解除，不新增 scenario engine 或報酬預測。

若沒有 supported action，具體教人找資訊也是首值；資源衝突先修正、逾期先 repair、未知 APR 先 Discover，不填空白 recommendation。LLM 非必需。

## 5. 最小 screen/state inventory

六個 platform-neutral screen identities。S02 重用初次輸入、補資料與我的資料，不另增 profile 頁；S03 包括 loading、error 與 return，不增 dashboard screen。路由數留待 implementation 決定。

### S01 ENTRY

- Purpose：說明 Money OS 用途與離開自由，不販售返傭／投資。
- Shown：核心問題、資料用途說明、開始／返回入口。
- Action：開始、返回；需要 session 轉另行授權的認證入口，回到原流程。
- Required data：必要用途／資料使用確認；尚無財務數字。
- Optional data：無，不問交易者身份。
- Validation：未確認必要用途時不保存／計算；退出不是輸入 0。
- Unknown：無 snapshot 不顯示使用者財務結果，sample 不能冒充本人。
- Next：S02 NEW_USER 或 S03 RETURN；session 失敗回 entry，不刪財務草稿。
- Model output：無。

### S02 DATA（初次、補資料、list/edit）

- Purpose：小問題建立可追溯 profile，Phase1/2/3 是同 surface modes。
- Shown：題目用途、單位／期間、值或不知道、日期／來源、已填摘要。
- Action：答題、回前題、晚補、確認沒有、先看結果、選欄編輯。
- Required data：§3 初次問題與 basis 回答；不知道本身是有效狀態，不強制數字。
- Optional data：OPTIONAL_LATER 與尚未觸發的 CONDITIONAL。
- Validation：inline 格式、非負 magnitude/date/payment 核對；invalid draft 不覆蓋 last valid snapshot。
- Unknown：未提供與明示 UNKNOWN 分開；N/A 只在模型適用性規則支持處，無 debt 是完整空 inventory 而非每個欄位 N/A。
- Next：有 typed snapshot/basis 到 S03 ANALYSIS；缺 structural 確認則留此，cancel 回來源。
- Model output：FinancialProfile/NormalizationOptions；adapter 未來生成，不能直接寫 derived flags。

### S03 CURRENT STATE（分析／Snapshot／回訪）

- Purpose：少量資訊理解目前狀況與優先事項，容納所有合法 output。
- Shown：ANALYSIS 後 latest valid snapshot、main 或替代狀態、觀測日、Why、最多三項摘要 metrics。
- Action：開 engine mission、Why、補資訊、更新、看更多數字；無任務不塞 CTA。
- Required data：versioned snapshot＋合法完整 DecisionOutput，不能用 legacy confidence。
- Optional data：options/sideMissions 依 output；空 array 不造卡。
- Validation：同 snapshot 才公布；失敗保留最後有效結果、明示其日期。
- Unknown：metric「目前還無法計算」＋補哪項；missing 與 no-action 不混同。
- Next：S04、S05、S02、S06 或 RETURN；重算 retry 不重貼金融 delta。
- Model output：metrics/currentStage/bottleneck/severity/missions/findings/options/missingInformation/confidenceAssessment/evaluation。

### S04 WHY（瓶頸／建議詳情）

- Purpose：讓新手理解支持證據，不信黑箱。
- Shown：semantic title、理由、用了哪些資料／數字、matched finding、假設、限制、可支持後果、解除條件。
- Action：回原卡、改資料、開既有任務；不造 recommendation。
- Required data：點選 conclusion 的完整 provenance/snapshot；無 bottleneck 時只解釋 observations。
- Optional data：相關學習；技術版本可深一層查看，普通層不露 raw IDs。
- Validation：headline/detail 同 snapshot；unsupported code 說明暫不可用，不能 AI 猜映射。
- Unknown：只說哪個依賴影響本判斷，非全 profile 必須完成。
- Next：S05/S02 或回 S03。
- Model output：bottleneck/findings/conclusion provenance、metrics、missingInformation、assumptions/versions/confidence。

### S05 MISSION（main／side／Discover）

- Purpose：一項當前行動，WHY/WHAT/IMPACT/VERIFY。
- Shown：engine 任務、人話類型／原因／下一步／影響與限制、如何回報與更新。
- Action：開始 IN_PROGRESS、補值、回報已做、稍後；稍後不是 N/A 或取消 claim。
- Required data：合法 Mission 及 source snapshot，回報核對該筆／該次 occurrence。
- Optional data：實際日期／本人補充，不要求文件上傳。
- Validation：snapshot 改了先確認仍相關；不從完成按鈕改 balance/principal/fulfilled。
- Unknown：Discover 合法；unknown action 金額不猜，不宣布 VERIFIED_DONE。
- Next：S06→S03；Discover 可 S02 對應資料→重算。
- Model output：Mission code/type/params/why/action/impact/verification/status/requiredKnownInputs/provenance/confidence。

### S06 UPDATE

- Purpose：已做與真實金融改變分離，真實事件可不經任務直接更新。
- Shown：前值／新本人觀測值、日期、受影響項、確認摘要，不是帳戶交易。
- Action：預設目前狀態回報；breakdown 已支持才選單一事件模式；確認／返回／取消。
- Required data：mode、受影響 record、日期/來源；未知新值可保留 report-only，但不稱改善。
- Optional data：不影響本次判斷的其他資料。
- Validation：asset/assignment/identity/breakdown 守恆與原子性；snapshot 覆蓋與 delta 不混用，不二次套 effect。
- Unknown：未知本金/利息可回報目前餘額或未知，不假 posting；無 proof 不 VERIFIED_DONE。
- Next：STATE_UPDATED→ANALYSIS→RECALCULATED；失敗保留 draft/last valid，retry 不重扣。
- Model output：新 profile/resources/assignments/claims snapshot→normalization→validated output；reference ledger 不是 production persistence。

### 5.1 Variants（共用所屬 screen 規則，以下指定差異）

| State / surface | Purpose & shown | Action | Required / optional | Validation / UNKNOWN | Next / Money Model |
| --- | --- | --- | --- | --- | --- |
| PARTIAL_PROFILE/S02 | 已填與待確認項 | 先看／補題 | typed basis；late 項 optional | incomplete 不是 invalid，不宣 complete | S03 或 S02；inputRecords/complete |
| ANALYSIS/S03 | 核對資料整理優先事項 | 等候、編輯、retry | snapshot；AI 非必要 | 無 fake 進度%；公布前核對 revision | READY/ERROR；evaluation/validator |
| NEED_MORE_INFORMATION/S03/S05 | 缺什麼、怎麼找 | engine Discover 或補指定資料 | missingInformation；其他 optional | producer 缺能力不是本人漏填 | S02/重算；UNKNOWN/dependencies |
| MISSION_ACTIVE/S03/S05 | 一 main、0–3side | 開始／稍後／更新 | Mission/provenance | 不 UI 重排金融 priority、不造 side | S06/返回；missions |
| NO_ACTION_REQUIRED/S03 | 支持範圍內無優先任務 | 可離開／有變化才更新 | R-014＋無獨立 action；學習 optional | main null 不足判此狀態，stage null 不升 Optionality | RETURN；NO_UNRESOLVED_PRIORITY_CLAIM |
| OBSERVATION_ONLY/S03/S04 | 有 finding 但無 supported main | 看限制／編輯 | valid findings；不要求不存在 mission | 非 R-014，非全財務健康 | RETURN/S02；side-only findings |
| INVALID_DATA/S02/S06 | 哪筆矛盾／修正方式 | 更正／回有效資料 | invalid draft | 格式不送算；合法 R-008halt 導更正，不造付款任務 | ANALYSIS；validators/R-008/R-015 |
| STALE/S03 | 上次資料日期 | 確認未變／更新 | existing snapshot；今日值不強填 | 不預設未變、不硬設每日／研究未有 stale cutoff | S06/RETURN；input dates |
| REPORT_ONLY/S05/S06 | 已回報、未更新資料 | 更新影響項／稍後 | USER_REPORTED_DONE；new 值 optional | 不改 metrics，不當 verified/fulfilled | S06/RETURN；Mission.status |
| RECOMPUTE_ERROR/S03 | 未更新，上一份有效結果 | retry／改資料 | old snapshot/draft | 不清空、不假新結果、不二次 delta | ANALYSIS；snapshot identity |
| RETURN_UNCHANGED/S03 | 現況、上次更新、既有任務 | 離開或更新真變化 | last output；confirmation optional | 無假急迫、改善或新任務 | RETURN；同義 engine 結果 |

## 6. Snapshot 與 Stage

首屏順序：目前優先事項→一句原因→主 CTA／補資訊→最多三數字→觀測日。預設前三：每月實拿收入、每月核心必要支出、每月核心差額，均標「元／月」與口徑。核心差額未扣自選消費，不能稱存款。

| Metric | zh-TW 草稿與展開策略 | 界線 |
| --- | --- | --- |
| netMonthlyIncome | 每月實拿收入 | approved net/monthly；不是現 cash |
| coreMonthlyOutflow | 每月核心必要支出 | 必需生活＋最低還款＋其他 recurring，去重 |
| coreCashFlow | 每月核心差額 | signed，負值用文字＋−金額，不只紅色 |
| monthlySurplus | 扣掉可調整支出後的每月剩餘；看更多 | 不是已實現儲蓄／可投資 capital |
| availableSafetyLiquidity30d | 扣除保留用途與近期必付款後的可動用資金 | 非帳戶餘額；負值呈「目前缺口 X 元」，底層 signed 保留不 clamp |
| financialRunwayMonths | 依目前核心支出推算的資金支撐月數；按需 | 30d residual/正 CMO，非保證；負值改呈缺口，零分母不顯示無限 |
| debtServiceRatio | 最低還款占實拿收入；詳情 | ratio 顯示百分比、非傳統 DTI，不造紅綠 threshold |
| netWorth | 已提供資產扣負債的淨值；詳情 | complete owned inventory 才總額；部分 cash 不冒充全 NW |

income concentration/90/365d 不是首屏，supported 且相關才展開。sustainableGoalCapital/longTermInvestableCapital 未知就說限制，不造投資金額／chart。無 0–100 健康分、排行榜或以資產判人價值。

Stage 是「目前優先領域」，secondary label，非 prestige rank；severity 與 confidence 獨立。

| Stage | 草稿領域 | 禁止推論 |
| --- | --- | --- |
| SURVIVAL | 先處理眼前必付與現金流 | 不是個人失敗 |
| STABILITY | 先確認與維持可用資金 | 不是通用安全基準已批准 |
| CONTROL | 先釐清負擔或資金衝突 | Discover 不證明 high-cost |
| ACCUMULATION | 先處理目標資金安排 | 不保證可持續達標 |
| GROWTH | 長期資本安排 | 實際 output 支持才用，不造投資建議 |
| OPTIONALITY | 選擇彈性 | 資格 Research Required，不能從 main null 推定 |
| null | 沒有可標示的優先領域 | 結合 variant，不是未達 Level1 |

## 7. Bottleneck / Main Quest / Discover / no-mission

Bottleneck：semantic 問題名→一句說明→證據／相關 metrics→忽略的可支持後果→解除條件→Why。例：負 CCF 持續可能需要既有現金或其他來源補差額，不說保證破產，不捏造損失。解除條件依 matchedrule，copy 不能改門檻。

Main Quest 四語意：WHY（支持 finding/資料）、WHAT（第一個實際動作，不猜付款額）、IMPACT（哪些狀態可能改變／不改變，不預測收益）、VERIFY（回報／更新何項，重算檢查條件不是外部驗證）。最多一 main，0–3side 僅來自 output，次要入口展開、不同等 CTA 競爭。Discover 可 main 或 side，不能蓋掉已知獨立 repair。

Discover 教學：查什麼→為什麼影響→去哪裡找→回填哪欄→找不到可保留未知。

| 支持 identity | zh-TW 步驟草稿 | 禁止 |
| --- | --- | --- |
| CONFIRM_DEBT_COST | 找契約／費用說明，向貸款方詢問總費用年百分率，分辨名目／促銷率；填 APR 及來源 | 保證帳單有 APR、數字找到即分類／加速還款 |
| DISCOVER_MISSING_INFORMATION＋expense refs | 核對住房、水電、食物等必要支出，避免還款算兩次 | 另建 mission code、bank scraping/OCR/年化 |
| 同上＋obligation refs | 找付款通知、金額、到期日、保留用途 | 自動重複模板、只查 30d 宣 all complete |
| RECONCILE_CASH_FLOW_INPUTS | 核對漏項、重複還款、借款／轉帳是否誤列收入 | 強迫改成系統想要數字、判不誠實 |

上述是 existing semantic mission 的 step，不能另增 primary/side ID。未知金融量不強填 fake0。

無 main 有三種意思：

1. NO_ACTION_REQUIRED：R-014 支持且無被隱藏的獨立 action。「依目前可支持的資料，沒有需要優先處理的財務任務。有變化再回來更新即可。」stage null，非 Optionality。
2. NEED_MORE_INFORMATION：缺依賴／producer 能力，不說沒事；有合法 Discover 顯示，沒有就既有資料編輯／限制，不冒充 mission。
3. OBSERVATION_ONLY：有 finding 但無 main，如 goal funding，不套 R-014、不造 BUILD_GOAL。

「去生活」是友善退出精神，不強硬 dismissive。沒有 XP、streak、等級、徽章、健康分、每日強迫活動。

## 8. Completion、State Update、Reality Loop

Financial Progress / Knowledge Progress / Execution Progress 分開。找到 APR 是資訊進展，回報已做是執行紀錄，metrics 變化才是金融狀態，不合成分數。

| Status | 草稿 | 誠實邊界 |
| --- | --- | --- |
| TODO | 尚未開始 | 無假 deadline |
| IN_PROGRESS | 正在處理 | 開始不改 asset |
| USER_REPORTED_DONE | 你已回報完成 | 可關聯更新，非外部驗證，非直接 fulfilled |
| VERIFIED_DONE | 已有受支持的完成證明 | frozen validator 在缺 completion-proof contract 時拒絕；MVP 不給此 badge，recalc 不是 proof |
| NOT_APPLICABLE | 目前不適用 | 需支持適用性改變，稍後／不想做非此值 |

未來 report/history workflow 不得直接覆寫 engine 權威結果。舊任務與新 output 關聯但不混 snapshot；reference evaluator 新 mission 為 TODO，semantic stable ID 可跨 evaluation 相同，history 需含 snapshot identity，不能把新任務因 ID 相同自動完成。

預設採**目前狀態回報**：今天 cash／loan balance 是多少，建立新的本人觀測 snapshot。不從「付了 10,000」猜 principal；未知新餘額可 report-only。能算也仍 USER_REPORTED。

只有 original asset/assignment、total payment、principal/interest/fees、liability 與 occurrence 全 supported，才能用**單一事件效果模式**依 closed effects 原子套用一次。此為未來驗收，不是本次實作；不能先套 delta 又把新 snapshot 重扣。同一 occurrence retry 不得二次付款。

| 行動 | 必須更新／核對 | 不能猜 |
| --- | --- | --- |
| 還債／解除逾期 | cash、balance、minimum payment、delinquency、日期；event 另需 breakdown | cash 扣 total、debt 扣 principal，min 付款不假定等比例下降 |
| 增加安全資金 | 真實 settled 新 cash 或原 asset purpose/assignments | 換 purpose 不生新 cash/NW，未收 monthly income 不加 asset |
| 目標配置 | currentFunding、同 asset assignments/source | 分用途總 asset/NW 不變，不同時全計 safety/investable |
| 支付費用 | cash、dated occurrence、reservation/lifecycle | consume/release 一次，取消不是付款 |
| 收入／支出改變 | approved observed monthly basis/日期 | 意圖／預算不是實現改善 |
| APR／到期日查到 | 對應欄位、來源、口徑 | 分類 producer 缺時仍 unknown，不偽 verified |

Reality Loop：觀察／行動→本人回報→核對影響項→確認新狀態→immutable snapshot→normalize/validate/calculate→ordered rules→合法 DecisionOutput→看哪些變了／沒變。完成不保證更好，可能發現更重要問題。保留上一份結果與原因，draft 未提交前首頁仍 last valid。

兩端 KNOWN、同幣別與相容 period/basis 才比較；跨月須標不同觀測。UNKNOWN→KNOWN 叫「現在可以計算」，非財務改善；模型版本變更是依據更新，非 user 進步。

## 9. Return 與 Temporal UX

回訪 Current State→Main Quest/替代狀態→Recent Change（真有才出）→Key Metrics→Next Review optional。未確認新資料就說「這是上次提供的結果」，不能假裝今日仍真。不變不造急迫、新任務或進步。

- Daily：本人查詢或已知事項需要時 orientation，沒有預設每日工作。
- Weekly：進行中 mission 可回看，不強制打卡。
- Monthly：可建議檢視實際收入支出，不是硬 coded 金融資料有效期。
- Event：收入變動、新 debt、大費用、目標改變、mission 完成→S06。
- Next Review：本人選擇再看或 known due date；只是 UX proposal，無 scheduler/push/automation 實作。不造 deadline 或研究未有 7/30/90d stale threshold。

## 10. Lightweight UX state machine（非 production code）

ANALYZABLE 表示可合法產生 partial result，不保證所有 metricsKNOWN。這些是 experience state，不加 domain enum/rule。

```text
NEW_USER → PARTIAL_PROFILE
PARTIAL_PROFILE --typed snapshot/basis--> ANALYZABLE → ANALYSIS
PARTIAL_PROFILE --缺 structural 確認--> NEED_MORE_INFORMATION → PARTIAL_PROFILE
ANY_EDIT --格式/identity/invariant 不成立--> INVALID_DATA --更正--> PARTIAL_PROFILE / STATE_UPDATE_DRAFT
ANALYSIS --output 合法且 snapshot 相符--> DECISION_READY
ANALYSIS --失敗--> RECOMPUTE_ERROR --retry 同 draft--> ANALYSIS
DECISION_READY --有 engine mission--> MISSION_ACTIVE
DECISION_READY --R-014 支持--> NO_ACTION_REQUIRED
DECISION_READY --findings 但非 R-014 且 main null--> OBSERVATION_ONLY
DECISION_READY --engine Discover/缺資訊--> NEED_MORE_INFORMATION
MISSION_ACTIVE --只回報已做--> REPORT_ONLY (USER_REPORTED_DONE)
MISSION_ACTIVE / REPORT_ONLY / NEED_MORE_INFORMATION / RETURN --編輯--> STATE_UPDATE_DRAFT
STATE_UPDATE_DRAFT --核對確認--> STATE_UPDATED → ANALYSIS → RECALCULATED → DECISION_READY
ANY_RESULT --待確認資料--> STALE --確認/更新--> RETURN / STATE_UPDATE_DRAFT
ANY_RESULT --離開再返回、無真變化--> RETURN (無自動新任務)
```

supported action＋missing 可同時存在：主視圖 MISSION_ACTIVE，缺口為 side／限制，非互斥 domain。已證明 R-008 全域資源違反先修正；R-015 的資料矛盾只阻擋指定依賴，不能把獨立已知逾期藏到整頁更正遮罩後面。其他 UI 狀態按 engine action、Discover、R-014 no-action、observation 呈現，不變成第二套 financial priority；main/side 仍只由 engine 排序。

## 11. Explainability / Confidence / AI / Errors

Why 固定六塊：

1. 用哪些資料（值／單位／日期／來源）→ sourceInputRefs/inputRefs。
2. 相關數字／口徑 → metricRefs/metrics.value。
3. finding 與規則機制的人話 → findingIds/ruleRefs。
4. 假設及 Research Required → assumptions/provenance。
5. 缺哪些、影響哪一部分 → missingInformation/dependency lineage。
6. 限制與何種資料改變會改判 → conclusion.confidence/confidenceAssessment/matched dependencies。

普通層不露 R-003/AS-001/raw paths，工程版本/revision 仍保存。code→zh-TW 模板與 params 分離，不在中文 hardcode domain logic。aggregate 不能截成 main-only 而遺失 side provenance。severity 非 confidence。options=[]合法，不能 UI 捏投資／還債二選一或 portfolio。

Confidence 不用 fake 百分比／認證 badge：缺 APR 或分類「目前還不能判斷這筆成本」；本人／估計「依你提供資料計算，尚未核對外部資料」；research「資金里程碑仍是研究假設，不是人人適用標準」；WORKING「目前是初步判斷，模型仍在驗證」。八項 KNOWN 不保證 HIGH；完整 confidenceAssessment 權威，不用 legacy modelConfidence。算術已知與政策限制分開，LOW 也不能給未支持付款額／配置比例。

User Data→Deterministic Calculations→Models/Rules→Decision Engine→validated DecisionOutput→AI Explanation。AI optional，模板足以使用；AI 失敗不阻塞結果。可解釋／摘要／教學，不能補未知、造排序／financial conclusion、改 threshold/mission status/raw data/provenance。改寫無法驗證一致則回模板，不新增數字或 causal claims。AI provider/privacy 另行審閱，無本次服務。

| Error / state | 草稿與修正 | Boundary |
| --- | --- | --- |
| 負 magnitude | 這欄請填零或正數，不知道可選不知道 | 不 abs；computed CCF/NW signed 正常 |
| 回報存款與計算不同 | 先核對範圍，是否漏費用或重複 | R-015 限定依賴 blocked，已知逾期仍 repair |
| 重複配置 | 帳戶用途分配超過可用金額，核對是否同一筆錢 | R-008 halt，更正前無 downstream allocations |
| 缺重要值 | 這部分暫不能判斷，可先處理已確定問題 | per-rule UNKNOWN，不全局 invalid |
| 日期不可能／future stock | 請確認日期與目前餘額 | future due date 合法，不一律禁未來 obligation |
| stale | 這是上次提供的狀況，現在有變化嗎 | 不自改觀測 timestamp／猜 stale 截止 |
| 口徑不支持 | 還不能放同一計算範圍 | 不猜匯率／平均／年化 |
| 重算／存取失敗 | 這次未更新，上一份狀況保留 | draft/retry 不清空，不露 schema/stack/credentials |

自訂名稱可省略，不要求銀行／交易所登入、身分證、薪資單上傳。資料用途、刪改控制是 UX 需求；正式保存/刪除/權限需後續專項核准。validation 通過不認證外部財務真實性。

## 12. Mobile-first / Accessibility / App portability

390px 一題一主操作，persistent labels/單位、不靠 placeholder。逐筆 debt/obligation 卡，不 tiny table；back 保留 scroll/輸入。桌機只擴 spacing，語意 state 相同。約 44px 操作 target、visible focus、screen-reader label、錯誤欄位關聯、submit 後 focus 結果 heading、status announcements；文字放大換行，色彩非唯一意義。不 hover/swipe-only；展開有 accessible 狀態。mobile Why 可全頁、desktop drawer，返回一致。

無不必要 charts、crypto imagery、decorative animation／game graphics。locale/日期顯示不能改 machine precision/time basis；具體 tokens/render QA 留 UI 階段，本次沒 rendered 390px 截圖。

screen identity、transitions、snapshot/evaluation identity、semantic copy keys 不綁 React/router/localStorage/browser API，future native 可重用語意。offline／sync 失敗保留草稿與 last valid，不稱已算新結果；auth/persistence/offline sync 尚未實作。顯示 timezone 與 financial basis 分離，不因裝置改規則。

## 13. Synthetic UX walkthroughs A–F

虛構 bookkeeping/experience，不是金融建議。以 frozen normalizeProfile→evaluateReference→validateDecisionOutput read-only 核對；asOf2026-10-02、monthlyPeriod2026-09、TWD/TW，明示 currency/net/stock basis。所有本人 values USER_REPORTED，相關 inventories 按 case 確認；unsupported slots UNKNOWN。完整 confidence 皆 LOW。

共通 fixture：sole owned immediate cash Asset＋same-amount linked CURRENT_CASH Resource、availableFrom=asOf，無 restrictions/assignments/dated obligations，expenses 明示排除 debt/obligation 重複、otherMonthlyRequired 確認 0。除了 case 列項之外無其他 income/assets/debts/goals；household 可 UNKNOWN。claims 是明示合法 contract fixture，不證明 production claim generation 存在。after 為新的本人確認觀測 snapshot，不由 button 猜變化。APR fixture 數值不當分類門檻；B 另有合格 HIGH_COST 分類，不是 UX 生成。

### A. Negative core cash flow

- Input：income 30,000、necessary 35,000、自選 0、cash 60,000，無 debt；完整合法 active NECESSARY_LIVING claim35,000、funded 0。
- Screen：S03 MISSION_ACTIVE；CCF/surplus−5,000、CMO 35,000、liquidity 60,000、runway 約 1.71。
- DecisionOutput：R-003 NEGATIVE_CORE_CASH_FLOW、SURVIVAL/CRITICAL，cash 不抹掉 monthly 缺口。
- Main Quest：REPAIR_CORE_CASH_FLOW。「先處理每月必要支出的缺口」；WHY−5,000、WHAT 核對實際收入支出、IMPACT 停止該口徑持續缺口、VERIFY 更新已確認狀態，不自訂省固定比例。
- User action：實際取得可確認的新 month income，不只是設定目標。
- State update：approved net monthly 38,000、cash 仍 60,000（未收收入不加 asset）；重新盤點確認無 active priority claims，不按完成清 inventory。
- Recalculated：CCF/surplus+3,000、R-014、main/stage null。跨 period 明示，不稱實現報酬；partial 資產版仍可能 Discover，非強行 no-action。

### B. Low liquidity + supported high-cost debt

- Input：income 60,000、necessary 25,000、自選 10,000、cash 10,000；loan 100,000/min 5,000/CURRENT、known APR＋獨立合格 HIGH_COST；valid active SAFETY_BUFFER claim30,000、funded 0、assignment-only effects。AS-001 一月僅研究 fixture。
- Screen：CCF 30,000/surplus 20,000、CMO 30,000、liquidity 10,000/runway 約 0.33、NW−90,000 背景。
- DecisionOutput：R-005 BUILD_MINIMUM_LIQUIDITY/STABILITY/HIGH＋R-012 side finding。
- Main Quest：先確認並建立目前模型的資金里程碑；說明一月未正式批准，不稱人人需要 30,000 或給 accelerated payment。保留最低付款義務；missing policy 無 producer 不能成立此結論。
- User action：之後實際累積 20,000 settled cash，不換 purpose 製造 cash。
- State update：cash/resource30,000、balance100,000/min 5,000/CURRENT 不變；重新確認 claims。非 mission VERIFIED_DONE。
- Recalculated：runway 1/NW−70,000，R-006 REDUCE_HIGH_COST_DEBT/CONTROL/HIGH，LOW 不變，無 optimal 額／投資比較。正式提供此類政策 action 須另行 financial-policy review，spec 不授權 launch。

### C. Unknown debt APR

- Input：income 60,000/necessary 20,000/自選 10,000/cash 100,000；loan 50,000/min 1,000/CURRENT、APR UNKNOWN/classification UNKNOWN；claims 未完整確認。
- Screen：NEED_MORE_INFORMATION；CCF 39,000/surplus 29,000/liquidity 100,000/NW 50,000，已知數字與債務限制同時呈現。
- DecisionOutput：R-006 discovery、CONTROL/MEDIUM；無 HIGH_COST_DEBT。
- Main Quest：CONFIRM_DEBT_COST；教查契約/費用說明、詢問貸款方，非付款。
- User action：查到 APR、回報來源，資訊進展，無外部 verifiedbadge。
- State update：只 APR 變 KNOWN（probe fixture 值 5；僅表示已知資料，不作百分數／比例政策假設），classification 仍 UNKNOWN，UI 不分類。
- Recalculated：仍 CONFIRM_DEBT_COST；剩下支持分類是產品能力限制，不一再責怪本人漏填。另有 qualified producer/claims review 才再判，本 flow 不捏造。

### D. Healthy-looking user without urgent mission

- Input：income 60,000/necessary 20,000/自選 10,000/cash 100,000；無 debt/obligation、明示完整合法空 priority claims、八 core KNOWN。
- Screen：NO_ACTION_REQUIRED；CCF 40,000/surplus 30,000/liquidity 與 NW 100,000/runway 5。
- DecisionOutput：R-014 NO_UNRESOLVED_PRIORITY_CLAIM、NONE、main/stage null，非 Optionality、非全財務健康認證。
- Main Quest：無，顯示 limited no-action 文案與 research 限制。
- User action：離開，返回只確認真實狀況，不造 daily 任務。
- State update：本人確認相同狀況，新觀測 snapshot/相同 supported basis，不加 income 到 asset。
- Recalculated：同數字/R-014，無新 mission 或假改善。

### E. High income, low arithmetic monthly remainder

- Input：income 200,000/necessary 80,000/自選 120,000/cash 300,000，無 debt/obligation/active claims，complete。
- Screen：CCF 120,000、看更多 surplus 0；不稱已研究的資本形成失敗。
- DecisionOutput：R-014/main/stage null，liquidity/NW 300,000/runway 3.75；無高 income＋surplus 0 自動 BUILD_SAVINGS 規則。
- Main Quest：無；可以說「扣掉目前自選支出後，每月剩餘為 0」，不道德化消費或造 priority。
- User action：本人選擇改消費，在可確認後續月資料回報，不是系統要求比例。
- State update：observed discretionary100,000、cash 仍 300,000；意圖省 20,000 不等於 asset 增加。
- Recalculated：surplus 20,000、CCF 不變，仍 R-014/main null；標示期間口徑，數字變化不強造 mission。資本形成 priorityproducer 為後續需求，不改 freeze。

### F. Near-term house goal competing with long-term investing

- Input：income 100,000/necessary 40,000/自選 20,000/cash 1,000,000；house target2,000,000/date 2028-10-02/currentFunding 0/high chosen priority；valid active GOAL_FUNDING claim2,000,000/funded 0、assignment-only effects。無 debt/dated obligation，未配置 cash。
- Screen：OBSERVATION_ONLY；CCF 60,000/surplus 40,000/liquidity 1,000,000/runway 25；target 不是現在 reservation，不扣未配置 cash。
- DecisionOutput：R-009 GOAL_FUNDING_REDUCES_INVESTABLE_CAPITAL 背景；main/stage/bottleneck null；sustainableGoalCapital/longTermInvestableCapital/hasGoalConflict UNKNOWN。無 R-014 no-action，不用 target 除月剩餘推投資比例。
- Main Quest：無 supported main。「已記錄你的目標；目前還不能判斷它與長期投資如何分配。」既有資料編輯不是自建 DECIDE_GOAL_PRIORITY；長期投資意向為 UXcontext，不加 domainfield。
- User action：本人延後目標至 2029-10-02，不是系統選人生偏好。
- State update：只 targetDate，amount/cash/assignments 不變；若真配置需 same asset，不能 goal 與 investment 各全計 1,000,000。
- Recalculated：仍 R-009/main null/producer UNKNOWN；不稱已解除衝突。R-010 的 normalized fixture 不是 raw profile 可產 goal conflict 證明，sustainability/allocation policy 是後續 gate。

### 13.1 本次 read-only 核對

A2/B2/C2/D2/E2/F2＋partial1，共 13 個 snapshots：expected main、上述數字與 output validation 通過。partial profile 有 KNOWNcore，但 assets/resources/claims incomplete，main DISCOVER_MISSING_INFORMATION，NW/liquidity/runway UNKNOWN。未改 frozen source、未新增 production/test code。這是 spec contract 核對，不是 persistence/adapter/金融真實性或 browser 驗證。

## 14. zh-TW copy drafts（非最終術語）

| 用途 | 草稿 |
| --- | --- |
| Onboarding | 先用你知道的資料，看看現在最值得處理什麼。不知道的部分可以晚點補。 |
| Income helper | 填每月實際拿到的收入。借款或賣資產拿回的本金，先不要放這裡。 |
| Expense helper | 先填維持生活必須付的費用。最低還款另外填，避免算兩次。 |
| Snapshot | 這是目前資料整理的狀況；核心差額還沒扣可以調整的支出。 |
| Bottleneck | 目前最值得先處理的是：每月必要支出的缺口。 |
| Main Quest | 先核對缺口怎麼形成，再更新已確認的收入或支出。 |
| Discover | 先確認這筆貸款的總費用年百分率。不確定在哪裡找？看看查詢方式。 |
| No-action | 依目前可支持的資料，沒有需要優先處理的財務任務。有變化再回來更新即可。 |
| Confidence | 這是初步判斷。部分模型假設仍在驗證中，可以查看依據與限制。 |
| Missing | 還缺這項資訊，所以這部分暫時不能判斷。不必填猜測的零。 |
| Completion | 你已回報完成。接著更新目前狀況，看看原本問題是否仍存在。 |
| Unverified | 目前依你回報資料計算，尚未經外部驗證。 |
| Unsupported goal | 已記錄你的目標；目前還不能判斷它與長期投資如何分配。 |
| Return | 本次沒有新的狀態變化。不需要為了使用產品而多做一個任務。 |

核心必要支出／核心差額／資金支撐月數／目前優先領域仍待新手理解測試，不以本文件凍結 final terminology。

## 15. Review verdict、known limits、implementation gates

| 檢查 | 規格結果 |
| --- | --- |
| Thesis / beginner | 首屏回答下一步，六組初次問題、局部 value 與 unknown 合法 |
| Frozen | 不改 rules/contracts/flags，supported action、Discover、no-action、observation 分離 |
| Explainability | six-part Why、units/period/source/provenance/limitations，不露裸 ID |
| Reality | report/state/effects 分離，recalc 不是 proof，沒有 fake financial progress |
| No gamification | 無 XP、streak、等級／daily tasks |
| zh-TW / mobile / app | 本地人話草稿與 portable 小步驟，無 desktop-only flow |
| AI / Bybit | AI 不決策、不必需，Bybit 非 beginner identity |

**無要求改動 frozen contract 的不相容。** UX 願望超過 producer 能力時如實 limited state，而非假稱解決。如果後續要求 E 強制 main、F 投資比例、APR 自動分類或 VERIFIED_DONE，便超出 scope，須停止回報，不能偷偷開 freeze。

Known limitations / 未來獨立 gate：

1. Input adapter/claim generation、snapshot/report/history persistence、auth/production validation 未實作；不能用 empty claims 啟動假 no-action。
2. Minimum liquidity 正式 policy/high-cost classification、irregular/annual basis、mixed currency/joint NW/realization 仍 Research Required；B 是明示假設下 reference，不授權 financial-policy launch。
3. E 無任意資本形成 main，F sustainable goal/long-term investable producer 未知；goal editing 可行不代表 allocation recommendation。
4. 缺 completion-proof，VERIFIED_DONE 不可用；state update/recalc 後仍本人來源。
5. 60 秒、術語、390px/mobile/usability/accessibility 未實際 user-tested/rendered；此為 spec，不是 screenshots 或 productionQA。
6. 正式 data retention/deletion/session、AI privacy、notification/offline sync 需專項 scope，不順帶 implement。

下一階段驗收（本次不啟動）：新手理解 核心現金差額不等於存款、income 非 cash、missing 非 0；四種結果不造 mission/amount；同 occurrence 重試不二次 effect；purpose 轉換不增 asset；未知 principal 不假扣 debt；舊 snapshot 不覆寫新。六 screens/三目的地須另做 390px/桌機、鍵盤/screenreader 與長資料測試。需 auth/persistence 時先獲新 scope；genuine contract incompatibility 先停、記錄、另審。

## 16. Repository validation / delivery

只新增此文件。執行 pnpm typecheck、pnpm lint、pnpm test；test 本身包含 Next 及本機 vinext Sites build，非部署。另跑 spec:validate，gitdiff 確認 frozen/production 不變、`.artifacts/`未 tracked，commit 只含 docs/money-os。

本次結果：typecheck PASS、lint PASS、spec:validate PASS、pnpm test 210/210 PASS（0 fail、0 skipped），其中 Next.js 與本機 vinext build 均 PASS。vinext 的部分 route 分類為 ? 是既有 static-analysis 限制，非建置失敗。文件連結／screen 欄位／scope 另以文件檢查核對；不主張 browser 或正式金融政策驗證。

commit hash 於 task final report，不自嵌本文件的 commit。只 push github UX branch，不 push Sites、不 merge、不 deploy，完成後停止，不自動 implementation。
