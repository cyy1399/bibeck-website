import type { Confidence } from "./common.ts";
import type { SemanticRef } from "./executable-rule.schema.ts";
import type { DecisionOutput } from "./decision-output.schema.ts";
/** The reference evaluator emits the full output, not a smaller UI-facing substitute. */
export interface ReferenceDecisionOutput extends DecisionOutput { flags:string[]; blockers:SemanticRef[]; matchedRuleIds:string[]; /** Legacy rule-match confidence; complete confidence is confidenceAssessment. */ modelConfidence:Confidence; halted:boolean }
