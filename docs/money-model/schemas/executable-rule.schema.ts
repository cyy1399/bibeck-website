import type { Confidence, Severity, Stage } from "./common.ts";
import type { Condition } from "./predicate.schema.ts";
export type RulePhase = "DATA_QUALITY" | "CRITICAL" | "SURVIVAL" | "LIQUIDITY" | "CONTROL" | "GOAL_CONFLICT" | "ACCUMULATION" | "GROWTH" | "OPTIMIZATION";
export type OverrideBehavior = "NONE" | "BLOCK_DOWNSTREAM" | "OVERRIDE_STAGE" | "OVERRIDE_MAIN_QUEST" | "CRITICAL_HALT";
export type MergeBehavior = "COLLECT" | "PRIMARY_CANDIDATE" | "SIDE_FINDING" | "NO_MISSION";
export interface SemanticRef { code:string; params:Record<string,string|number|boolean|null> }
export interface RuleEffect { findings:SemanticRef[]; flags:string[]; bottleneckCandidate?:SemanticRef; stageCandidate?:Stage; severityCandidate?:Severity; mainQuestCandidate?:SemanticRef; sideMissionCandidates:SemanticRef[]; blockers:SemanticRef[]; missingInformation:SemanticRef[] }
export interface ExecutableDecisionRule { id:string; phase:RulePhase; order:number; condition:Condition; result:RuleEffect; overrideBehavior:OverrideBehavior; mergeBehavior:MergeBehavior; confidence:Confidence; evidenceIds:string[]; assumptionIds:string[]; enabled:boolean }
export interface RuleEvaluation { ruleId:string; matched:boolean; truth:"TRUE"|"FALSE"|"UNKNOWN"; phase:RulePhase; order:number; result?:RuleEffect; overrideBehavior:OverrideBehavior; mergeBehavior:MergeBehavior }
