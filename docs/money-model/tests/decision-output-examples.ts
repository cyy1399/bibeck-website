import type { DecisionOutput } from "../schemas/index.ts";
import { evaluateReference } from "../reference/reference-evaluator.ts";
import { createContext, flag } from "../reference/context-builder.ts";
import { executableCases } from "./executable-cases.ts";
/** Rendering examples, not independent executable expected-result oracles. */
export const decisionOutputExamples:DecisionOutput[]=[
  evaluateReference(createContext({"flags.hasMissingCriticalData":flag(true)})),
  evaluateReference(executableCases.find(item=>item.id==="EXEC-016")!.context),
];
export const zhTWRenderingExamples:Record<string,string>={
  MISSING_CRITICAL_DATA:"必要支出資料不足，暫時無法判斷可支撐期間。",
  DISCOVER_MISSING_INFORMATION:"補齊必要資料",
  NO_FINANCIAL_TASK_TODAY:"今天沒有需要處理的財務任務。去生活。",
};
