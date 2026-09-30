export type AuditClassification = "BLOCKER" | "MAJOR" | "MINOR" | "RESEARCH_REQUIRED" | "ACCEPTED_PRODUCT_ASSUMPTION";
export type AuditStatus = "OPEN" | "FIXED" | "DOCUMENTED";
export interface AuditFinding { id:string; classification:AuditClassification; title:string; affected:string[]; status:AuditStatus; resolution:string; adversarialTests:string[] }

export const auditFindings: AuditFinding[] = [
  { id:"AUD-B001",classification:"BLOCKER",title:"規則條件是自然語言字串，沒有可執行 predicate、輸入正規化或確定性 claim 生成器。",affected:["DecisionRule","bottleneck_v1"],status:"OPEN",resolution:"實作前需凍結 typed predicate/decision table 與 normalization contract；本次不得假造引擎。",adversarialTests:["ADV-013"] },
  { id:"AUD-B002",classification:"BLOCKER",title:"fixtures 的預期結果沒有由引擎計算，結構驗證通過不代表決策正確。",affected:["synthetic-cases","validator"],status:"OPEN",resolution:"實作前需建立獨立 oracle 或可執行 reference evaluator。",adversarialTests:["ADV-013"] },
  { id:"AUD-B003",classification:"BLOCKER",title:"Resource 缺少來源血統、所有權、可動用限制與估值時間，無法可靠阻止同資產多次映射。",affected:["FinancialResource","R-008"],status:"OPEN",resolution:"凍結 resource lineage/partition contract 後，才能把 profile asset 正規化成 resource。",adversarialTests:["ADV-001","ADV-002","ADV-004","ADV-005","ADV-006"] },
  { id:"AUD-B004",classification:"BLOCKER",title:"Claim 無法明確表達未知金額、重複週期、來源項目與資源影響。",affected:["FinancialClaim","Goal","Obligation"],status:"OPEN",resolution:"凍結 explicit unknown、recurrence、origin reference 與 resource-effect contract。",adversarialTests:["ADV-003","ADV-010","ADV-014"] },
  { id:"AUD-B005",classification:"BLOCKER",title:"沒有規則排序、override、同級 tie-break 或多規則合併合約。",affected:["Rule Registry","bottleneck_v1"],status:"OPEN",resolution:"以顯式優先決策表表達，不改成加權分數。",adversarialTests:["ADV-009","ADV-013"] },
  { id:"AUD-M001",classification:"MAJOR",title:"Model Registry 的 calculations 為空，requiredInputs 過度泛化為整個 FinancialProfile。",affected:["Model Registry"],status:"OPEN",resolution:"逐模型凍結輸入、輸出、公式、unknown propagation 與版本相容策略。",adversarialTests:["ADV-014"] },
  { id:"AUD-M002",classification:"MAJOR",title:"DecisionOutput 直接承載 zh-TW 字串，缺少 message key/parameters，跨 web/iOS/Android 的版本化與在地化會耦合。",affected:["DecisionOutput","Mission"],status:"OPEN",resolution:"保留 zh-TW 標準文案，同時增加穩定 copy key 與參數 contract。",adversarialTests:[] },
  { id:"AUD-M003",classification:"MAJOR",title:"Stage 邊界與 severity 合併規則未定義；同時存在多個瓶頸時可能任意選 stage。",affected:["Stage","bottleneck_v1"],status:"OPEN",resolution:"建立 stage selection decision table，保持 stage 與 severity 獨立。",adversarialTests:["ADV-011","ADV-012","ADV-013"] },
  { id:"AUD-M004",classification:"MAJOR",title:"Mission verification 缺少 evidence-of-completion schema，無法一致區分 USER_REPORTED_DONE 與 VERIFIED_DONE。",affected:["Mission"],status:"OPEN",resolution:"增加 verification evidence/result contract；不可只靠狀態列舉。",adversarialTests:["ADV-013"] },
  { id:"AUD-M005",classification:"MAJOR",title:"債務成本分類與促銷到期、變動利率、提前清償成本的時間語意尚未進入規則輸入。",affected:["Liability","debt_priority_v1"],status:"OPEN",resolution:"研究後建立 jurisdiction-aware effective debt cost contract。",adversarialTests:["ADV-008","ADV-009"] },
  { id:"AUD-M006",classification:"MAJOR",title:"既有 CASE-012 錯誤宣稱測試 R-011；CASE-009 未真正建立負淨值。",affected:["CASE-009","CASE-012","R-011"],status:"FIXED",resolution:"移除無關連結，並讓 CASE-009 明確為負淨值且還款正常。",adversarialTests:[] },
  { id:"AUD-R001",classification:"RESEARCH_REQUIRED",title:"不規則收入、季節性、獎金、稅款與年度支出的期間化方法未定。",affected:["cash_flow_v1","liquidity_v1"],status:"DOCUMENTED",resolution:"不得以單月平均掩蓋波動；需要台灣情境研究。",adversarialTests:["ADV-014"] },
  { id:"AUD-R002",classification:"RESEARCH_REQUIRED",title:"最低可行流動性約一個月仍缺實證與情境分層。",affected:["AS-001","R-005"],status:"DOCUMENTED",resolution:"維持 LOW / RESEARCH_REQUIRED，不得轉成使用者財務事實。",adversarialTests:["ADV-009","ADV-011"] },
  { id:"AUD-R003",classification:"RESEARCH_REQUIRED",title:"可售投資與加密資產的波動、稅費、結算與折價方法未定。",affected:["FinancialResource","liquidity_v1"],status:"DOCUMENTED",resolution:"不得把技術上可交易等同可安全動用。",adversarialTests:["ADV-006"] },
  { id:"AUD-A001",classification:"ACCEPTED_PRODUCT_ASSUMPTION",title:"通常一個主要任務與零至三個次要任務是 UX 約束，不是財務真理。",affected:["AS-005","AS-006"],status:"DOCUMENTED",resolution:"可保留，但不得改變財務優先結果。",adversarialTests:[] },
  { id:"AUD-A002",classification:"ACCEPTED_PRODUCT_ASSUMPTION",title:"無未解決優先主張時不製造任務。",affected:["AS-008","R-014"],status:"DOCUMENTED",resolution:"保留無任務合法輸出。",adversarialTests:["ADV-015"] },
  { id:"AUD-m001",classification:"MINOR",title:"術語均為 DRAFT，尚無 KEEP/REVISE/NEEDS_RESEARCH 審查欄位。",affected:["Terminology Registry"],status:"FIXED",resolution:"新增獨立術語 audit recommendation registry。",adversarialTests:[] },
];
