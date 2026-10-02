# BiBeck Money OS MVP — Implementation Plan V1

日期：2026-10-02。狀態：可開始下一個**獨立授權的小型實作任務**；本次仍是 planning，不是已實作或可上線產品。標準產品語言 zh-TW。

來源分支 `feature/bibeck-money-os-mvp-tech-arch`，架構 commit `1b364f7ad71721e93b224d9160e59aca23912cba`；UX baseline `58372f705a270651ecd50dd6f773c830498887cd`；結構凍結 baseline `cfff3150fb5e6a258596fa54caa745023bcde894`。本次交付分支 `feature/bibeck-money-os-mvp-implementation-plan`。

## 1. 權威、結論與不可越界事項

依序遵守 [Freeze Closure](../money-model/BIBECK_MONEY_MODEL_V1_FREEZE_BLOCKER_CLOSURE.md)、[Execution Contract](../money-model/EXECUTION_CONTRACT.md)、[Metric Contracts](../money-model/METRIC_CONTRACTS.md)、[UX V1](./BIBECK_MONEY_OS_MVP_UX_V1.md)、[Technical Architecture V1](./BIBECK_MONEY_OS_MVP_TECH_ARCH_V1.md)，及對應 schemas/registries/reference/tests。舊 REJECT FREEZE 報告是歷史，舊 STRUCTURE_ONLY corpus 不是現行行為 oracle。

策略：先建立可測的純金融核心，再讓少量 tagged source 經單一分析服務，最後逐步接真實 owner persistence、consumer identity 與小型 UX。每個 slice 有成果、測試與 rollback；不先建整個 framework，不在每個 PR 重決架構。採既有 Next.js/React/TypeScript/Zod/Drizzle/Postgres/node:test，零新增必要 runtime dependency。瀏覽器 harness 到 UI slice 才按現有可用工具核對並另審必要 dev dependency。

本次只新增本文件，不建任何下列未來路徑、不改 package/scripts、auth、DB、API、public marketing、`/bybit` 或 frozen source；不 migration、不 merge、不部署、不推 Sites。Implementation branches/PRs 只規劃，不建立。本次指定的 documentation branch 可 commit/push GitHub。

### 1.1 三個必須如實處理的能力差距

- consumer auth：現 `auth.ts` 是 verified Google email＋admin allowlist/JWT8h；`lib/admin-auth.ts` 無已確認 consumer stable userId。S07 需獨立授權接線，不能放寬 admin allowlist、以 email 當 owner 或造臨時 production 身份。
- VERIFIED_DONE：缺 completion-proof contract。可以保存 USER_REPORTED_DONE；recalc／新 receipt／研究 evidence 都不證外部完成。對 verified 狀態提供 unsupported response/negative tests，不能製造 badge。若要求可用 VERIFIED_DONE，先停止相關能力，另提契約 review。
- policy/producer：AS-001=1、HIGH_COST、sustainable goal、allocation/conflict 部分仍研究或缺 producer。B 的完整 action 先是 research fixture；E 不造資本形成 main，F 不造投資分配。不存在的能力明示 UNKNOWN/unsupported，不把產品限制說成使用者沒填。

這些是後續 slice/launch gates，不阻擋 S00。READY 不授權所有 slices 一次開工，也不等於 PRODUCTION_READY。

## 2. 實作順序與能力里程碑

架構七個 broad slices 細分為可審查任務；不是新增產品功能。S03→S04 先取得無 DB 的可信結果，才建立 schema/交易，避免持久化不合法金融輸出。Security/ownership 自最初 service 即實作，S14 是累積 hardening，不是最後才加權限。

| ID | 能力／交付 | 依賴 | 建議 PR／branch suffix |
| --- | --- | --- | --- |
| S00 | 最小 foundation：既有 decimal runtime 的 portable seam | accepted plan＋單獨實作授權 | 1 PR / decimal-foundation |
| S01 | typed profile→frozen runtime→完整 validated output | S00 | 1 PR / domain-runtime |
| S02 | tagged decimal/currency/date source codec→安全 domain input | S00/S01 | 1 PR / source-codecs |
| S03 | source inventories→resources/claims→analysis | S01/S02＋representation review | 1 PR / source-adapter |
| S04 | 單一分析 service＋zh-TW read projection | S03 | 1 PR / analysis-service |
| S05 | 最小 owner schema，隔離 DB migration integrity | S04＋DB 變更授權 | 1 PR / profile-schema |
| S06 | save/read→原子 revision/snapshot/receipt | S05/S04 | 1 PR / profile-persistence |
| S07 | 真實 consumer session→stable identity→owner checks | S06＋身份方案／獨立授權 | 1 PR / consumer-identity |
| S08 | gated private routes＋薄 Server Actions→services | S07＋private-data handling review | 1 PR / private-transport |
| S09 | S01 ENTRY/S02 DATA：少量問題、未知、確認、保存 | S08/S04 | 1 PR / onboarding |
| S10 | 首次 UI value：同 snapshot 的優先事項＋原因＋前三 metrics | S09 | 1 PR / first-value |
| S11 | Snapshot 展開＋六塊 Why＋完整合法 variants | S10 | 1 PR / decision-view |
| S12 | Main/Side/Discover 任務＋獨立 progress reports | S11/S06 | 1 PR / mission-loop |
| S13 | OBSERVED_STATE Reality Loop→重算→新結果 | S12 | 1 PR / reality-loop |
| S14 | authorization/privacy/reliability/mobile hardening | S13＋所有前置 gates | 1 PR / mvp-hardening |
| S15 | 最小 public entry integration（非分析核心先決） | S14＋開放入口／文案授權 | 1 PR / entry-integration |
| S16 | optional AI explanation（非 MVP DoD） | S14＋provider/privacy 授權 | 1 PR / optional-explanation |
| S17 | controlled DECLARED_EVENT（非 observed MVP DoD） | S14＋event/DB 能力授權 | 1 PR / declared-event |

完整 branch 前綴是 `feature/money-os-`；表格 suffix 只是未來命名建議。這些 branches 本次不建立。S16/S17 不阻擋無 AI、observed-state MVP。S15 public visibility 必須等受保護產品可用，不讓 public scaffold 提前收集個資。

## 3. 每個 slice 的執行卡

每張卡的 Files 為預期範圍而非已建立。每 PR 承接已審查 baseline；若體積仍過大，可按單一可驗能力拆子 PR，但不得刪 acceptance。每次完成必須回報 diff、commands、證據、未解限制，停止等下一任務；不因本計畫自動 merge/deploy。

### S00 — Portable decimal foundation（唯一推薦第一任務）

- **Objective**：抽出目前有效 decimalSum/decimalProduct，建立最小 pure-module 與 import/typecheck 測試 seam。
- **User value**：未來輸入不因 0.1＋0.2 產生假缺口／重複資金；本 slice 沒有可見 UI。
- **Technical scope**：沿用既有演算法與拒絕語意；`lib/money-model/arithmetic/decimal-arithmetic.ts` 唯一實作；原 docs arithmetic entrypoint 僅 re-export 相同 API。保留 pinned freeze commit 可讀，不 copy 第二套 evaluator。
- **Files/modules**：上述兩檔、`tests/money-os-decimal-foundation.test.mjs`、`tests/money-os-import-boundary.test.mjs`、`tsconfig.money-model.json`；`package.json` 只加 targeted domain check script（不改依賴）。
- **Dependencies**：本計畫接受與 S00 明確實作授權；現 Node>=22.13/TS5.9.3。
- **Data/schema impact**：無。
- **API/service impact**：無；不新增 analysis facade 空殼。
- **UI impact**：無。
- **Tests required**：node:test 獨立 expected decimal cases、import graph guard、不帶 DOM 的 targeted typecheck；既有完整 suite/diagnostics。
- **Acceptance criteria**：0.1＋0.2=0.3，decimal cancellation=0，share multiplication、empty sum、signed arithmetic、非 finite／不可表示結果維持既有行為；無 production→docs import，無 React/Next/DB/locale/clock；210 既有測試零減少。
- **Risks**：抄出兩個會漂移的實作；wrapper 比自己不證 parity；root DOM lib 掩蓋依賴。
- **Explicit non-goals**：輸入 parser、貨幣 rounding/minor-unit policy、任何 financial formula/threshold/config 改動、其他 evaluator extraction、UI/DB/auth。
- **Rollback boundary**：尚無 production caller，可原子 revert library＋wrapper＋tests/scripts；不刪 frozen archive。
- **PR/branch**：一 PR，未來 `feature/money-os-decimal-foundation`。

### S01 — 完整凍結 domain runtime

- **Objective**：明示 typed FinancialProfile/NormalizationOptions/bundle→validated DecisionOutput＋受控 diagnostics。
- **User value**：相同財務來源得到同結果，仍可知道不確定及依據。
- **Technical scope**：遷移 contracts/registries/normalizer/resource/claim/predicate/evaluator/output validator 至 `lib/money-model`；docs reference 兼容入口 re-export；保留 normalizer 合併 metrics/flags/lineage 路徑。explicit RuntimeBundle 注入 baseline registered config=1，evaluator/validator/provenance 共用同 bundle。normalizer 今日沒有 config argument，不宣稱已完成注入。
- **Files/modules**：`lib/money-model/{contracts,registries,runtime,index.ts}`、對應 `docs/money-model/{schemas,registries,reference}` entry wrappers、`tests/money-os-domain-runtime.test.mjs`、boundary/typecheck。
- **Dependencies**：S00；獨立 oracle、freeze hash 清單先核對。
- **Data/schema impact**：無 DB；frozen public types/versions/financial semantics 不變。
- **API/service impact**：pure analyze facade；clock/asOf/IDs/basis caller 注入，不接 HTTP。
- **UI impact**：無。
- **Tests required**：210 baseline、六個原始 blocker diagnostics、八 metrics、order/ties、UNKNOWN/N/A、R008/R015、main/side/confidence/provenance；pin historical runtime read-only 比較＋手寫 expected。
- **Acceptance criteria**：same input/bundle/basis 的 canonical financial output 全欄一致，volatile IDs/time 分離；完整 validator 拒 forged/missing lineage；無 generic calculations/native sum shortcut、fixture createContext overrides 或 docs production imports。
- **Risks**：只比較七 summary 欄；validator 換 registry 漏判歷史；抽取時暗改假設／unknown。
- **Explicit non-goals**：批准 AS-001、APR classification、goal policy、portfolio、新 formulas、改 oracle。
- **Rollback boundary**：無 UI caller 時 revert library＋compat wrappers；留 freeze commit/oracle，不修改任何已保存財務資料。
- **PR/branch**：一 PR / `feature/money-os-domain-runtime`。

### S02 — Source codecs／money／time

- **Objective**：tagged input→canonical decimal/currency/date/basis→frozen types 的無損邊界。
- **User value**：「不知道」不變零，金額單位與日期不被瀏覽器改寫。
- **Technical scope**：app DTO codecs、bounded payload、canonical decimal↔integer coefficient/scale、Number round-trip gate、APR_PERCENT、calendar-only dates；具體 limits 見§5。
- **Files/modules**：`lib/money-os/contracts/{source,errors}.ts`、`lib/money-os/adapters/{money-codec,time-codec,domain-value-codec}.ts`、`tests/money-os-source-codecs.test.mjs`；targeted app typecheck 包含未來 catalogs。
- **Dependencies**：S01；不引 decimal package。
- **Data/schema impact**：只提出 application envelope v1；JSON decimals 為 string、UNKNOWN/N/A 無 hidden data。
- **API/service impact**：合法 parsed DTO 或 typed VALIDATION_ERROR；no owner/trusted output in body。
- **UI impact**：尚無；定義 literal parser/formatter contract 供 onboarding。
- **Tests required**：0/0.1/0.2/0.001、negative source rejection、9007199254740993 rejection、exponent/NaN/locale separator、signed derived、currency mismatch、rounding 不回寫、leap day、cross-zone、omission vs explicit UNKNOWN、N/A rejection。
- **Acceptance criteria**：DTO→storage JSON→domain→DTO tags/basis/decimals 保值；BigInt 不進 JSON；不強設所有 currency two decimals 或把 APR 12 當0.12。
- **Risks**：parseFloat silent loss、local midnight 跨日、minor units 擅自 round、output number precision 被 DB 能力掩蓋。
- **Explicit non-goals**：FX、irregular annualization、bank parsing、貨幣金融政策。
- **Rollback boundary**：無 persisted source 時 revert codecs；之後 source version reader 不可刪，超精度 input 必須停於 draft。
- **PR/branch**：一 PR / `feature/money-os-source-codecs`。

### S03 — Source inventories／resources／claims adapter

- **Objective**：使用者事實轉成可審查、可追溯的 frozen input，而非生成新金融模型。
- **User value**：只用已知事實決定支持範圍，其他資料可以晚補。
- **Technical scope**：stable record/payment/asset/occurrence identity；inventory NOT_CONFIRMED/PARTIAL/CONFIRMED；資源與 assignment views；逐 producer 的 mapping/coverage/completeness catalog；缺 priority/urgency/policy mapping 就維持 incomplete，不能造 enum 值。
- **Files/modules**：`lib/money-os/adapters/{profile-adapter,resource-producer,claim-producer,producer-catalog}.ts`、`lib/money-os/contracts/producer-manifest.ts`、`tests/money-os-source-adapter.test.mjs`、`tests/money-os/fixtures/golden-cases.ts`。
- **Dependencies**：S01/S02；representation mappings human review，與 research-policy approval 分開。
- **Data/schema impact**：aggregate 的 source collections/assignments、版本化 manifest；不存獨立可更新 derived claims。
- **API/service impact**：validated source→FinancialProfile＋NormalizationOptions＋manifest／safe limitations。
- **UI impact**：無；產 answer metadata 與 missing field refs，不反覆要求本人補不存在的 policy。
- **Tests required**：完整空 inventory vs 未問、payment overlaps、asset partitions、funding/lifecycle、30/90/365 coverage、unknown ownership/breakdown、A/C/D/E/F cases 的 supported/incomplete variants；B research only。
- **Acceptance criteria**：無 `validateClaims([])`⇒complete 捷徑；debt/obligation facts 對帳；asset purpose 不增 NW；來源 USER_REPORTED 不升 VERIFIED；producer 不產 unsupported HIGH_COST/hasGoalConflict。
- **Risks**：cash-only 當 assets 完整、30d 當全 obligations、重新生成取消主張、來源漏項變 no-action。
- **Explicit non-goals**：自動 safety/goal allocation、用 client flag 填研究空白、recurring 自動展開。
- **Rollback boundary**：producer bundle pin/version；無持久化前 revert；有資料後保 original source/manifest、停止寫新版本，不重寫歷史。
- **PR/branch**：一 PR / `feature/money-os-source-adapter`。

### S04 — 單一 analysis service＋初始 zh-TW projection

- **Objective**：source command→analysis→同 snapshot 的 read DTO/Why/localized result，先用 in-memory test ports。
- **User value**：得到能理解且不依賴 AI 的確定性優先事項或誠實限制。
- **Technical scope**：application orchestration、same-bundle validation、fingerprint、版本 dispatcher、safe errors；pure presenter/code-key catalog。source/resources/claims 在 normalization 前，不能先算 metrics 再覆寫。
- **Files/modules**：`lib/money-os/application/analyze-profile.ts`、`ports/{identity,profile-repository,clock}.ts`、`contracts/{commands,read-dto}.ts`、`presentation/{workspace,why}.ts`、`messages/money-os/{keys,zh-TW,index}.ts`、service/locale tests。
- **Dependencies**：S03；test doubles 只在 tests，無部署用 fake identity。
- **Data/schema impact**：snapshot draft（未發布）、manifest/versions；無 DB 寫入。
- **API/service impact**：private analyzeCandidate；getWorkspace/saveProfileAndAnalyze 等 typed service interfaces；持久化 commit S06 完成。
- **UI impact**：無 React；zh-TW deterministic templates 可單獨驗。
- **Tests required**：A/C/D/E supported sources、partial/R008/R015、F unsupported producer、invalid output 不回 success、unknown locale/code fallback、six-part Why/raw ID 隱藏；時計/版本/語系 repeatability。
- **Acceptance criteria**：DecisionOutput 完整權威；main null 不等 healthy/Optionality；mapping 不決策；無 UI/service 第二套 formulas；無 AI 時所有必需文案存在。
- **Risks**：app projector 抹掉 side Discover、legacy confidence 被採用、sample input 冒本人資料。
- **Explicit non-goals**：HTTP、真 auth、DB、AI、新金融文案承諾。
- **Rollback boundary**：無公開入口，revert service/presenter；金融 runtime 不變。
- **PR/branch**：一 PR / `feature/money-os-analysis-service`。

### S05 — Owner schema／隔離 migration

- **Objective**：最小 source/history/snapshot/receipt schema 在 dev/test DB 可驗。
- **User value**：未來保存資訊不丟 unknown/版本，也不混別人資料。
- **Technical scope**：§6 所列 tables/constraints；owner-scoped composite FKs、revision unique、command key unique、current source/output 一致。typed schema registration/isolated migration coverage。
- **Files/modules**：`db/money-os-schema.ts`、`drizzle.config.ts` 或 reviewed 專用 Money OS config、`drizzle/` 新 migration/journal、`tsconfig.money-os-server.json`、`tests/money-os-schema-integration.test.mjs`；不修改 rebate schema 意義。
- **Dependencies**：S04＋明確 DB schema/dev/test migration 授權、consumer subject ID contract 已定；可先存 opaque owner key，不假建 consumer account/password 表。
- **Data/schema impact**：新 namespace 表，無 production migration；所有 source collections 放 revision JSONB，非 income/expense 每類 CRUD table。
- **API/service impact**：repository schema contract；尚無 web endpoint。
- **UI impact**：無。
- **Tests required**：fresh isolated DB、upgrade-existing rebate clone（合成資料）、unique/FK/cross-owner/current-ref拒絕、JSON decimal/tag persistence、schema targeted compile。
- **Acceptance criteria**：無既有資料 destructive delta；dev/test migration evidence；失敗可 rollback 整交易；root db exclude 不掩 compile errors。
- **Risks**：Drizzle registration 只含 db/schema.ts、新 schema 未加入、root tsc 假通過、FK只驗 id未驗owner。
- **Explicit non-goals**：production DB 操作、down-drop live tables、cash numeric double truth、event receipt 提前建。
- **Rollback boundary**：未有 live records 可撤 migration；有資料後 disable writers、保 additive tables與兼容 reader，不 drop 個人歷史。
- **PR/branch**：一 PR / `feature/money-os-profile-schema`。

### S06 — Atomic profile persistence capability

- **Objective**：test authenticated subject→saveProfileAndAnalyze→持久 revision/snapshot→owner read。
- **User value**：保存後再次讀取是同份結果，失敗不留下半更新。
- **Technical scope**：repository/transaction runner；outside-transaction candidate calculation＋short CAS publish；retry receipts；historical versioned read/replay；safe audit allowlist。
- **Files/modules**：`lib/money-os/server/repositories/{profile,snapshot,receipts}.ts`、`application/{save-profile-and-analyze,get-workspace,review-current-state,get-decision-details}.ts`、integration tests；reviewed DB connection registration。
- **Dependencies**：S05/S04；test IdentityPort 固定兩個 synthetic subjects，禁止 production export。
- **Data/schema impact**：原子 source revision＋DecisionSnapshot＋current pointers＋receipt；無 independent metrics/stage table。
- **API/service impact**：§4 intent contracts 可直接測；無公開 HTTP。
- **UI impact**：無。
- **Tests required**：真 isolated Postgres、CAS race只一成功、late failure rollback、lost response retry、same-key/different payload、nested-owner refs、source/snapshot version mismatch、read不重算。
- **Acceptance criteria**：同 key 相同 payload 先查 receipt 返回 original success（不因 revision已前進誤拒）；different payload 拒；current output始終指向相同source revision；snapshot/producer lineage完整。
- **Risks**：先存profile再算、兩個writer覆蓋、same fingerprint跨owner reuse、歷史用最新validator。
- **Explicit non-goals**：consumer login、queue/cache、資料自動合併、永久 raw log。
- **Rollback boundary**：停 writers、保留 immutable records；回上一個相容 schema/source reader，不逆套 financial effects。
- **PR/branch**：一 PR / `feature/money-os-profile-persistence`。

### S07 — Consumer identity integration（硬依賴）

- **Objective**：真實受認證 session 可解析 stable opaque userId，不改 admin用途。
- **User value**：本人資料只本人可存取，session 失效安全拒絕。
- **Technical scope**：identity adapter/interface；經獨立核准方案補 suitable consumer flow/stable subject mapping，帳號 lifecycle/recent-auth boundary。不在本計畫臆定新 provider。
- **Files/modules**：`lib/money-os/server/identity/consumer-identity.ts`、核准方案明列的 session config/entry files、`tests/money-os-identity.test.mjs`；需 auth 變更時另明示 scope，不能直接擴 admin callbacks。
- **Dependencies**：S06、消費者身份方案與修改 auth 的明確授權；缺任一則停止 S07/公開 UI，S00–S06仍可驗。
- **Data/schema impact**：僅方案必需 stable subject mapping（另審）；FinancialProfile domain 不帶 owner，application envelope帶 owner。
- **API/service impact**：RequestContext來 server session；body userId 不採信，每nested read/write owner檢查。
- **UI impact**：最小合法登入／失效入口和安全 returnTo，不 redesign auth/marketing。
- **Tests required**：signed-out、expired/forged session、兩user隔離、email changed identity不換key、admin非consumer默認、open redirect、cross-user snapshot/mission/receipt IDs。
- **Acceptance criteria**：無 test identity/bypass進 production；無以 email當主鍵、無 public admin allowlist放寬；登入回原 private destination。
- **Risks**：將 Google email當穩定ID、auth guard只保頁不保action、session切人保留前人draft。
- **Explicit non-goals**：auth redesign、多 provider、假臨時身份、domain依賴Auth.js。
- **Rollback boundary**：關閉Money OS gate/adapter，保 consumer資料；admin login regression必須零；不能revert成無權限可讀。
- **PR/branch**：一獨立 PR / `feature/money-os-consumer-identity`。

### S08 — Private routing／thin transport

- **Objective**：真 owner 可由 RSC讀 service、由Server Actions送 intent，disabled gate全部拒絕。
- **User value**：受保護的最小三目的地，操作結果與後端一致。
- **Technical scope**：§9 routes/config gate、server validation/auth on every entry、safe readDTO、mutation refresh、revision response guard；不先 RESTCRUD。transport薄，不執行 rule。
- **Files/modules**：`app/money-os/layout.tsx`、`page.tsx`、`_actions.ts`、`loading.tsx`、`error.tsx`、`app/money-os/{next,data}/page.tsx`、`lib/money-os/server/transport/`、`config/money-os-access.ts`、transport tests。
- **Dependencies**：S07/S06/S04；no-store/metadata與existing root SEO檢查。
- **Data/schema impact**：無新增。
- **API/service impact**：web先 saveProfileAndAnalyze/reviewCurrentState/getWorkspace/getDecisionDetails；S12加report、S13加confirm。每Action都checkgate/identity，不只layout。
- **UI impact**：private殼與empty/loading/error，無fake分析卡；gateoff即404/安全拒絕。
- **Tests required**：Action直接呼叫繞UI、malformedowner/trustedflags、CSRF/origin、session期限、disabled route/action、no-store/noindex/private metadata、DTO serialized noBigInt/rawprofiles。
- **Acceptance criteria**：沒有 `app/api/money-os` 憑CRUD需要建立；private資料不進sitemap/JSON-LD/OG/logs/cache/publicPreferences。
- **Risks**：只隱藏menu、RSCfetch自己API、client bundle帶repositories、root robots/canonical inherited。
- **Explicit non-goals**：原生HTTP API、marketing redesign、修改/bybit/proxy全站auth。
- **Rollback boundary**：先關 gate，revert新routes/actions；source/snapshot留存，不改publicrouting。
- **PR/branch**：一 PR / `feature/money-os-private-transport`。

### S09 — Progressive onboarding／最小輸入

- **Objective**：ENTRY→DATA→確認後保存，不能因填未知被迫填假數字。
- **User value**：先答約六組問題，可稍後補資訊，不需銀行／交易所帳號。
- **Technical scope**：六組UX問題與conditional debt/obligation rows、session-memory reducer、source codec、explicit basis/completeness/日期；先看結果可送合法partial。保存完成的snapshot先回server ref，不自行算卡。
- **Files/modules**：`components/money-os/{EntryView,FinancialInputForm,SourceRecordFields}.tsx`、`app/money-os/data/page.tsx`、`messages/money-os` keys/copy、form/component tests。
- **Dependencies**：S08/S02/S03；初始 terminology review。不需要 S11完整數字UI。
- **Data/schema impact**：source revision由既有save intent保存；未提交草稿只memory，不建draft表。
- **API/service impact**：saveProfileAndAnalyze/typed field errors，expectedRevision/key固定於該確認命令。
- **UI impact**：S01/S02共用初次、補資料、編輯；六組：幣別地區／收入口徑／必要費用／債務逾期／其他必付／保留用途目標；cash等依需要再問。
- **Tests required**：unknown/known0/no-inventory區別、negative source、back/draft、partial save、field errors、failed save不覆寫結果、expired session切user、390/1440 focus/labels/touch/overflow。
- **Acceptance criteria**：structural basis答完而財務UNKNOWN可分析；requiredInitial不是必須KNOWN；不宣60秒已user-tested；無autosave currentfinance/localStorage sensitive draft。
- **Risks**：全部問卷阻firstvalue、空arraycomplete、publiccurrency選單污染profile。
- **Explicit non-goals**：巨型問卷、文件上傳、bank linking、實際personalized結果UI（S10）、offline sync。
- **Rollback boundary**：disable新form entry，保已committed資料；舊snapshot不刪，不將draft假發布。
- **PR/branch**：一 PR / `feature/money-os-onboarding`。

### S10 — First value milestone（最早完整使用者價值）

- **Objective**：本人輸入→owner commit→deterministic result→理解優先事項和原因。
- **User value**：得到supported瓶頸／Discover／無任務／observation，而非空白dashboard。
- **Technical scope**：S03 CURRENT最小readview＋main action／minimumWhy／前三metrics／limitations；綁單一snapshot。所有合法variants有基本呈現，detail progressive expansion留S11。
- **Files/modules**：`components/money-os/{CurrentStateView,BottleneckCard,MissingInformationPanel}.tsx`、`app/money-os/page.tsx`、initial presenter/UI/golden E2E tests。
- **Dependencies**：S09/S04；gates A–C，consumer identity有效。
- **Data/schema impact**：無。
- **API/service impact**：getWorkspace/getDecisionDetails，只owner同snapshot；read不重算。
- **UI impact**：priority→一句reason→適用入口→收入/核心支出/核心差額→觀測日；無healthscore/crypto圖或任務造假。
- **Tests required**：A supportedaction（僅approvedrepresentation）與partialA、C Discover、D/Eno-action完整coverage、Funsupported truthful UI；signed-out/兩user、390/1440、console/hydration、savefailed/oldsnapshotlabel。
- **Acceptance criteria**：使用者可完成六組回答、看合法partial結果、辨別最值得處理的問題、看到依據/unknown/未驗證提示；CCF不是存款；primary完全engine選；無AI照常可用。
- **Risks**：main null都「健康」、未知卡顯0、oldmetrics配newinput、prefix英文字當術語。
- **Explicit non-goals**：all-eight首屏、完整missionprogress、AI、投資建議。
- **Rollback boundary**：停新result routes入口；snapshot可經service安全讀，unreleased UI revert；無financialwrite回退。
- **PR/branch**：一 PR / `feature/money-os-first-value`。

### S11 — Snapshot／六塊 Explainability

- **Objective**：首值後漸進展開八指標與 Why，支持完整合法輸出而非summary-only。
- **User value**：理解資料、口徑、假設與不能判斷之處，不信黑箱。
- **Technical scope**：same-snapshot metric/Why projections、confidenceAssessment、side findings/provenance、unsupported codefallback；歷史明標，不latest改舊結果。
- **Files/modules**：`components/money-os/{SnapshotView,ExplainabilityPanel,MetricDetails}.tsx`、presentation/catalog及component/contract tests。
- **Dependencies**：S10；six-part copy/terminology review。
- **Data/schema impact**：無新derivedtruth；snapshot按原bundle讀。
- **API/service impact**：getDecisionDetails owner read，只傳受控Why projection，不fullprofile。
- **UI impact**：S03看更多monthlySurplus/liquidity/runway/DSR/NW；S04資料、數字、mechanism、assumptions、missing、limits。ordinary層不露raw R-*／AS-*。
- **Tests required**：known/unknown/zero/signeddeficit、basis/unit/date、truncatedsideprovenance拒、LOW/researchlimits、noaction/observation/scopedcontradiction、longtext/keyboard/200%文字。
- **Acceptance criteria**：只有complete assets才稱總NW；no rounding入rules；options=[]不造選項；R015保獨立repair、R008修正無financialallocation。
- **Risks**：漂亮display掩unknown、confidence當severity、legacyconfidence、只保mainchain。
- **Explicit non-goals**：charts、healthscore、forecast、新金融模型、financialdesigner重寫。
- **Rollback boundary**：保S10minimumreadview，撤detailUI；source/output不變。
- **PR/branch**：一 PR / `feature/money-os-decision-view`。

### S12 — Main Quest／Discover／no-mission與報告

- **Objective**：engine一Main＋0–3Side可理解、可開始／本人回報，探索與無任務同等合法。
- **User value**：知道WHY/WHAT/IMPACT/VERIFY；找到資料即資訊進展，沒有工作可離開。
- **Technical scope**：S05 MISSION、reportMissionProgress service/repository、report與definition分離、stale relevance、snapshot+mission+owner identity；Discover跳S02指定欄→save pipeline；no-mission不新增任務。
- **Files/modules**：`components/money-os/{MissionCard,MissionView,MissionProgressActions}.tsx`、`application/report-mission-progress.ts`、`server/repositories/mission-reports.ts`、`app/money-os/next/page.tsx`、report/mission tests。
- **Dependencies**：S11/S06/S08；existing mission_report schema。
- **Data/schema impact**：獨立progress revision/history，engine新mission仍TODO；不覆寫DecisionOutput。
- **API/service impact**：新增reportAction，membership/relevance/CAS/key必驗；不generalcompleteMission financial mutation。
- **UI impact**：same三目的地；Discover查APR/expenses→回填→分析；USER_REPORTED_DONE顯未驗證，REPORT_ONLY可稍後更新；noaction可離開。
- **Tests required**：main/side來源與數量、Discover不抹repair、unknownAPR填KNOWN但分類仍unknown、noaction不manufacture、stale/crossowner/reportretry、VERIFIED_DONE與不支持N/A拒絕。
- **Acceptance criteria**：報告不改metrics/claim/balances、不falseverified；無任務符合R014條件；缺producer不是反覆請本人找更多資料。
- **Risks**：相同semantic missionId跨snapshot自動完成、完成按鈕扣debt、userreported當proof。
- **Explicit non-goals**：XP/streak/badges、verificationproofproducer、declaredpayment/AIadviser。
- **Rollback boundary**：停reportAction，保reports/history和read；不回寫舊snapshotstatus。
- **PR/branch**：一 PR / `feature/money-os-mission-loop`。

### S13 — OBSERVED_STATE Reality Loop milestone

- **Objective**：回報→核對真實觀測資料→atomic分析→新結果/changed Why，迴圈完整。
- **User value**：看實際狀況是否變了，而非勾選就宣布進步。
- **Technical scope**：confirmFinancialState共用save-and-analyze、source observation/revision、mission link、compatible-basis before/after projection、out-of-order UI保護。
- **Files/modules**：`application/confirm-financial-state.ts`、`presentation/decision-change.ts`、`components/money-os/{FinancialStateUpdateForm,DecisionChangePanel}.tsx`、action/realityloop tests。
- **Dependencies**：S12/S06/S04；源資料producercoverage仍須有效。
- **Data/schema impact**：新immutable revision/output與receipt，link報告；無balance deltaledger。
- **API/service impact**：confirmFinancialStateAction(mode=OBSERVED_STATE)；requiredrevision/key；DECLARED_EVENT/VERIFIED_DONE回unsupported。
- **UI impact**：S06→CURRENT；前值/新值/日期/確認、失敗保draft/lastvalid、reportonly可退出。
- **Tests required**：A收入更新但cash不自增、Cunknown→known分類仍缺、E surplus變但cash不變、F改日期仍unknown；lostresponse同key、races/stalemission、updatefailure全部rollback、不同basis/版本不稱改善。
- **Acceptance criteria**：不是套paymentdelta；未知principal可回報目前餘額，未知新餘額reportonly；重算後mission仍可能same/noaction/moreimportant，不自verified；新Current/Next/Data同revision。
- **Risks**：本人預算當實現、unknown→known當改善、同一事件observation再扣一次、retryduplicatefinancialupdates。
- **Explicit non-goals**：declared-event、銀行認證、猜principal/interest、推播與daily engagement。
- **Rollback boundary**：停confirm writer，保lastvalid/sources/reports；不得逆算假金融回退，舊reader保版本兼容。
- **PR/branch**：一 PR / `feature/money-os-reality-loop`。

### S14 — MVP hardening／安全與可觀測性

- **Objective**：把既有slice證據整合成可審閱的bounded MVP驗收，不宣布部署。
- **User value**：private data安全、mobile可讀、failures可恢復。
- **Technical scope**：security/limits/privacy/telemetry coverage、safe audit、freshness/replay、realDBconcurrency、390/1440/keyboard/screenreader、noAI path、公網既有routesregression。
- **Files/modules**：已有MoneyOSnamespace與tests、最小server telemetry adapter、安全gate設定；必要retention/export/delete能力只在另批准policy/scope下做，不順帶删production。
- **Dependencies**：S13、consumeridentity、representation review；retention/deletion/backup/supportaccess decisions必須明確才能開放真實資料。
- **Data/schema impact**：不新增金融derivedfields；必要privacyindex/migration另review。
- **API/service impact**：所有entrygate/auth/limits/CSRF一致，typed safeerror、request correlation。
- **UI impact**：修actual accessibility/responsivebug，非redesign。
- **Tests required**：兩user/crossnested refs、直接Action、session切換、logs redaction、payloadboundaries、timeout/retry、realDBrollback/receipt、historicalunsupportedbundle、fullgolden paths、console/hydration/link/overflow、public regression。
- **Acceptance criteria**：GateF全部pass，logs無numbers/privatepayload/token/DBURL；ruleIDs僅restricteddebug；rollback/backup/retention方案有review，未知producer不假pass。
- **Risks**：測試DB誤指production、snapshot永久敏感保留、AI/debug外送資料、以build當userQA。
- **Explicit non-goals**：production rollout/merge、financial-policyapproval、全球合規認證。
- **Rollback boundary**：整MoneyOSgateoff、停writers、保compatible讀與資料；recovery只isolatedrestore演練。
- **PR/branch**：一 PR / `feature/money-os-mvp-hardening`。

### S15 — Minimal public entry（獨立 visibility gate）

- **Objective**：核准開放時從現有工具資訊導入private產品，Bybit保持分離。
- **User value**：知道在哪開始，不必經交易／返傭onboarding。
- **Technical scope**：最小既有MoneyOS相關工具入口link與用途/資料處理告知，不改首頁定位或publicIA；gateoff不廣告可用產品。
- **Files/modules**：預期僅`app/tools/life-allocation/page.tsx`既有CTA/告知與entry regressiontest；具體copy/入口須產品授權。
- **Dependencies**：S14＋public entry文字/visibility批准；缺批准就保直接private進入，不阻核心DoD。
- **Data/schema impact**：無。
- **API/service impact**：無；publicroute不分析/存profile。
- **UI impact**：最小link到/money-os，未登入交給合法consumerentry；原scaffold不冒已收集資料。
- **Tests required**：gateon/off、signed-in/out return destination、publicSEO與noindex隔離、/bybit及publicroutes不变。
- **Acceptance criteria**：noBybit-first、沒有marketingredesign/新sections；入口未開放不誤導。
- **Risks**：先廣告unsupportedproduct、scaffold告知與實際收集矛盾、sitewide menu動太多。
- **Explicit non-goals**：重構publicsite、首頁新section、Bybitaccountintegration。
- **Rollback boundary**：撤link，privategate照常保護；資料不刪。
- **PR/branch**：一 PR / `feature/money-os-entry-integration`。

### S16 — Optional AI explanation（後置、非必要）

- **Objective**：已成立的結果可另獲解釋，模板仍完整fallback。
- **User value**：降低閱讀難度，不改任何金融結論。
- **Technical scope**：ExplanationPort最小安全projection、timeout/budget、plaintext/refs/version檢查，critical instructions仍template；若自由語意不可驗，拒用而不是假稱安全。
- **Files/modules**：`lib/money-os/application/explain-decision.ts`、`server/explanation/`、`components/money-os/OptionalExplanation.tsx`與failure/semantic tests。
- **Dependencies**：S14、provider/privacy/outbounddata與可能SDK獨立授權；未配置時No-AI adapter。
- **Data/schema impact**：不改profile/output；無預設explanationcache。
- **API/service impact**：owned snapshot read projection→plain explanation；無financialcommand工具。
- **UI impact**：可選補充文案，不loading阻核心結果。
- **Tests required**：noAI/providererror/timeout/wrongrefs/inventednumber/promptinjection→fallback，財務output/fingerprint始終不變。
- **Acceptance criteria**：無stage/severity/newmission/unsupportedadvice/delta/provenance寫入；projection數字仍敏感，不能說structured即匿名。
- **Risks**：模型改寫帶隱含金融承諾、privatepayload進providerlog。
- **Explicit non-goals**：complexAIadviser、金融判斷、banktools、MVP必需dependency。
- **Rollback boundary**：關No-AI feature即可，無financialstate/schema回退。
- **PR/branch**：一optional PR / `feature/money-os-optional-explanation`。

### S17 — Controlled DECLARED_EVENT（後續、非必要）

- **Objective**：僅完整支持的occurrence/effects可原子貼一次，不與observed mode重疊。
- **User value**：未來可明示已知本金/利息/費用，而非猜付款對餘額影響。
- **Technical scope**：closed effects、funding/source/breakdown/conservation、economic template+occurrence identity、effectpayload-equality receipt、與observedstate互斥。
- **Files/modules**：`application/apply-declared-event.ts`、`server/repositories/effect-receipts.ts`、reviewed effectreceiptmigration、`tests/money-os-declared-event-integration.test.mjs`；只合格事件才加UI。
- **Dependencies**：S14＋eventcontract/migration/產品能力獨立review；不是先做full event-sourcing。
- **Data/schema impact**：effectreceipts及其owner/occurrenceunique/FK，linkedimmutable source/output。
- **API/service impact**：獨立受限intent，未知breakdown unsupported/reportonly；命令receipt與effects同交易。
- **UI impact**：未合格不呈事件模式；不改defaultOBSERVED_STATE。
- **Tests required**：cash−total、debt−principal、principal+interest+fees對帳、assignment轉換不增NW、rename/differentkey sameoccurrence no二貼、samekeydifferentpayload拒、partialfailure全rollback、observed同事件互斥。
- **Acceptance criteria**：terminaloccurrence不reopen、receipt不是外部proof，不能VERIFIED_DONE；所有effects先驗後套。
- **Risks**：rename繞id、只用idempotencykey不看economicidentity、observe+delta雙扣。
- **Explicit non-goals**：銀行exchangeimport、payment執行、自動salary/asset-saleposting、外部verification。
- **Rollback boundary**：關eventwriter，保effectreceipts不刪以免重貼；observed讀寫只在一致schema/歷史source下恢復。
- **PR/branch**：一optional PR / `feature/money-os-declared-event`。

## 4. Analysis／intent contracts 與一致性

下列是 application contract，不直接等同新增 endpoint。所有 write 從 server RequestContext 取 subject/clock/requestId；body 不接受 owner、config、derived flags、VERIFIED source、完整 DecisionOutput。每個 nested ID 亦驗 owner。入口先 gate/auth，再 server codec，再 service。隱藏UI不是安全邊界；沿用[Next.js 官方 data security 指引](https://nextjs.org/docs/app/guides/data-security)核對每個 Server Action 的授權與輸入驗證，不升級目前 Next16.2.6。

| Intent | Input → Output | 拒絕／預期 state | Retry／slice |
| --- | --- | --- | --- |
| getWorkspace | session scope → source readDTO/current snapshot/separate reports/freshness，無profile→NEW_USER | unauthenticated/notfound/unsupportedversion；無mutation | read不重算；S06/S08 |
| saveProfileAndAnalyze | edits＋explicit basis＋expectedRevision（new=0）＋key → committed revision/snapshot/DTO | fieldprecision/currency/basis errors、CAS、unsupportedcapability、invalidoutput | same owner/operation/key+payload先receipt→originalresult；S06/S09 |
| reviewCurrentState | explicit confirmed asOf/period＋revision＋key → reuse或新observation/snapshot | 未確認時間不能假「今日」；version/basis/CAS | identical fingerprint可reuse，不navigation重算；S06/S10 |
| getDecisionDetails | owned snapshotId/conclusionId → Why/metrics/history projections | nonowner也NOT_FOUND、missingbundle、不支持codefallback | read-only；S08/S11 |
| reportMissionProgress | snapshot/mission/status/reportRevision/key →獨立report與snapshotref | status/relevance/owner/CAS；VERIFIED_DONE unsupported | 沒finance delta；S12 |
| confirmFinancialState | OBSERVED_STATE/observed source values/basis/revision/optionalmissionref/key →共用分析result＋changeprojection | field/owner/stale/version/domain/outputfailure | 與save共用implementation；S13 |
| applyDeclaredEvent | economicoccurrence＋closedeffects/breakdown/sourceids/revision/key →receipt/newoutput或sameeffectno-op | unsupportedproof/breakdown/conservation/occurrenceconflict | key之外economicidentity/equality/transaction；S17 only |

Primary orchestration 唯一：load scope/source → construct candidate → validate source codecs/basis/identity → resources/claims → normalize+calculate → frozen evaluate → validate complete output with same bundle → CAS atomic commit → safe read projection → localize。分析不直接由UI逐rule調用；runAnalysis/recalculate為private implementation，不建任意公開觸發點。Clock/asOf/period固定於command，retry不能換今天的basis。

expected金融UNKNOWN、Discover、R015 scoped correction與R008合法halt是有效domain結果，與 malformed output/systemfault分開。typed errors分類沿架構：VALIDATION_ERROR、MISSING_REQUIRED_INFORMATION、DOMAIN_INVARIANT_VIOLATION、UNSUPPORTED_MODEL_VERSION/SCHEMA_VERSION/CAPABILITY、REVISION_CONFLICT、STALE_MISSION、IDEMPOTENCY_CONFLICT、UNAUTHENTICATED、NOT_FOUND、UNAVAILABLE、INTERNAL_ERROR。只回safeCode/fieldRefs/requestId/retryable，不raw exceptions。

DecisionSnapshot不是cache：成功發布才保存；同一transaction包含source revision、producer manifest、完整output、commandreceipt/currentpointers。inputRevision/asOf/period/currency/config/runtime/rule/model/evidence/assumption/codec版本固定。locale/AI不進financialfingerprint。historicalreader按原bundle validate，不 latest覆寫舊output。

Policy eligibility是能力／發布gate，不是另一排序器：逐producer核准能力清單；未核准資料不能生成HIGH_COST或goalconflict。若原版runtime仍產生未獲准對外提供的research-action，該consumer analysis保持unsupported/受限測試、不發布為正式個人化建議；不刪改mission、偷換stage或把研究fixture變knownsource。source candidate保draft、lastvalid保原版本。是否可對外提供deterministic repair文案也須launch審閱。

## 5. Money、UNKNOWN、currency、time 的實作規格

### 5.1 明確的 representation 與 bounds

- SOURCE/API/JSONB：canonical nonnegative decimal string＋currency/unit metadata；不是JS float。KNOWN zero是「0」；UNKNOWN/N/A只有tag/reasonCode，hidden data/null/value一律拒。
- 內部金額用整數 coefficient＋decimal scale（BigInt 不出 JSON）。它是精確十進位量，不冒充已批准的 currency minor unit；需要 integer minor-unit representation 的支付／外部單位轉接，才使用下述 declaredScale 的精確轉換。不得把每種 currency 硬定兩小數。核心 sum/product 重用 S00/frozen decimal 路徑，不另建算術模型。
- `toMinorUnits(value, declaredScale)`只有currency/unit contract已批准該scale才可用：精確integer換算，不能表示就拒/保UNKNOWN，不round來源。MVP無paymentposting不需先強制轉某固定currency最小支付單位。TWD輸入0.001不可因顯示習慣改成0。
- canonical Number conversion round-trip必須相等；0.1/0.2可入、sum為0.3；9007199254740993拒。IEEE binary近似本身不等validation fail，判的是canonical decimal無損表示。超出frozennumbercontract不能因NUMERIC能存就分析。
- 初始technical limits（S02須boundary測試）：raw numeric token≤64 characters、整數digits≤48、小數scale≤18；字元只ASCIIdigits與至多一個decimal point，reject exponent/NaN/Infinity/plus/minus/groupseparators。trim UI空白後canon，leading/trailingzero按一種表示正規化。零負號不當source合法，derived signed值另codec。
- command decoded JSON UTF-8≤256KiB；每種source collection≤100筆；record name≤120 Unicode code points、其他單行free text≤500。拒額外unknown/trusted欄、深度無界objects與超限body。這些是資源／representation限制，非財務建議門檻；版本化，可獨立審閱調整，不憑空截斷資料。
- currency從明确profile/sourcemetadata，與locale/publicPreference無關；同幣別才入globalprimaryCurrency frozenprofile。混幣保source但不猜FX/改標TWD。APR_PERCENT的12=12%，adapter保12；DSR0.25=25%為ratio，非money。

Storage aggregate JSONB精確string；若後續需獨立SQL金額欄，用NUMERIC/stringcodec。不設FLOAT或假全域scale；[PostgreSQL 官方 numeric 文件](https://www.postgresql.org/docs/current/datatype-numeric.html)明示exact numeric與指定scale的rounding特性。MVP不雙存string和number作兩份source。

### 5.2 必須寫成獨立 expected 的測試表

| Vector | Expected |
| --- | --- |
| UNKNOWN、N/A、KNOWN0 | 三態往返不混；N/A只在frozen支持處；未答draft不假0 |
| omission／explicitUNKNOWN | edit omission=keep；explicitUNKNOWN=setunknown；null不是delete |
| 0.1＋0.2／1−0.9 | exactdecimal0.3／0.1，不用epsilon |
| 0.001到declaredScale3／2 | 1 minorunit／拒lossconversion，無round |
| 負sourceamount／負CCF/NW/liquidity | 前者validationerror、不abs；後者合法signed（liquidity呈缺口） |
| 大整數9007199254740993 | Numberroundtrip失敗，來源不發布分析，不變成9007199254740992 |
| digits/scale/payload邊界 | atlimit通過其餘guard；overlimit拒、不truncate |
| 非finite／exponent／分隔符 | API拒；UI可顯localegrouping但提交canonical，ambiguous不猜 |
| TWDsource＋USDrecord | 不FX、不同標籤硬加，相关scope受限 |
| displayrounding | 規則仍用originalvalue；非零小額不無提示顯0，可看完整精度 |
| 0 denominator | ratio/runwayUNKNOWN，不Infinity或假0 |
| APR12＋DSR0.12 | 不互轉、不按未核准APRthreshold分類 |

Formatter只末端Intl/typedunit；顯示rounding不入source/fingerprint/rule。financialdate為ISOcalendar YYYY-MM-DD，monthlyperiod為YYYY-MM，auditUTC TIMESTAMPTZ。financialCalendarZone明示IANA，台灣可預填Asia/Taipei需確認；不同裝置timezone不能改due/asOf日。固定30/90/365date-onlyhorizons遵frozen，不自己年化。

## 6. Persistence／migration 實際順序

### 6.1 最小 entities 與 truth

| Table/aggregate | 保存什麼／不保存什麼 | 首次slice |
| --- | --- | --- |
| money_os_profiles | owner/profile/currentRevision/currentDecisionId；uniqueowner | S05 |
| money_os_profile_revisions | immutable SOURCE JSONB：income/expenses/assets/liabilities/obligations/goals/household/assignment intents＋stableIDs＋basis/tags/schema | S05 |
| money_os_decision_snapshots | DERIVED/HISTORY完整validated output＋inputrevision＋versions/producer manifest/fingerprint | S05 |
| money_os_command_receipts | owner/operation/key/digest/resultrefs，與write同transaction | S05 |
| money_os_audit_events | 最小操作/時間/ref/outcome，非financialpayload | S05 |
| money_os_mission_reports | SOURCE progress/reportrevision/sourceSnapshot/missionId/userreportedstatus，不改engineTODO | S05或同migration緊鄰S12前，S05採先建避免不必要schema版本 |
| money_os_effect_receipts | economicoccurrence/equality/before-afterrefs；非MVP預建 | S17 |

每income/expense/asset/liability/obligation/goal是aggregatecollection，不建個別CRUDtables。Assignments是SOURCEintent；resources/claimfunding/metric/stage為DERIVED，只在snapshotmanifest/output保可重播資料，不另永久可更新cache。historicalsnapshot敏感，immutable不是永久無限留存。無CACHED資料表。

### 6.2 Migration release checklist

1. S05先reviewgeneratedSQL/diff/journal、db-schema registration和targetedcompile；不本次生成SQL。加入MoneyOSschema需確保drizzle.config目前單一db/schema.ts路徑有reviewedregistration。
2. development只合成/本人明示測試資料、獨立DB/role；apply新schema→約束測試→rollback/restore演練。
3. CI/test顯式testDBconfig，拒既有production DATABASE_URL和未識別target；不可直接沿repo production credentials。測試DB provisioning使用者授權後才做。服務fakeports與真DBintegration標籤分開，不能因fakepass說DB完成。
4. test跑fresh install、existing additive upgrade、transactions/FK/unique/owner/race/receipt、讀舊source/output版本、requestlostretry。失敗不開consumer入口。
5. production later：另請明確授權、核對target/backup/role/connectionlimits/維護window、migrationreview＋restoreevidence＋gateoff；migration與deploy是兩個不同批准，本計畫皆不執行。
6. 啟用writers前確認appreader兼容schema。有live資料的rollback先關gate/writers、回compatibleapp，保新tables/revisions；不drop或downgrade未知source，不逆financialevent。
7. 後續schema/codec/model/producer升版分開：preserveoriginalrevision、newmigrationreason、oldbundleavailable。不能silentunknown→0、改歷史output或把modelupdate說成進步。
8. S17才effectreceiptmigration，關eventwriter可回observedMVP但保receipts。retention/export/delete和backupexpiry需policy及scope review，no unrelatedrebatecascade。

## 7. Consumer auth 與安全先決

S07適用身份決策未完成，屬具體future dependency。下一consumerauth任務先確認stable opaque subject的建立/持續性、email變更/session期限、刪除後舊subject不可重啟、合法returnTo/CSRF/re-auth能力與既有admin隔離；缺方案就不實作fake帳號。Domain始終不識authprovider。

S06用test注入的兩個fakeIdentityPort測隔離合理；test double不得有request可選開關、不得export入productionserver，S08之前沒有可收財務資料的webroute。private受邀測試也必須真consumeridentity，不能說hiddenroute等於auth。本人資料ownerfilter涵蓋所有nestedresource/claim/assignment/mission/snapshot/receipt引用。

Safe observability从S04/S06開始：money_os.analysis.completed/failed、money_os.command.revision_conflict/retry、money_os.mission.reported、money_os.identity.denied，只allow requestId/operation/errorcategory/validationcode/bundleversion/耗時/結果分類；rule IDs可restricteddebug，不publicanalytics。事件不得帶amount/balance/privatepayload/token/email/rawusertext。偵錯wrongdecision以restrictedauditref＋owner授權provenanceinspection/replay，非把profiledump到log。

## 8. UX capability map／localization／progress

| Approved screen | slice／資料 | 完成界線 |
| --- | --- | --- |
| S01 ENTRY | S09用途/資料控制→consumer session | 無finance sample冒本人；Bybit非入口 |
| S02 DATA | S09初次；S12Discover；S13編輯 | 同form/sourceDTO、unknown/partial保留，無巨型前置問卷 |
| S03 CURRENT | S10firstvalue；S11完整展開；S13回訪 | same snapshot前三metrics，stage/bottleneck nullable有語意 |
| S04 WHY | S10最小reason；S11六塊drill-down | rawRuleIDs隱藏但chain結構在受控projection保留 |
| S05 MISSION | S12main/side/Discover/report | WHY/WHAT/IMPACT/VERIFY；engine排序不client重排 |
| S06 UPDATE | S13observedmode | 本人真觀測，retry/CAS/rollback，非付款button |

Localization從S04做第一個可用catalog，不等最後才翻譯。namespace `moneyOs.{entry,input,metric,stage,severity,mission,finding,missing,why,error,progress,limits}`；typedparams帶unit/date/source/basis，domain code不寫中文。zh-TW必需keys完整；en-US/ja-JP不本次新增但samekey可擴充。缺key/code顯「這項說明暫時無法顯示」+safe diagnostic，不AI造recommendation、不改semanticstate。financialrunway/MainQuest等術語未最終核准，在UI gate做人話review/新手理解，不把registry English當copy。

IN_PROGRESS／USER_REPORTED_DONE是獨立applicationreport。VERIFIED_DONE保留unsupported辨識和拒絕測試，不能發送/顯badge。NOT_APPLICABLE不等稍後。DiscoverunknownAPR找到數字只資訊進展，costclassification仍缺producer就如實限制；必要支出unknown依missingrefs補，不能fake0。NO_ACTION_REQUIRED需R014支持、claimcomplete＋無獨立action；OBSERVATION_ONLY和NEED_MORE_INFORMATION不假「健康」。

RealityLoop比較samecurrency/compatibleperiod/basis/model版本的known兩端；unknown→known叫「現在可計算」，本人回報叫執行紀錄；asOf/版本不同明示依據差異，不自稱改善、收益或verified。

## 9. Routing、simple feature gate與public coexistence

保approved三目的地：`/money-os`目前狀況（初次ENTRY/analysis/return variants）、`/money-os/next`下一步、`/money-os/data`我的資料。Why/mission/update是drill-down/componentmode＋ownedref，不增加setup/mission/profile獨立publicpages。malicioussnapshotref依owner拒絕。

S08以一個server-only `MONEY_OS_ENABLED` 基礎visibility gate（default false）＋可選approved internal-user-ID access set就足夠，不加flagplatform/Redis。這是產品存取env而非financialpolicy，不能把threshold/env混入runtime。layout、reads、actions每entry都enforce；gateoff不得load/savefinance。internalinvite是stableconsumerID，不adminemail。S15只在明確開放入口後連既有toolCTA；未批准保gateoff、不新增全站menu/首頁sections。

privatelayoutoverride inherited robots/canonical/OG，noindex且私有資料no-store，不加sitemap、JSON-LD、publicpreferencefinancialstate或公開snapshotasset。existing root有publicSEO/PreferencesProvider，允許新增private namespace的最小override，不需改全站架構；publiccurrencypreference絕不換本人profilecurrency。Bybit/publicmarketing不變，任何既有publicpage實際改動須S15獨立小diff授權。

## 10. Golden A–F何時可執行（不改凍結預期）

來源是UX§13/Architecture§30；固定asOf2026-10-02、monthlyPeriod2026-09、TWD、net/monthly/stockbasis與USER_REPORTED來源。expected獨立手寫，禁止由evaluator生成再當oracle。raw-source、normalized-context-only、research-policy-fixture三種標籤明確分開。

| Case與數字／期待 | runtime／source／UI／loop里程碑 | 能力限制／必須驗負例 |
| --- | --- | --- |
| A income30000/necessary35000/cash60000→CCF−5000、R003/SURVIVAL/REPAIR_CORE_CASH_FLOW | S01runtime、S03source、S10firstvalue；S13確認income38000且cash仍60000、重新對帳無activeclaims→CCF3000/R014 | 支持source claim mapping未通過不能硬填priority/urgency；partialA可以repair＋missing但不假noaction |
| B income60000/necessary25000/discretionary10000/cash10000/debt100000/min5000；qualifiedHIGH_COST＋safetyclaim30000/AS0011→R005/R012 | S01researchfixture；S03adapter必驗unsupportedpolicy不造known；S10/UI測試只能明標isolatedresearch，正式E2E待policyproducer核准 | cash30000→R006僅研究完整loop；未核准consumer能力受限，不以testuserfixture繞過發布gate |
| C income60000/necessary20000/discretionary10000/cash100000/debt50000/min1000，APR/classUNKNOWN→CCF39000/surplus29000、CONFIRM_DEBT_COST | S01runtime、S03source、S10Discover、S12補APR；S13只APRknown分類仍unknown | 不給debtacceleration、不反覆責怪本人漏填classification、仍非VERIFIED |
| D income60000/necessary20000/discretionary10000/cash100000，完整無debt/obligation/priorityclaims→R014/mainnull/stagenull | S01fixture、S03coverage對帳、S10noaction；S13同basis回訪不造新任務 | cash100000/NW100000/runway5需inventory完整；validateClaims([])不是coverage證據，不稱全球健康/Optionality |
| E income200000/necessary80000/discretionary120000/cash300000→surplus0、R014/mainnull | S01/S03/S10；S13真實回報discretionary100000→surplus20000、cash仍300000 | 不造capitalformationmain、不把打算省錢當已存資產；R014需completeness通過 |
| F income100000/necessary40000/discretionary20000/cash1000000/goal2000000/date2028-10-02/funding0→R009side、OBSERVATION_ONLY，conflict/sustainabilityUNKNOWN | S01合格goalclaimfixture；S03source只reviewedmapping，否則partial；S11observation/limits；S13延2029仍unknown | goal不是reservation、target不扣cash、無R014/投資比例/DECIDE_GOAL_PRIORITY；R010normalizedfixture不算raw-sourceE2E |

A/C為最早production-source firstvalue候選；D/E須completeness支持才有對應noaction；F supported observation須claimrepresentation審查。沒有fixture producer的source能力不能宣fullE2Epass。B政策延後不阻S00，但若要正式MVP宣支持B action則policyapproval是blockinggate，不能在DoD標「全功能完成」。

額外最低負例：known逾期＋unknownincome/debtAPR仍repair；R015不抹independent逾期；R008globalhalt；expense/minimumoverlap不doublecount；同assetpartitions不創金錢；unknownprincipal不能post；zeroincome/zeroCMOratioUNKNOWN；samekeydifferentpayload/conflictingoccurrence拒；staleUI不能覆寫新snapshot。

## 11. 每slice測試策略與證據規則

- S00–S02：node:test/unit/contract/純TS typecheck最便宜，不需E2E。
- S03–S04：source→完整domainoutput→localized DTO的contract/service測試；fakeports合法但明標，不宣DB/auth已驗。
- S05–S06：isolated真Postgresintegration是必要，不以mock取代constraints/transactionrace；無proddata。
- S07–S08：identity/service/transport安全測試，直接Action及nestedrefs；最小browser session flow到UI前有可核對安全狀態。
- S09：form/component＋一個保存路徑browser；S10：首次完整userpath E2E里程碑。
- S11–S12：component/locale/contract與Discover/noaction/report核心flow，不每卡都另建expensiveE2E。
- S13：RealityLoop E2E＋真DBretry/CAS/race；S14整合matrix及mobile/accessibility/private/publicregression。
- S15–S17：只加入相關entry/AInegative/effectconservationtests，不更改golden金融expected。

共享一份 `tests/money-os/fixtures/golden-cases.ts` source與手寫semanticexpected，domain/locale/service/E2E消費同oracle；displaycopy另驗映射，不建立第二金融expected。已凍結的independentexecutablecases/adversarial/collision原始diagnostics保留；compatwrapper和runtime比自己不是oracle獨立性證明，需原expected＋pinnedfreezeoutput全欄characterization。

每slice通用：pnpm typecheck、pnpm lint、pnpm spec:validate、pnpm test（test包含Next及本機vinextbuild）；有新增domain/server/catalog另targetedcompile/importcheck。根tsconfig目前exclude db且targetES2017、messages不在include，要明確加有意義的coverage，不用tscpass冒未檢檔。新腳本只在授權implementation PR新增，這次不改。

browser harness：UI實作前先核對現有可重用工具；若無可重現自動component/browserharness，S09提出最小devdependency需求與lockfile影響供審，不安裝大型UIframework/改runtime依賴。390px/1440px、200%文字、keyboard、focus/labels/liveerrors、nohorizontaloverflow/console/hydration、screenshots明確驗；不能用rendered-html靜態suite代替互動E2E。

證據分PASS/FAIL/NOT_RUN/BLOCKED_CONDITIONAL；不得skips算能力pass。requiredslice tests失敗停止，不改oracle吞失敗。實際testcount可增加，不得少於原210定義／刪既有diag；financialdiff或genuineincompatibility另review。

## 12. PR／branch／rollback策略

每S00–S17一小PR，optional後置；S04初始語系隨service一PR而非先做大量localeframework，S09表單和S10value分開，S12任務與S13金融更新分開，S05schema與S06writer分開。每個PR可獨立review/test；有依賴就stackedbranch＋base=上一已審baseline，禁止先把未驗schema/auth/UI全堆一個PR。

Branches如§2，現在只documentationbranch已建立；不預建18branches。起實作前確認repoHEAD/status/remotes/基準、保unrelateddirtyfiles。每PR說清source/derived/UI/auth/DB影響、goldencoverage/limitations、命令結果、gate證據、rollbacks、no merge/deploy。建立PR也須當時使用者授權，不因命名表自動開遠端PR。

Commit只stage該slice明列檔案；`.artifacts/` screenshots/logs/diagnostics不commit、不可gitadd全repo。GitHubpush與Sites/production不同，安全push到指定remote、不force改已接受分支。不得merge/deploy除非後續明確授權；CI若有preview要先知其環境，不能用productiondata預覽。

Rollback通則：purefoundationrevert不觸資料；schemaadditive保records，關gate/writer後回compatible reader；authrollback不得打開無權限讀；UI撤入口不刪source；financialeffects不能「反套一次」當rollback；eventreceipts保留避免重貼。每slice原卡列具體範圍，不依賴gitreset-hard或liveDROP。

## 13. Implementation gates（客觀停止點）

| Gate | 跨越位置 | 必須通過的證據 |
| --- | --- | --- |
| A Domain parity | S01→S02/S03 | original210＋6diag不減；完整DecisionOutput/diagnostics canonicalparity；8metrics/unknown/R008/R015/排序/provenance版本驗；no React/Next/DOM/docs runtimeimports；samebundleconfig baseline1 |
| B Persistence integrity | S06→S07/S08 | isolatedrealDBmigration/constraints/CASrace/rollback/currentrefs/receiptretry/historicalreader全部pass；2subjects nestedowner拒；無productionmigration |
| C First deterministic analysis | S04＋S06/08完成→S09 | typedsource→supportedproducer→samebundlevalidatedoutput→atomic保存→zhTWread完整；A/C/partial/D/E條件案例，B/F不支持限制如實；auth/transport已就緒才接UI |
| D First UX value | S10→S11/S12 | realconsumersession，六組回答unknown合法，supportedA或C result＋reason/limitations；D/E完整scope不造任務；390/1440nooverflow/console/hydration、focus/labels、failedsave保lastvalid、noAI |
| E Reality Loop | S13→S14 | reportonly不動財務；confirmedobservedupdate→同transaction新revision/output/receipt→changedWhy；A/C/E/F合法期待、retry/CAS/stale/unknownprincipal不post、無fakeverified |
| F Bounded MVP hardening | S14→visibility/release request | A–E所需證據＋2userendtoend/privacy/logredaction/no-store/noindex/gateoff/manualflow/realDBrecovery；source/policy/term/retention/backup/authreview；所有requiredtests與現有publicregressionpass；pendingcapability明標未發布 |

Gate A通過不核准AS001 policy；Gate C service無auth測試不等consumer已可用。任何跨slicegenuinecontractincompatibility、unreviewedproducer或consumeridentity未定，不跳gate、不fakevalue，不改frozencontract，列affectedcapability回報。

Release有另外人類批准：MVPbounded範圍是否接受、術語/隱私/金融政策、migrationtarget、productiondeployment。GateF不是自動merge/deploy authorization。

## 14. Risk register（slice owner／對策／失敗停止）

| Failure mode | Slice／mitigation與驗收 |
| --- | --- |
| UNKNOWN/N/A→0、inventory猜完整 | S02/S03/S09；tagroundtrip/hiddenvalue拒/explicitinventory與claimscoverage負例 |
| monetaryprecisionloss/false rounding | S00/S02；canonicalcodec/coefficients/Numbergate/minorunitexactness/limits/display不回寫 |
| 重複monthly付款／assetpurpose創錢 | S03/S01；economicidentityunion/partition/assignmenttotal/horizonreservation守恆 |
| copiedruntime兩套truth | S00/S01；唯一implementation＋compatentry、pinnedarchive＋independentexpected；UI禁止formula |
| stale/mixed DecisionOutput | S06/S10/S13；atomicCAS/currentrefs/out-of-orderresponseguard、oldresultlabel |
| authorization/consumerfakeidentity | S07/S08；stableopaqueID/直接Action/nestedowner、testdouble不入prod、failclosed |
| provenance被summary截斷 | S01/S04/S11；fullvalidator+allconclusionchain/rawrefs、samebundlehistoricalreplay |
| 中文/formatter洩漏金融判斷 | S04/S11；code-keytypedparams/無policycatalog/localechange不recalc |
| report→fakefulfilled/VERIFIED | S12/S13；separatereport/source/outputs，proofunsupportednegative，missionID跨snapshot不auto完成 |
| derived DB漂移／retry二寫 | S05/S06；immutableaggregate+snapshot、同transactionreceipt、race/response-loss真DB測試 |
| unsupportedpolicy假已完成 | S03/S10/S14；producerapproval/capabilitygate、Bfixture標記/E/F誠實expectation；不過相關releasegate |
| 敏感logs/analytics/AI外送 | S04/S08/S14/S16；allowlist/最小projection、noAIdefault、privacyreview/redactiontests |
| migration錯環境/回退刪live資料 | S05/S14；isolatedtarget確認、syntheticDB、gateoff/additivecompat/restoreevidence，不liveDROP |
| financialtimebasis/版本不同叫改善 | S02/S13；ISOdate/monthlybasis/calendar、known相容比較、versionchange明標依據更新 |
| UI像genericaffiliate或game | S09–S15；approvedUX/zhTWreview、無Bybit-first/新IA/XP/healthscore、不做redesign |
| observation＋declared事件雙扣 | S13/S17；defaultobservedmode、後續closed effects/economicreceipt/互斥模式negativecases |

## 15. Bounded MVP Definition of Done

一個真實受認證使用者在受保護且明確批准的MVP範圍中，可：

1. S01/S02用途說明後輸入最少六組初始問題與basis，沒有巨型前置或Bybit帳號。
2. 保存KNOWN/UNKNOWN/N/A與完整性來源，partial資料不造零。
3. 取得同版本、確定性、完整validated分析，無AI也可用。
4. 查看supportedstage/bottleneck或清楚的null/Discover/observation/noaction，不偽健康。
5. 收到engine最多一Main＋0–3Side，或合法no-mission，不製造engagement。
6. 查看六塊Why、source/unit/date/metrics/provenance/assumptions/LOW及missing限制，不露裸RuleID。
7. 開始／本人回報mission，USER_REPORTED_DONE與財務變化分離；VERIFIED_DONE不可用且明示。
8. 核對新本人觀測financialstate，未知breakdown不post；可report-only。
9. 共用analysispipeline重算並原子保存，不lostresponse重寫/覆寫較新revision。
10. 看到新合法結果與真實變化說明或仍無行動/仍unknown；不保證改善。

以上全部需zh-TW、390/1440responsive/accessibility、realconsumeridentity/owner隔離、servervalidation、privacy/retention/log安全、realDB/testcoverage、no unsupportedrecommendation和approvedvisibility。缺任何必要gate不得宣布MVP完成。B政策action/goalconflict投資producer/VERIFIED proof仍缺時，DoD只可稱已批准的boundedcapability完成，不稱所有金融願望都支持；若產品要求這些完整功能，缺producer/proof就是具體blocker。

仍排除：openbanking、exchangesync、Bybitaccountintegration、tradingautomation、portfoliooptimizer、securitiesrecommendations、taxengine、insurancerecommendationengine、socialfeatures/rankings、XP/streak、nativeapp、complexAIadviser、globaljurisdiction；亦無healthscore/daily推播、新crypto圖表或marketingredesign。

## 16. Exactly ONE recommended first task（供下一session獨立授權）

**推薦只執行 S00：抽出既有 decimal arithmetic，建立 portable foundation 的可測seam。** 不把S01完整evaluator或整個MoneyOS加入第一任務。

可直接交給下一session的scope：

- 從接受本計畫的HEAD建立 `feature/money-os-decimal-foundation`（本次不建立）；先核對gitstatus、不碰.artifacts。
- 保留 `cfff3150fb5e6a258596fa54caa745023bcde894` 的reference作可取回baseline，不重寫其金融預期。
- 把decimalSum/decimalProduct既有演算法抽至 `lib/money-model/arithmetic/decimal-arithmetic.ts`。原 `docs/money-model/reference/decimal-arithmetic.ts` 只有相同exports的compatwrapper；不改任何其他frozen schemas/registries/evaluator/metrics。
- 新增兩個小tests（decimalfoundation、importboundary）、`tsconfig.money-model.json`（no DOM、target/lib明示ES2020以上、noEmit）及package一個targetedcheckscript；只這些已列檔。
- 獨立expected：0.1+0.2=0.3、cancel=0、signedsum、shareproduct、emptysum、finite/unrepresentable處理維持frozen；完整API無破壞。
- acceptance：puremodule無React/Next/DOM/DB/auth/locale/clock/docs依賴、singleimplementation；原210tests與6diagnostics全過、importcheck/targetedcompile與pnpmtypecheck/lint/spec:validate/test過（包含localbuilds）。
- 不parser/formatter、no固定minorunitrounding、新moneyrepresentation/金融公式/threshold/config、analysisfacade、UI/auth/DB/API/migration/newpackages/marketing/bybit/AI/native。
- 完成回報diff/tests/limits，等人類review；不merge/deploy、不要自動接S01。是否commit/push/開PR依下一任務明確Git授權執行，不因本建議自動取得。

第一任務只是implementation-entry能力，不能把它稱FIRST_USER_VALUE或MVP完成。

## 17. Readiness verdict

**READY_TO_BEGIN_IMPLEMENTATION**

其含義限於：可以在下一次明確授權後開始S00這個小型、可逆、零UI/DB/auth風險的任務。沒有阻擋S00的已知具體契約不相容，不需要重開freeze。此結論不授權現在執行、不代表S07/production UI/migrations已可立即做、更不等部署就緒。

具體後續阻擋依賴列清：S07缺核准consumerstableidentity方案；S05真DB環境/變更授權、S03producer映射/coverage、S14retention/backup/privacy/term review；B對外policyapproval、F有效goalconflictproducer、VERIFIED_DONEproofcontract均未取得。相關能力必須等待，不用newUI/ad hocfinance填空。S00–S06synthetic/test可獨立推進，不能讓testfake身份/claims進public產品。

## 18. 本次 planning validation／delivery

本次只新增此ImplementationPlan，不建立任何futurecode/routes/tables/scripts/implementationbranches。核對41項requestcoverage如下；每slice15項必要資訊由§3卡含ID/name與其14bullets覆蓋，另有PR策略。

| User request sections | 本文件對應 |
| --- | --- |
| 1–3 objective/sources/principle | §1–2 |
| 4 sequence／5 sliceformat | §2–3 |
| 6 foundation／7 domain／8 money | S00–S03、§5、§16 |
| 9 persistence／10 auth／11 analysis／12 interface | S04–S08、§4/6/7 |
| 13 onboarding／14 firstvalue／15 snapshot／16 Why | S09–S11、§8/13 |
| 17 main／18 Discover／19 nomission／20 RealityLoop | S12–S13、§8/10/15 |
| 21 locale／22 AI／23 instrumentation | S04/S11/S14/S16、§7/8 |
| 24 goldens／25 perslicetests／26 migration | §10/11/6及各卡 |
| 27 flags／28 routing／29 publicintegration | S08/S15、§9 |
| 30 PR／31 branches／32 DoD／33 exclusions | §2/12/15 |
| 34 risks／35 gates／36 firsttask | §14/13/16 |
| 37 output／38 readiness | 單一本文件、§17 |
| 39 validation／40 Git／41 finalreport | 本節及finalhandoff；33項報告 |

需執行 pnpm typecheck、pnpm lint、pnpm spec:validate、pnpm test；test含Next.js和本機vinextbuild，非部署。Markdown計畫不在現有specvalidator/lint實作能力範圍，另核links/章節/cards/requirementcoverage/原始source未變/只stage本文件/.artifacts未tracked；不能把baselinepass稱新MoneyOS E2E驗證。

本次驗證：pnpm typecheck PASS（含建置後再檢）、pnpm lint PASS（零 warnings）、pnpm spec:validate PASS、pnpm test 210/210 PASS（0 fail/cancelled/skipped/todo），其中 Next.js 16.2.6 build PASS（38 static pages）及本機 vinext build PASS。額外原始 freeze diagnostics 6/6 PASS。vinext 部分 route 分類「?」為既有 static-analysis 限制，不是建置失敗。文件另驗 18 個有序章節、18 張完整 slice 卡、5 個 local source links、必要契約語意及41項需求對照；tracked frozen/architecture/UX/production 檔案不變。這些結果只驗既有基準與文件完整性，未聲稱新 Money OS browser/真 DB/consumer auth/financial policy 已完成。

commit hash/gitstatus/push 在 final handoff，不自嵌本文件 commit。只 push GitHub documentation branch，不 merge、不 deploy、不推 Sites、不開始 S00。
