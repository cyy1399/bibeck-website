import type { Confidence, Severity, Stage } from "./common.ts";
import type { SemanticRef } from "./executable-rule.schema.ts";
export interface ReferenceDecisionOutput { decisionOutputVersion:"1.0"; currentStage:Stage | null; severity:Severity; primaryBottleneck:SemanticRef | null; mainQuest:SemanticRef | null; sideMissions:SemanticRef[]; findings:SemanticRef[]; flags:string[]; blockers:SemanticRef[]; missingInformation:SemanticRef[]; matchedRuleIds:string[]; evidenceIds:string[]; assumptionIds:string[]; modelConfidence:Confidence; halted:boolean }
