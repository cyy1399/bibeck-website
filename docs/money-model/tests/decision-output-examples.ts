import type { DecisionOutput } from "../schemas/index.ts";

export const decisionOutputExamples: DecisionOutput[] = [
  {
    currentStage:"STABILITY",
    primaryBottleneck:{code:"MISSING_NECESSARY_EXPENSES",params:{}},
    severity:"MEDIUM",
    metrics:[],
    mainQuest:{id:"mission-discover-expenses",type:"DISCOVER",code:"DISCOVER_NECESSARY_EXPENSES",params:{},whyCode:"WHY_EXPENSES_AFFECT_RUNWAY",actionCode:"ACTION_REVIEW_THREE_MONTHS_EXPENSES",impactCode:"IMPACT_ENABLE_CASH_FLOW_CALCULATION",verification:{type:"DOCUMENTED_VALUE",requirementCodes:["NECESSARY_MONTHLY_EXPENSE_AMOUNT","SOURCE_PERIOD"],evidenceRefs:[]},status:"TODO"},
    sideMissions:[],
    options:[],
    explanationRefs:[{code:"UNKNOWN_VALUES_NOT_GUESSED",params:{}}],
    assumptionIds:[],
    missingInformation:[{code:"NECESSARY_MONTHLY_EXPENSE",params:{}}],
    modelVersions:["cash_flow_v1@1.0.0","bottleneck_v1@1.0.0","mission_v1@1.0.0"],
  },
  {
    currentStage:"OPTIONALITY",
    primaryBottleneck:{code:"NO_UNRESOLVED_PRIORITY_CLAIM",params:{}},
    severity:"NONE",
    metrics:[],
    mainQuest:null,
    sideMissions:[],
    options:[],
    explanationRefs:[{code:"NO_FINANCIAL_TASK_TODAY",params:{}}],
    assumptionIds:["AS-008"],
    missingInformation:[],
    modelVersions:["bottleneck_v1@1.0.0","mission_v1@1.0.0"],
  },
];

export const zhTWRenderingExamples:Record<string,string> = {
  MISSING_NECESSARY_EXPENSES:"必要支出資料不足，暫時無法判斷可支撐期間。",
  DISCOVER_NECESSARY_EXPENSES:"補齊必要支出",
  NO_FINANCIAL_TASK_TODAY:"今天沒有需要處理的財務任務。去生活。",
};
