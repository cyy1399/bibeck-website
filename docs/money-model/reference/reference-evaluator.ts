import { executableRules } from "../registries/executable-rules.ts";
import { assumptions } from "../registries/assumptions.ts";
import { evidence } from "../registries/evidence.ts";
import { models } from "../registries/models.ts";
import { valueRefRegistry } from "../registries/value-refs.ts";
import type { Confidence, ConfidenceAssessment, DecisionFinding, DecisionProvenance, ExecutableDecisionRule, EvaluationMetadata, Mission, NormalizedDecisionContext, ReferenceDecisionOutput, RuleEffect, SemanticRef, Severity, ValueRef } from "../schemas/index.ts";
import { evaluateCondition, collectConditionRefs, assertValidContext } from "./predicate-evaluator.ts";
const phaseRank={DATA_QUALITY:0,CRITICAL:1,SURVIVAL:2,LIQUIDITY:3,CONTROL:4,GOAL_CONFLICT:5,ACCUMULATION:6,GROWTH:7,OPTIMIZATION:8} as const;
const severityRank:Record<Severity,number>={NONE:0,LOW:1,MEDIUM:2,HIGH:3,CRITICAL:4};
const confidenceRank:Record<Confidence,number>={HIGH:3,MEDIUM:2,LOW:1,EXPERIMENTAL:0};
const least=(v:Confidence[]):Confidence=>[...v].sort((a,b)=>confidenceRank[a]-confidenceRank[b])[0]??"LOW";
const unique=<T>(v:T[]):T[]=>[...new Set(v)];
const key=(r:SemanticRef)=>r.code+":"+JSON.stringify(Object.fromEntries(Object.entries(r.params).sort(([a],[b])=>a.localeCompare(b))));
const semanticUnique=(v:SemanticRef[])=>[...new Map(v.map(r=>[key(r),r])).values()];
const stableId=(v:string)=>{let h=2166136261;for(const c of v)h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(16);};
type Match={rule:ExecutableDecisionRule;result:RuleEffect;refs:ValueRef[];discovery:boolean;fallback?:boolean};

export function evaluateReference(context:NormalizedDecisionContext,rules:ExecutableDecisionRule[]=executableRules,metadata?:EvaluationMetadata):ReferenceDecisionOutput {
  assertValidContext(context);
  const inputStates=Object.fromEntries(Object.entries(context).map(([ref,v])=>[ref,v.status==="KNOWN"?{status:v.status,value:v.data.value,source:v.data.source,updatedAt:v.data.updatedAt}:{status:v.status,reasonCode:v.reasonCode}]));
  const evaluation:EvaluationMetadata=metadata?{...metadata,configValues:{...metadata.configValues}}:{id:"reference-evaluation",snapshotId:"UNVERSIONED_REFERENCE_CONTEXT",evaluatedAt:"1970-01-01T00:00:00.000Z",schemaVersion:"1.0.0",jurisdiction:"GENERAL",inputStates,configValues:{},source:"REFERENCE_CONTEXT"};
  for(const [ref,state]of Object.entries(inputStates)){const supplied=evaluation.inputStates[ref as ValueRef];if(!supplied||supplied.status!==state.status||("value"in state&&supplied.value!==state.value))throw new TypeError("EVALUATION_INPUT_STATE_MISMATCH:"+ref);}
  const config=context["config.minimumViableLiquidityMonths"];
  if(config.status==="KNOWN")evaluation.configValues["config.minimumViableLiquidityMonths"]=config.data.value as number;
  const ordered=[...rules].filter(r=>r.enabled).sort((a,b)=>phaseRank[a.phase]-phaseRank[b.phase]||a.order-b.order||a.id.localeCompare(b.id));
  const matches:Match[]=[],blocked=new Set<ValueRef>(),missing=new Set<ValueRef>();
  let criticalHalt=false;
  for(const rule of ordered){
    if(criticalHalt)break;
    const refs=collectConditionRefs(rule.condition),required=rule.requiredKnownInputs;
    if(!Array.isArray(required)||required.some(ref=>!Object.hasOwn(valueRefRegistry,ref)))throw new TypeError("INVALID_MISSION_REQUIREMENTS:"+rule.id);
    if(required.some(ref=>blocked.has(ref)))continue;
    const truth=evaluateCondition(rule.condition,context);
    let result=truth==="TRUE"?rule.result:undefined,discovery=false,usedRefs=refs;
    if(rule.discoveryCondition&&rule.discoveryResult&&evaluateCondition(rule.discoveryCondition,context)==="TRUE"){result=rule.discoveryResult;discovery=true;usedRefs=collectConditionRefs(rule.discoveryCondition);}
    if(truth==="UNKNOWN"&&rule.result.mainQuestCandidate)for(const ref of refs)if(context[ref].status!=="KNOWN")missing.add(ref);
    if(!result)continue;
    discovery ||= result.mainQuestCandidate?.code.startsWith("DISCOVER")===true||result.mainQuestCandidate?.code==="RECONCILE_CASH_FLOW_INPUTS";
    if(!discovery&&required.some(ref=>context[ref].status!=="KNOWN")){for(const ref of required)if(context[ref].status!=="KNOWN")missing.add(ref);continue;}
    if(rule.mergeBehavior==="NO_MISSION"&&matches.some(m=>m.result.mainQuestCandidate))continue;
    matches.push({rule,result,refs:usedRefs,discovery});
    if(rule.overrideBehavior==="CRITICAL_HALT")criticalHalt=true;
    if(rule.overrideBehavior==="BLOCK_DOWNSTREAM")for(const ref of rule.blockedInputRefs??[])blocked.add(ref);
  }
  if(!matches.length&&missing.size){const rule=rules.find(r=>r.id==="R-001");if(rule)matches.push({rule,result:rule.result,refs:[...missing],discovery:true,fallback:true});}
  // Independent supported actions win over discovery. NO_MISSION never erases a repair.
  const primary=matches.find(m=>m.rule.mergeBehavior==="PRIMARY_CANDIDATE"&&!m.discovery)??matches.find(m=>m.rule.mergeBehavior==="PRIMARY_CANDIDATE")??matches.find(m=>m.rule.mergeBehavior==="NO_MISSION");
  const expandRefs=(refs:ValueRef[]):ValueRef[]=>{
    const visited=new Set<ValueRef>();
    const visit=(ref:ValueRef)=>{if(visited.has(ref))return;if(!Object.hasOwn(valueRefRegistry,ref))throw new TypeError("INVALID_LINEAGE_VALUE_REF");visited.add(ref);for(const dependency of evaluation.valueDependencies?.[ref]??[])visit(dependency);};
    refs.forEach(visit);return [...visited];
  };
  const provenanceFor=(m:Match,findingIds:string[]=[]):DecisionProvenance=>{
    const refs=expandRefs(m.refs);
    return {ruleRefs:[{id:m.rule.id,version:m.rule.version}],
      modelRefs:unique(["bottleneck_v1",...refs.flatMap(ref=>valueRefRegistry[ref].producerModel?[valueRefRegistry[ref].producerModel!]:[])]).map(id=>({id,version:models.find(model=>model.id===id)?.version??"UNREGISTERED"})),
      metricRefs:refs.filter(ref=>valueRefRegistry[ref].source==="METRIC"),inputRefs:refs,sourceInputRefs:unique(refs.flatMap(ref=>evaluation.valueLineage?.[ref]??[])),
      evidenceRefs:m.rule.evidenceIds.map(id=>({id,revision:evidence.find(record=>record.id===id)?.revision??0})),assumptionRefs:unique([...m.rule.assumptionIds,...(refs.includes("config.minimumViableLiquidityMonths")?["AS-001"]:[])]).map(id=>({id,revision:assumptions.find(record=>record.id===id)?.revision??0})),findingIds};
  };
  const assess=(p:DecisionProvenance,base:Confidence):ConfidenceAssessment=>{
    const levels:Confidence[]=[base],reasons:string[]=[];
    if(evaluation.source==="REFERENCE_CONTEXT"){levels.push("LOW");reasons.push("UNVERSIONED_REFERENCE_INPUTS");}
    if(p.inputRefs.some(ref=>context[ref].status!=="KNOWN")){levels.push("LOW");reasons.push("MISSING_REQUIRED_DATA");}
    if([...p.inputRefs.map(ref=>evaluation.inputStates[ref]),...p.sourceInputRefs.map(ref=>evaluation.inputRecords?.[ref])].some(state=>state?.source==="USER_REPORTED")){levels.push("MEDIUM");reasons.push("USER_REPORTED_INPUT");}
    if(p.sourceInputRefs.some(ref=>ref.endsWith("valuationStatus")&&evaluation.inputRecords?.[ref]?.value==="ESTIMATED")){levels.push("MEDIUM");reasons.push("ESTIMATED_VALUATION");}
    for(const ref of p.assumptionRefs){const a=assumptions.find(v=>v.id===ref.id);if(a){levels.push(a.confidence);if(a.status==="RESEARCH_REQUIRED")reasons.push("RESEARCH_REQUIRED:"+ref.id);}}
    for(const ref of p.modelRefs){const model=models.find(v=>v.id===ref.id);if(model){levels.push(model.confidence);if(model.status!=="VALIDATED")reasons.push("WORKING_MODEL:"+ref.id);}}
    return {level:least(levels),reasonCodes:unique(reasons.length?reasons:["DECLARED_RULE_AND_INPUT_SUPPORT"]),inputRefs:p.inputRefs,modelRefs:p.modelRefs,assumptionRefs:p.assumptionRefs};
  };
  const findings:DecisionFinding[]=[];
  for(const m of matches)for(const ref of m.result.findings){
    const existing=findings.find(v=>key(v)===key(ref)),p=provenanceFor(m);
    if(existing){existing.provenance=mergeProvenance([existing.provenance,p]);existing.confidence=assess(existing.provenance,least([existing.confidence.level,m.rule.confidence]));}
    else findings.push({...ref,id:"finding-"+stableId(key(ref)),provenance:p,confidence:assess(p,m.rule.confidence)});
  }
  const findingIds=(m:Match)=>m.result.findings.map(ref=>findings.find(v=>key(v)===key(ref))!.id);
  const mission=(ref:SemanticRef,m:Match):Mission=>{
    const p=provenanceFor(m,findingIds(m)),type=m.discovery||ref.code==="EVALUATE_RESOURCE_RUNWAY"?"DISCOVER":ref.code.startsWith("DECIDE")?"DECIDE":ref.code.startsWith("BUILD")?"BUILD":"REPAIR";
    p.modelRefs.push({id:"mission_v1",version:models.find(model=>model.id==="mission_v1")!.version});
    return {...ref,id:"mission-"+stableId(m.rule.id+":"+key(ref)),type,whyCode:"WHY_"+ref.code,actionCode:ref.code,impactCode:"IMPACT_"+ref.code,verification:{type:type==="DISCOVER"?"DOCUMENTED_VALUE":"STATE_RECALCULATION",requirementCodes:["VERIFIED_SOURCE_OR_STATE_RECALCULATION"],evidenceRefs:[]},status:"TODO",requiredKnownInputs:type==="DISCOVER"?[]:m.rule.requiredKnownInputs,provenance:p,confidence:assess(p,m.rule.confidence)};
  };
  const mainQuest=primary?.result.mainQuestCandidate?mission(primary.result.mainQuestCandidate,primary):null,sideMissions:Mission[]=[];
  for(const m of matches)for(const ref of [...m.result.sideMissionCandidates,...(m.discovery&&m!==primary&&m.result.mainQuestCandidate?[m.result.mainQuestCandidate]:[])])if(!sideMissions.some(v=>key(v)===key(ref))&&sideMissions.length<3)sideMissions.push(mission(ref,m));
  const provenance=mergeProvenance([...matches.map(m=>provenanceFor(m,findingIds(m))),...(mainQuest?[mainQuest.provenance]:[]),...sideMissions.map(m=>m.provenance)]);
  const modelConfidence=matches.some(m=>m.fallback)?"LOW":least(matches.map(m=>m.rule.confidence)),confidenceAssessment=assess(provenance,modelConfidence);
  const contradictoryCount=context["counts.unresolvedPriorityClaims"].status==="KNOWN"&&context["counts.unresolvedPriorityClaims"].data.value===0&&matches.some(m=>m.result.mainQuestCandidate&&!m.discovery);
  const missingInformation=semanticUnique([...matches.flatMap(m=>m.result.missingInformation),...[...missing].map(ref=>({code:"MISSING_VALUE_REF",params:{ref}})),...(contradictoryCount?[{code:"PRIORITY_CLAIM_COUNT_RECONCILIATION",params:{}}]:[])]);
  const metrics=Object.entries(context).filter(([ref])=>valueRefRegistry[ref as ValueRef].source==="METRIC").map(([id,value])=>{
    const ref=id as ValueRef,d=valueRefRegistry[ref],refs=expandRefs([ref]),p:DecisionProvenance={ruleRefs:[],modelRefs:unique(refs.flatMap(input=>valueRefRegistry[input].producerModel?[valueRefRegistry[input].producerModel!]:[])).map(modelId=>({id:modelId,version:models.find(m=>m.id===modelId)?.version??"UNREGISTERED"})),metricRefs:refs.filter(input=>valueRefRegistry[input].source==="METRIC"),inputRefs:refs,sourceInputRefs:unique(refs.flatMap(input=>evaluation.valueLineage?.[input]??[])),evidenceRefs:[],assumptionRefs:refs.includes("config.minimumViableLiquidityMonths")?[{id:"AS-001",revision:assumptions.find(record=>record.id==="AS-001")!.revision}]:[],findingIds:[]};
    return {id:ref,labelCode:id,value,unit:d.unit,timeBasis:d.timeBasis,currency:d.currency==="profile.primaryCurrency"?(evaluation.inputRecords?.["profile.primaryCurrency"]?.value as string??"UNDECLARED_PRIMARY_CURRENCY"):"NOT_APPLICABLE",provenance:p,confidence:assess(p,"HIGH")};
  });
  return {decisionOutputVersion:"1.0",currentStage:primary?.result.stageCandidate??null,primaryBottleneck:primary?.result.bottleneckCandidate?{...primary.result.bottleneckCandidate,provenance:provenanceFor(primary,findingIds(primary))}:null,
    severity:matches.map(m=>m.result.severityCandidate??"NONE").sort((a,b)=>severityRank[b]-severityRank[a])[0]??"NONE",mainQuest,sideMissions,findings,metrics,options:[],explanationRefs:findings.map(({code,params})=>({code,params})),provenance,
    confidence:confidenceAssessment.level,confidenceAssessment,evaluation,ruleRefs:provenance.ruleRefs,ruleIds:provenance.ruleRefs.map(r=>r.id),modelVersions:provenance.modelRefs,evidenceIds:provenance.evidenceRefs.map(r=>r.id),assumptionIds:provenance.assumptionRefs.map(r=>r.id),assumptions:provenance.assumptionRefs,
    missingInformation,matchedRuleIds:matches.map(m=>m.rule.id),modelConfidence,flags:unique(matches.flatMap(m=>m.result.flags)),blockers:semanticUnique([...matches.flatMap(m=>m.result.blockers),...(contradictoryCount?[{code:"STATE_CLAIM_COUNT_CONTRADICTION",params:{}}]:[])]),halted:criticalHalt||Boolean(primary?.discovery)};
}
export function mergeProvenance(items:DecisionProvenance[]):DecisionProvenance {
  const refs=<T extends {id:string}>(v:T[])=>[...new Map(v.map(r=>[JSON.stringify(r),r])).values()];
  return {ruleRefs:refs(items.flatMap(p=>p.ruleRefs)),modelRefs:refs(items.flatMap(p=>p.modelRefs)),metricRefs:unique(items.flatMap(p=>p.metricRefs)),inputRefs:unique(items.flatMap(p=>p.inputRefs)),sourceInputRefs:unique(items.flatMap(p=>p.sourceInputRefs)),evidenceRefs:refs(items.flatMap(p=>p.evidenceRefs)),assumptionRefs:refs(items.flatMap(p=>p.assumptionRefs)),findingIds:unique(items.flatMap(p=>p.findingIds))};
}
export const rulePhaseRank=phaseRank;
