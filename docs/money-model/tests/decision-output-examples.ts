import type { DecisionOutput } from "../schemas/index.ts";

export const decisionOutputExamples: DecisionOutput[] = [
  {
    currentStage:"STABILITY",
    primaryBottleneck:"必要支出資料不足，暫時無法判斷可支撐期間。",
    severity:"MEDIUM",
    metrics:[],
    mainQuest:{ id:"mission-discover-expenses",type:"DISCOVER",title:"補齊必要支出",why:"必要支出會影響核心現金流與財務續航。",action:"整理最近三個月維持基本生活所需的平均支出。",expectedImpact:"完成後可重新計算核心現金流與可支撐期間。",verificationMethod:"使用者確認金額與資料期間。",status:"TODO" },
    sideMissions:[],
    options:[],
    reasoning:["系統沒有猜測缺漏的必要支出。"],
    assumptions:[],
    missingInformation:["每月必要支出"],
    modelVersions:["cash_flow_v1@1.0.0","bottleneck_v1@1.0.0","mission_v1@1.0.0"],
  },
  {
    currentStage:"OPTIONALITY",
    primaryBottleneck:"目前沒有未解決的優先主張。",
    severity:"NONE",
    metrics:[],
    mainQuest:null,
    sideMissions:[],
    options:[],
    reasoning:["今天沒有需要處理的財務任務。去生活。"],
    assumptions:["AS-008"],
    missingInformation:[],
    modelVersions:["bottleneck_v1@1.0.0","mission_v1@1.0.0"],
  },
];
