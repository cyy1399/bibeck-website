export type TerminologyRecommendation = "KEEP" | "REVISE" | "NEEDS_RESEARCH";
export interface TerminologyAudit { key:string; recommendation:TerminologyRecommendation; rationaleZhTW:string; proposedZhTW?:string }
export const terminologyAudit: TerminologyAudit[] = [
  {key:"financial_state",recommendation:"KEEP",rationaleZhTW:"「財務狀態」自然且中性，但需避免被視為人格評級。"},
  {key:"financial_runway",recommendation:"NEEDS_RESEARCH",rationaleZhTW:"「財務續航」簡潔但可能不如「可支撐期間」直接，應以台灣使用者理解度測試。"},
  {key:"primary_bottleneck",recommendation:"REVISE",rationaleZhTW:"「瓶頸」可能帶有責備感；介面可優先使用較中性的說法。",proposedZhTW:"目前最需要處理的財務問題"},
  {key:"main_quest",recommendation:"NEEDS_RESEARCH",rationaleZhTW:"「主要任務」可理解，但 Quest 的遊戲語感是否適合嚴肅財務情境需驗證。"},
  {key:"side_mission",recommendation:"NEEDS_RESEARCH",rationaleZhTW:"「次要任務」可能被誤解為不重要；應測試「輔助任務」。",proposedZhTW:"輔助任務"},
  {key:"need_more_information",recommendation:"KEEP",rationaleZhTW:"自然、清楚，沒有不必要英文。"},
  {key:"allocation_conflict",recommendation:"KEEP",rationaleZhTW:"「資金配置衝突」能表達取捨且不道德化。"},
  {key:"funding_conflict",recommendation:"REVISE",rationaleZhTW:"與 allocation conflict 過度接近，使用者難以辨識差異。",proposedZhTW:"多項目標資金不足"},
  {key:"available_safety_liquidity",recommendation:"REVISE",rationaleZhTW:"「安全流動性」較技術化，應避免像保證安全。",proposedZhTW:"扣除保留用途後的可用流動資金"},
  {key:"minimum_viable_liquidity",recommendation:"NEEDS_RESEARCH",rationaleZhTW:"容易被誤認為已驗證財務門檻；未完成研究前不應直接對使用者顯示。"},
];
