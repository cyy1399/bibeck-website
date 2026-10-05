import type { ModelRecord } from "../contracts/index.ts";
const reviewed = "2026-09-30";
const working = (id:string, purpose:string, dependencies:string[], rules:string[], assumptions:string[], evidence:string[]): ModelRecord => ({ id, name:id, version:"1.1.0", purpose, requiredInputs:["FinancialProfile"], optionalInputs:["verifiedData"], dependencies, calculations:[], rules, outputs:["DecisionOutput"], assumptions, evidence, jurisdiction:["GENERAL","TW"], confidence:"LOW", status:"WORKING", active:true, lastReviewed:"2026-10-02" });
export const models: ModelRecord[] = [
  working("cash_flow_v1","計算收入、核心流出與每月剩餘。",[],["R-003","R-015"],[],["EV-003"]),
  working("liquidity_v1","按 30/90/365 日義務計算可用安全流動性。",["cash_flow_v1"],["R-004","R-007"],["AS-001"],["EV-002"]),
  working("debt_priority_v1","辨識逾期、最低還款與分階段債務處理。",["liquidity_v1"],["R-002","R-005","R-006"],["AS-002","AS-004"],[]),
  working("goal_funding_v1","辨識目標資金缺口與競爭。",["cash_flow_v1"],["R-009","R-010"],["AS-003"],["EV-007"]),
  working("investable_capital_v1","扣除高優先主張後計算潛在長期可配置資本。",["liquidity_v1","goal_funding_v1"],["R-008","R-009"],["AS-003"],["EV-001"]),
  working("bottleneck_v1","依階層規則決定目前主要瓶頸，不採任意加權分數。",["cash_flow_v1","liquidity_v1","debt_priority_v1","goal_funding_v1","investable_capital_v1"],["R-001","R-002","R-003","R-004","R-010","R-012","R-013","R-015"],["AS-007"],["EV-003","EV-004","EV-005","EV-006"]),
  working("mission_v1","由已確定的瓶頸建立最多一項主要任務與零至三項次要任務。",["bottleneck_v1"],["R-014"],["AS-005","AS-006","AS-008"],[]),
  ...["risk_capacity_v1","risk_tolerance_v1","goal_feasibility_v1","asset_allocation_framework_v1","optionality_v1"].map((id):ModelRecord => ({ id,name:id,version:"0.0.0",purpose:"未凍結的未來模型。",requiredInputs:[],optionalInputs:[],dependencies:[],calculations:[],rules:[],outputs:[],assumptions:[],evidence:[],jurisdiction:["GENERAL"],confidence:"EXPERIMENTAL",status:"DRAFT",active:false,lastReviewed:reviewed })),
];
