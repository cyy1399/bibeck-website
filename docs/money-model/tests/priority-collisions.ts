import type { Severity, Stage } from "../schemas/index.ts";

export interface PriorityCollisionFixture {
  id:string;
  description:string;
  competingClaims:string[];
  availableResources:number;
  expected:{ stage:Stage; severity:Severity; winner:string|null; allocationMode:string; requiredFlags:string[]; forbiddenAllocations:string[]; forbiddenOutputs:string[]; resourceInvariant:boolean; claimInvariant:boolean };
  ruleIds:string[];
}

export const priorityCollisions: PriorityCollisionFixture[] = [
  { id:"COLLISION-001",description:"房租與債務加速",competingClaims:["必要房租","債務加速"],availableResources:30000,ruleIds:["R-002","R-003"],expected:{stage:"SURVIVAL",severity:"HIGH",winner:"必要房租",allocationMode:"HARD_CLAIM_FIRST",requiredFlags:["HARD_CLAIM_PRECEDENCE"],forbiddenAllocations:["不得先加速還債而讓必要房租失去資金"],forbiddenOutputs:["不得把房租描述為可選消費"],resourceInvariant:true,claimInvariant:true} },
  { id:"COLLISION-002",description:"最低可行流動性與已分類的 18% 高成本債務",competingClaims:["最低可行流動性","高成本債務"],availableResources:50000,ruleIds:["R-005","R-006"],expected:{stage:"STABILITY",severity:"HIGH",winner:null,allocationMode:"PHASED_ALLOCATION",requiredFlags:["RESEARCH_REQUIRED_THRESHOLD","PRESERVE_MINIMUM_LIQUIDITY"],forbiddenAllocations:["不得將現金降至零","不得把 18% 推廣為通用門檻"],forbiddenOutputs:["不得宣稱所有人都必須保留固定一個月支出"],resourceInvariant:true,claimInvariant:true} },
  { id:"COLLISION-003",description:"必要住屋目標與可選旅行",competingClaims:["近期必要住屋資金","旅行資金"],availableResources:200000,ruleIds:["R-009","R-010"],expected:{stage:"ACCUMULATION",severity:"MEDIUM",winner:"近期必要住屋資金",allocationMode:"CONSTRAINT_THEN_USER_CHOICE",requiredFlags:["FUNDING_CONFLICT"],forbiddenAllocations:["不得用同一資金完整支持兩個目標"],forbiddenOutputs:["不得把旅行稱為浪費"],resourceInvariant:true,claimInvariant:true} },
  { id:"COLLISION-004",description:"長期投資與撲克資金",competingClaims:["長期投資","撲克資金"],availableResources:100000,ruleIds:["R-011"],expected:{stage:"CONTROL",severity:"MEDIUM",winner:null,allocationMode:"USER_CHOICE_AFTER_HIGHER_CLAIMS",requiredFlags:["CHOSEN_CLAIMS"],forbiddenAllocations:["安全或更高優先主張未完成時，兩者皆不得優先"],forbiddenOutputs:["不得因長期投資較傳統就道德性優先","不得把撲克資金描述為浪費"],resourceInvariant:true,claimInvariant:true} },
];
