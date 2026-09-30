import { executableRules } from "../registries/executable-rules.ts";
import type { Confidence, ExecutableDecisionRule, ReferenceDecisionOutput, RuleEvaluation, Severity } from "../schemas/index.ts";
import { evaluateCondition } from "./predicate-evaluator.ts";
import type { NormalizedDecisionContext } from "../schemas/index.ts";

const phaseRank = {DATA_QUALITY:0,CRITICAL:1,SURVIVAL:2,LIQUIDITY:3,CONTROL:4,GOAL_CONFLICT:5,ACCUMULATION:6,GROWTH:7,OPTIMIZATION:8} as const;
const severityRank:Record<Severity,number> = {NONE:0,LOW:1,MEDIUM:2,HIGH:3,CRITICAL:4};
const confidenceRank:Record<Confidence,number> = {HIGH:3,MEDIUM:2,LOW:1,EXPERIMENTAL:0};

export function evaluateReference(context:NormalizedDecisionContext,rules:ExecutableDecisionRule[]=executableRules):ReferenceDecisionOutput {
  const ordered=[...rules].filter((rule)=>rule.enabled).sort((a,b)=>phaseRank[a.phase]-phaseRank[b.phase]||a.order-b.order||a.id.localeCompare(b.id));
  const evaluations:RuleEvaluation[]=[];
  let dataQualityBlocked=false;
  let criticalHalt=false;
  for (const rule of ordered) {
    if (criticalHalt || (dataQualityBlocked && rule.phase!=="DATA_QUALITY")) continue;
    const truth=evaluateCondition(rule.condition,context);
    const matched=truth==="TRUE";
    evaluations.push({ruleId:rule.id,matched,truth,phase:rule.phase,order:rule.order,result:matched?rule.result:undefined,overrideBehavior:rule.overrideBehavior,mergeBehavior:rule.mergeBehavior});
    if (matched && rule.overrideBehavior==="CRITICAL_HALT") criticalHalt=true;
    if (matched && rule.overrideBehavior==="BLOCK_DOWNSTREAM") dataQualityBlocked=true;
  }
  const matched=evaluations.filter((item)=>item.matched&&item.result);
  const primary=matched.find((item)=>item.mergeBehavior==="PRIMARY_CANDIDATE");
  const severities=matched.flatMap((item)=>item.result?.severityCandidate?[item.result.severityCandidate]:[]);
  const severity=severities.sort((a,b)=>severityRank[b]-severityRank[a])[0]??"NONE";
  const confidences=matched.map((item)=>rules.find((rule)=>rule.id===item.ruleId)?.confidence??"EXPERIMENTAL");
  const modelConfidence=confidences.sort((a,b)=>confidenceRank[a]-confidenceRank[b])[0]??"HIGH";
  const noMission=matched.some((item)=>item.mergeBehavior==="NO_MISSION");
  const unique=(items:{code:string;params:Record<string,string|number|boolean|null>}[])=>[...new Map(items.map((item)=>[`${item.code}:${JSON.stringify(item.params)}`,item])).values()];
  return { currentStage:primary?.result?.stageCandidate??(noMission?matched.find((item)=>item.mergeBehavior==="NO_MISSION")?.result?.stageCandidate??null:null),severity,primaryBottleneck:primary?.result?.bottleneckCandidate??(noMission?matched.find((item)=>item.mergeBehavior==="NO_MISSION")?.result?.bottleneckCandidate??null:null),mainQuest:noMission?null:primary?.result?.mainQuestCandidate??null,sideMissions:unique(matched.flatMap((item)=>item.result?.sideMissionCandidates??[])),findings:unique(matched.flatMap((item)=>item.result?.findings??[])),flags:[...new Set(matched.flatMap((item)=>item.result?.flags??[]))],blockers:unique(matched.flatMap((item)=>item.result?.blockers??[])),missingInformation:unique(matched.flatMap((item)=>item.result?.missingInformation??[])),matchedRuleIds:matched.map((item)=>item.ruleId),modelConfidence,halted:criticalHalt||dataQualityBlocked };
}

export const rulePhaseRank=phaseRank;
