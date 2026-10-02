import type { AssumptionRecord } from "../schemas/index.ts";
export const assumptions: AssumptionRecord[] = [
  { id:"AS-001", revision:1, name:"Minimum Viable Liquidity", statement:"約一個月核心每月流出目前僅作為最低可行流動性的工作里程碑。", type:"FINANCIAL_MODEL", confidence:"LOW", status:"RESEARCH_REQUIRED", limitations:["不是普遍財務真理","不得宣稱專家一致建議"], tests:["CASE-008","COLLISION-002"] },
  { id:"AS-002", revision:1, name:"Delinquency precedence", statement:"重大逾期優先於成長型主張。", type:"FINANCIAL_MODEL", confidence:"HIGH", status:"WORKING", limitations:["仍須保留基本生活資源"], tests:["CASE-003","COLLISION-001"] },
  { id:"AS-003", revision:1, name:"Hard claim precedence", statement:"硬性主張優先於可選擇的成長型主張。", type:"FINANCIAL_MODEL", confidence:"HIGH", status:"WORKING", limitations:["同級主張仍需比較急迫性與後果"], tests:["CASE-002","COLLISION-001","COLLISION-003"] },
  { id:"AS-004", revision:1, name:"Phased liquidity and debt", statement:"流動性與高成本債務可能需要分階段配置。", type:"FINANCIAL_MODEL", confidence:"LOW", status:"RESEARCH_REQUIRED", limitations:["高成本分類由司法管轄與債務模型處理"], tests:["CASE-008","COLLISION-002"] },
  { id:"AS-005", revision:1, name:"Single Main Quest", statement:"通常同一時間只有一個主要任務。", type:"UX", confidence:"MEDIUM", status:"WORKING", limitations:["不表示其他問題不存在"], tests:["CASE-001","CASE-017"] },
  { id:"AS-006", revision:1, name:"Side Mission limit", statement:"通常提供零至三個次要任務。", type:"UX", confidence:"MEDIUM", status:"WORKING", limitations:["避免製造忙碌感"], tests:["CASE-001","CASE-017"] },
  { id:"AS-007", revision:1, name:"Stage is bottleneck domain", statement:"財務狀態代表目前瓶頸領域，不是永久等級或地位。", type:"PRODUCT", confidence:"HIGH", status:"WORKING", limitations:["嚴重度需獨立表達"], tests:["CASE-021"] },
  { id:"AS-008", revision:1, name:"No forced mission", statement:"沒有未解決的優先主張時，不強行產生任務。", type:"PRODUCT", confidence:"HIGH", status:"WORKING", limitations:["可以顯示無需處理的狀態"], tests:["CASE-017","CASE-018"] },
];
