import { executableRules as referenceRules } from "../registries/executable-rules.ts";
import { models as referenceModels } from "../registries/models.ts";
import { evidence as referenceEvidence } from "../registries/evidence.ts";
import { assumptions as referenceAssumptions } from "../registries/assumptions.ts";
import { assertRegisteredBundle, type RuntimeBundle } from "../registries/runtime-bundle.ts";
import { isRegisteredValueRef, registeredValueRefs, valueRefRegistry } from "../registries/value-refs.ts";
import { collectConditionRefs, evaluateCondition, validateContext } from "./predicate-evaluator.ts";
import { evaluateReference } from "./reference-evaluator.ts";
import type { Confidence, ConfidenceAssessment, DecisionProvenance, ExecutableDecisionRule, NormalizedDecisionContext, RuleEffect, SemanticRef, ValueRef } from "../contracts/index.ts";

export interface OutputValidationResult {valid:boolean;codes:string[]}
const record=(v:unknown):v is Record<string,unknown>=>typeof v==="object"&&v!==null&&!Array.isArray(v);
const nonempty=(v:unknown):v is string=>typeof v==="string"&&v.trim().length>0;
const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(nonempty)&&new Set(v).size===v.length;
const sources=["USER_REPORTED","CALCULATED","IMPORTED","VERIFIED"];
const levels:Confidence[]=["EXPERIMENTAL","LOW","MEDIUM","HIGH"];
const severities=["NONE","LOW","MEDIUM","HIGH","CRITICAL"];
const date=(v:unknown):v is string=>typeof v==="string"&&/^\d{4}-\d{2}-\d{2}(?:T.*)?$/u.test(v)&&Number.isFinite(Date.parse(v))&&new Date(Date.parse(v.slice(0,10))).toISOString().slice(0,10)===v.slice(0,10);
const scalar=(v:unknown)=>v===null||typeof v==="string"||typeof v==="boolean"||typeof v==="number"&&Number.isFinite(v);
const semantic=(v:unknown):v is SemanticRef=>record(v)&&nonempty(v.code)&&record(v.params)&&Object.values(v.params).every(scalar);
const canonical=(v:unknown):string=>JSON.stringify(record(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,record(x)?JSON.parse(canonical(x)):x])):v);
const same=(a:unknown,b:unknown)=>canonical(a)===canonical(b);
const setSame=(a:unknown[],b:unknown[])=>a.length===b.length&&a.map(canonical).sort().every((key,i)=>key===b.map(canonical).sort()[i]);
const versionRefs=(v:unknown):v is {id:string;version:string}[]=>Array.isArray(v)&&v.every(r=>record(r)&&nonempty(r.id)&&nonempty(r.version))&&new Set(v.map(r=>r.id)).size===v.length;
const revisionRefs=(v:unknown):v is {id:string;revision:number}[]=>Array.isArray(v)&&v.every(r=>record(r)&&nonempty(r.id)&&typeof r.revision==="number"&&Number.isSafeInteger(r.revision)&&r.revision>0)&&new Set(v.map(r=>r.id)).size===v.length;

/** Strict serialization boundary; malformed nested input is invalid, never executable. */
export function validateDecisionOutput(value:unknown,bundle?:RuntimeBundle):OutputValidationResult {
  try { if (bundle !== undefined) assertRegisteredBundle(bundle); return validate(value,bundle); }
  catch { return {valid:false,codes:["MALFORMED_OUTPUT_CONTRACT"]}; }
}

function validate(value:unknown,bundle?:RuntimeBundle):OutputValidationResult {
  const { rules:executableRules, models, evidence, assumptions }=bundle??{rules:referenceRules,models:referenceModels,evidence:referenceEvidence,assumptions:referenceAssumptions};
  const codes:string[]=[];
  const add=(code:string)=>{if(!codes.includes(code))codes.push(code);};
  const done=()=>({valid:codes.length===0,codes});
  const seen=new Set<object>();let nodes=0;
  const serializable=(v:unknown,depth=0):boolean=>{
    if(++nodes>50000||depth>64)return false;
    if(scalar(v))return true;
    if(typeof v!=="object"||v===null||seen.has(v)||!Array.isArray(v)&&Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null)return false;
    seen.add(v);const valid=(Array.isArray(v)?v:Object.values(v)).every(x=>serializable(x,depth+1));seen.delete(v);return valid;
  };
  if(!serializable(value))return {valid:false,codes:["OUTPUT_NOT_SERIALIZABLE"]};
  if(!record(value))return {valid:false,codes:["INVALID_OUTPUT_OBJECT"]};
  for(const key of ["decisionOutputVersion","currentStage","primaryBottleneck","severity","confidence","confidenceAssessment","evaluation","provenance","mainQuest"])if(!Object.hasOwn(value,key))add("MISSING_OUTPUT_FIELD:"+key);
  for(const key of ["metrics","sideMissions","findings","options","explanationRefs","ruleRefs","ruleIds","evidenceIds","assumptionIds","assumptions","missingInformation","modelVersions"])if(!Array.isArray(value[key]))add("MISSING_OUTPUT_FIELD:"+key);
  if(codes.length||!record(value.evaluation)||!record(value.evaluation.inputStates)||!record(value.evaluation.configValues)||!record(value.provenance)||!record(value.confidenceAssessment)){add("INCOMPLETE_OUTPUT_CONTRACT");return done();}
  const evaluation=value.evaluation;
  const configValues=evaluation.configValues as Record<string,unknown>;
  const inputStates=evaluation.inputStates as Record<string,unknown>;
  const inputRecords=record(evaluation.inputRecords)?evaluation.inputRecords:{};
  const lineage=record(evaluation.valueLineage)?evaluation.valueLineage:{};
  const dependencies=record(evaluation.valueDependencies)?evaluation.valueDependencies:{};
  if(value.decisionOutputVersion!=="1.0")add("INVALID_OUTPUT_VERSION");
  if(!levels.includes(value.confidence as Confidence)||value.confidenceAssessment.level!==value.confidence)add("CONFIDENCE_MISMATCH");
  if(!severities.includes(String(value.severity)))add("INVALID_SEVERITY");
  if(value.currentStage!==null&&!["SURVIVAL","STABILITY","CONTROL","ACCUMULATION","GROWTH","OPTIONALITY"].includes(String(value.currentStage)))add("INVALID_STAGE");
  if(value.currentStage==="OPTIONALITY")add("OPTIONALITY_MODEL_NOT_FROZEN");
  if(!nonempty(evaluation.id)||!nonempty(evaluation.snapshotId)||!date(evaluation.evaluatedAt)||evaluation.schemaVersion!=="1.0.0"||!nonempty(evaluation.jurisdiction)||!["REFERENCE_CONTEXT","PROFILE_NORMALIZATION"].includes(String(evaluation.source)))add("INVALID_EVALUATION_METADATA");
  if(evaluation.source==="PROFILE_NORMALIZATION"&&(!record(evaluation.inputRecords)||!record(evaluation.valueLineage)))add("MISSING_NORMALIZATION_LINEAGE");
  const contextEntries:Record<string,unknown>={};
  for(const [ref,state]of Object.entries(inputStates)){
    if(!isRegisteredValueRef(ref)||!record(state)){add("INVALID_EVALUATION_INPUT_STATE");continue;}
    contextEntries[ref]=state.status==="KNOWN"?{status:"KNOWN",data:{value:state.value,source:state.source,updatedAt:state.updatedAt}}:{status:state.status,reasonCode:state.reasonCode};
    if(state.status!=="KNOWN"&&Object.hasOwn(state,"value"))add("UNKNOWN_INPUT_HAS_VALUE");
  }
  const contextValidation=validateContext(contextEntries);
  if(!contextValidation.valid){add("INVALID_EVALUATION_CONTEXT");return done();}
  const context=contextEntries as NormalizedDecisionContext;
  for(const [path,state]of Object.entries(inputRecords)){
    if(!nonempty(path)||!record(state)||!["KNOWN","UNKNOWN","NOT_APPLICABLE"].includes(String(state.status))){add("INVALID_SOURCE_INPUT_RECORD");continue;}
    if(state.status==="KNOWN"&&(!scalar(state.value)||!sources.includes(String(state.source))||!date(state.updatedAt)))add("INVALID_SOURCE_INPUT_RECORD");
    if(state.status!=="KNOWN"&&(!nonempty(state.reasonCode)||Object.hasOwn(state,"value")))add("INVALID_SOURCE_INPUT_RECORD");
  }
  for(const [ref,paths]of Object.entries(lineage))if(!isRegisteredValueRef(ref)||!strings(paths)||paths.some(path=>!Object.hasOwn(inputRecords,path)))add("INVALID_VALUE_LINEAGE");
  for(const [ref,refs]of Object.entries(dependencies))if(!isRegisteredValueRef(ref)||!strings(refs)||refs.some(r=>!isRegisteredValueRef(r)))add("INVALID_VALUE_DEPENDENCY");
  for(const [ref,amount]of Object.entries(configValues))if(!isRegisteredValueRef(ref)||valueRefRegistry[ref].source!=="ASSUMPTION_CONFIG"||!record(inputStates[ref])||inputStates[ref].status!=="KNOWN"||inputStates[ref].value!==amount)add("CONFIG_VALUE_CONTEXT_MISMATCH");
  const findings=value.findings as unknown[];
  const missingInformation=value.missingInformation as unknown[];
  const findingIds=new Set(findings.flatMap(f=>record(f)&&nonempty(f.id)?[f.id]:[]));
  if(findingIds.size!==findings.length)add("INVALID_FINDING_IDS");
  for(const item of [...missingInformation,...value.explanationRefs as unknown[]])if(!semantic(item))add("INVALID_SEMANTIC_OUTPUT");
  const missingRefs=missingInformation.flatMap(item=>semantic(item)&&item.code==="MISSING_VALUE_REF"&&isRegisteredValueRef(item.params.ref)?[item.params.ref]:[]);
  for(const ref of missingRefs)if(context[ref].status==="KNOWN")add("MISSING_INFORMATION_CONTEXT_MISMATCH");
  type Support={rule:ExecutableDecisionRule;effect:RuleEffect;refs:ValueRef[];discovery:boolean;fallback:boolean};
  const supportFor=(rule:ExecutableDecisionRule):Support[]=>{
    if(!rule.enabled)return [];
    const supported:Support[]=[];
    const discovered=rule.discoveryCondition&&rule.discoveryResult&&evaluateCondition(rule.discoveryCondition,context)==="TRUE";
    if(discovered)supported.push({rule,effect:rule.discoveryResult!,refs:collectConditionRefs(rule.discoveryCondition!),discovery:true,fallback:false});
    else if(evaluateCondition(rule.condition,context)==="TRUE")supported.push({rule,effect:rule.result,refs:collectConditionRefs(rule.condition),discovery:rule.result.mainQuestCandidate?.code.startsWith("DISCOVER")===true||rule.result.mainQuestCandidate?.code==="RECONCILE_CASH_FLOW_INPUTS",fallback:false});
    else if(rule.id==="R-001"&&missingRefs.length>0&&missingRefs.some(ref=>context[ref].status!=="KNOWN"))supported.push({rule,effect:rule.result,refs:missingRefs,discovery:true,fallback:true});
    return supported;
  };
  const conclusionProvenance:DecisionProvenance[]=[];
  const parseProvenance=(p:unknown,requiresRule=false,requiresFinding=false):DecisionProvenance|null=>{
    if(!record(p)||!versionRefs(p.ruleRefs)||!versionRefs(p.modelRefs)||!revisionRefs(p.evidenceRefs)||!revisionRefs(p.assumptionRefs)||!strings(p.inputRefs)||!strings(p.metricRefs)||!strings(p.sourceInputRefs)||!strings(p.findingIds)){add("INCOMPLETE_PROVENANCE");return null;}
    const provenance=p as unknown as DecisionProvenance;
    if(requiresRule)conclusionProvenance.push(provenance);
    if(requiresRule&&!provenance.ruleRefs.length)add("CONCLUSION_REQUIRES_RULE");
    if(requiresFinding&&!provenance.findingIds.length)add("CONCLUSION_REQUIRES_FINDING");
    if(requiresRule&&!provenance.modelRefs.some(ref=>ref.id==="bottleneck_v1"))add("MISSING_CONCLUSION_MODEL");
    for(const ref of provenance.ruleRefs)if(!executableRules.some(rule=>rule.id===ref.id&&rule.version===ref.version))add("UNKNOWN_RULE_VERSION");
    for(const ref of provenance.modelRefs)if(!models.some(model=>model.id===ref.id&&model.version===ref.version))add("UNKNOWN_MODEL_VERSION");
    for(const ref of provenance.evidenceRefs)if(!evidence.some(item=>item.id===ref.id&&item.revision===ref.revision))add("UNKNOWN_EVIDENCE_REVISION");
    for(const ref of provenance.assumptionRefs)if(!assumptions.some(item=>item.id===ref.id&&item.revision===ref.revision))add("UNKNOWN_ASSUMPTION_REVISION");
    for(const ref of [...provenance.inputRefs,...provenance.metricRefs])if(!isRegisteredValueRef(ref)||!Object.hasOwn(inputStates,ref))add("UNKNOWN_PROVENANCE_VALUE_REF");
    for(const ref of provenance.metricRefs)if(!isRegisteredValueRef(ref)||valueRefRegistry[ref].source!=="METRIC"||!provenance.inputRefs.includes(ref))add("INVALID_PROVENANCE_METRIC_REF");
    for(const ref of provenance.sourceInputRefs)if(!Object.hasOwn(inputRecords,ref))add("UNKNOWN_SOURCE_INPUT_REF");
    for(const ref of provenance.findingIds)if(!findingIds.has(ref))add("UNKNOWN_FINDING_REF");
    for(const ref of provenance.inputRefs){
      if(!isRegisteredValueRef(ref))continue;
      const producer=valueRefRegistry[ref].producerModel;
      if(producer&&!provenance.modelRefs.some(model=>model.id===producer))add("MISSING_PRODUCER_MODEL");
      const sourcePaths=lineage[ref];
      // Unsupported/absent inputs are already traceable by their explicit UNKNOWN
      // state and reason. Do not invent raw input records for a research slot.
      if(evaluation.source==="PROFILE_NORMALIZATION"&&(context[ref].status==="KNOWN"&&(!strings(sourcePaths)||sourcePaths.length===0)||strings(sourcePaths)&&sourcePaths.some(path=>!provenance.sourceInputRefs.includes(path))))add("MISSING_RAW_INPUT_LINEAGE");
      const refs=dependencies[ref];
      if(strings(refs)&&refs.some(dependency=>!provenance.inputRefs.includes(dependency as ValueRef)))add("MISSING_DEPENDENCY_PROVENANCE");
    }
    if(provenance.inputRefs.includes("config.minimumViableLiquidityMonths")&&context["config.minimumViableLiquidityMonths"].status==="KNOWN"&&(!provenance.assumptionRefs.some(a=>a.id==="AS-001")||configValues["config.minimumViableLiquidityMonths"]!==context["config.minimumViableLiquidityMonths"].data.value))add("MISSING_CONFIG_ASSUMPTION_PROVENANCE");
    for(const ref of provenance.ruleRefs){
      const rule=executableRules.find(r=>r.id===ref.id);if(!rule)continue;
      if(rule.assumptionIds.some(id=>!provenance.assumptionRefs.some(a=>a.id===id)))add("MISSING_RULE_ASSUMPTION");
      if(rule.evidenceIds.some(id=>!provenance.evidenceRefs.some(e=>e.id===id)))add("MISSING_RULE_EVIDENCE");
      const effectiveSupport=supportFor(rule);
      if(!effectiveSupport.length)add("UNSUPPORTED_RULE_CONCLUSION");
      // A real rule ID alone does not prove a conclusion. Its actual predicate
      // inputs must remain in every local and aggregate provenance record;
      // the dependency and raw-lineage checks above then close the full chain.
      else if(!effectiveSupport.some(s=>s.refs.every(input=>provenance.inputRefs.includes(input))))add("MISSING_RULE_INPUT_PROVENANCE");
    }
    return provenance;
  };
  const supports=(p:DecisionProvenance|null):Support[]=>p?p.ruleRefs.flatMap(ref=>{const rule=executableRules.find(r=>r.id===ref.id&&r.version===ref.version);return rule?supportFor(rule):[];}):[];
  const checkConfidence=(c:unknown,p:DecisionProvenance|null):ConfidenceAssessment|null=>{
    if(!record(c)||!levels.includes(c.level as Confidence)||!strings(c.reasonCodes)||!c.reasonCodes.length||!strings(c.inputRefs)||!versionRefs(c.modelRefs)||!revisionRefs(c.assumptionRefs)){add("INCOMPLETE_CONFIDENCE_PROVENANCE");return null;}
    const confidence=c as unknown as ConfidenceAssessment;
    if(!p)return confidence;
    if(!setSame(confidence.inputRefs,p.inputRefs)||!setSame(confidence.modelRefs,p.modelRefs)||!setSame(confidence.assumptionRefs,p.assumptionRefs))add("CONFIDENCE_REFERENCE_MISMATCH");
    let cap:Confidence="HIGH";
    const limit=(level:Confidence,reason?:string)=>{if(levels.indexOf(level)<levels.indexOf(cap))cap=level;if(reason&&!confidence.reasonCodes.includes(reason))add("MISSING_CONFIDENCE_REASON");};
    if(evaluation.source==="REFERENCE_CONTEXT")limit("LOW","UNVERSIONED_REFERENCE_INPUTS");
    if(p.inputRefs.some(ref=>!isRegisteredValueRef(ref)||context[ref].status!=="KNOWN"))limit("LOW","MISSING_REQUIRED_DATA");
    if([...p.inputRefs.map(ref=>inputStates[ref]),...p.sourceInputRefs.map(ref=>inputRecords[ref])].some(state=>record(state)&&state.source==="USER_REPORTED"))limit("MEDIUM","USER_REPORTED_INPUT");
    if(p.sourceInputRefs.some(ref=>record(inputRecords[ref])&&inputRecords[ref].value==="ESTIMATED"))limit("MEDIUM","ESTIMATED_VALUATION");
    for(const ref of p.ruleRefs){const rule=executableRules.find(r=>r.id===ref.id);if(rule)limit(rule.confidence);}
    for(const ref of p.assumptionRefs){const assumption=assumptions.find(a=>a.id===ref.id);if(assumption){limit(assumption.confidence);if(assumption.status==="RESEARCH_REQUIRED"&&!confidence.reasonCodes.includes("RESEARCH_REQUIRED:"+ref.id))add("HIDDEN_RESEARCH_REQUIRED_ASSUMPTION");}}
    for(const ref of p.modelRefs){const model=models.find(m=>m.id===ref.id);if(model){limit(model.confidence);if(model.status!=="VALIDATED"&&!confidence.reasonCodes.includes("WORKING_MODEL:"+ref.id))add("MISSING_CONFIDENCE_REASON");}}
    if(levels.indexOf(confidence.level)>levels.indexOf(cap))add("CONFIDENCE_EXCEEDS_SUPPORT");
    return confidence;
  };
  const globalProvenance=parseProvenance(value.provenance);
  checkConfidence(value.confidenceAssessment,globalProvenance);
  const parsedFindings=new Map<string,{semantic:SemanticRef;provenance:DecisionProvenance|null}>();
  for(const finding of findings){
    if(!semantic(finding)||!record(finding)||!nonempty(finding.id)){add("INVALID_FINDING");continue;}
    const p=parseProvenance(finding.provenance,true);checkConfidence(finding.confidence,p);
    if(!supports(p).some(s=>s.effect.findings.some(ref=>same(ref,{code:finding.code,params:finding.params}))))add("FINDING_RULE_SEMANTIC_MISMATCH");
    parsedFindings.set(finding.id,{semantic:finding,provenance:p});
  }
  const checkLinkedFindings=(p:DecisionProvenance|null,supported:Support[])=>{
    if(!p)return;
    if(!p.findingIds.some(id=>{const finding=parsedFindings.get(id);return finding&&supported.some(s=>s.effect.findings.some(ref=>same(ref,{code:finding.semantic.code,params:finding.semantic.params}))&&finding.provenance?.ruleRefs.some(ref=>ref.id===s.rule.id&&ref.version===s.rule.version));}))add("UNLINKED_CONCLUSION_FINDING");
  };
  let bottleneckSupports:Support[]=[];
  if(value.primaryBottleneck!==null){
    if(!semantic(value.primaryBottleneck)||!record(value.primaryBottleneck))add("INVALID_BOTTLENECK");
    else {const bottleneck=value.primaryBottleneck;const p=parseProvenance(bottleneck.provenance,true,true);bottleneckSupports=supports(p).filter(s=>s.effect.bottleneckCandidate&&same(s.effect.bottleneckCandidate,{code:bottleneck.code,params:bottleneck.params}));if(!bottleneckSupports.length)add("BOTTLENECK_RULE_SEMANTIC_MISMATCH");checkLinkedFindings(p,bottleneckSupports);}
  }
  const missionIds=new Set<string>();
  const checkMission=(m:unknown)=>{
    if(!record(m)||!semantic(m)||!nonempty(m.id)||!nonempty(m.whyCode)||!nonempty(m.actionCode)||!nonempty(m.impactCode)||!record(m.verification)||!strings(m.requiredKnownInputs)){add("INVALID_MISSION");return;}
    if(missionIds.has(m.id))add("DUPLICATE_MISSION_ID");missionIds.add(m.id);
    if(!["DISCOVER","DECIDE","REPAIR","BUILD","LEARN","OPTIMIZE"].includes(String(m.type))||!["TODO","IN_PROGRESS","USER_REPORTED_DONE","VERIFIED_DONE","NOT_APPLICABLE"].includes(String(m.status)))add("INVALID_MISSION_STATE");
    if(!["USER_CONFIRMATION","STATE_RECALCULATION","DOCUMENTED_VALUE","EXTERNAL_VERIFICATION","NOT_VERIFIABLE"].includes(String(m.verification.type))||!strings(m.verification.requirementCodes)||!m.verification.requirementCodes.length||!strings(m.verification.evidenceRefs))add("INVALID_MISSION_VERIFICATION");
    const p=parseProvenance(m.provenance,true,true);checkConfidence(m.confidence,p);
    if(!p?.modelRefs.some(ref=>ref.id==="mission_v1"))add("MISSING_MISSION_MODEL");
    if(m.actionCode!==m.code||m.whyCode!=="WHY_"+m.code||m.impactCode!=="IMPACT_"+m.code)add("MISSION_EXPLANATION_CODE_MISMATCH");
    const requiredKnownInputs=m.requiredKnownInputs;
    const supported=supports(p).filter(s=>[s.effect.mainQuestCandidate,...s.effect.sideMissionCandidates].some(ref=>ref&&same(ref,{code:m.code,params:m.params})));
    if(!supported.length)add("MISSION_RULE_SEMANTIC_MISMATCH");
    checkLinkedFindings(p,supported);
    for(const s of supported){
      const expectedType=s.discovery||m.code==="EVALUATE_RESOURCE_RUNWAY"?"DISCOVER":m.code.startsWith("DECIDE")?"DECIDE":m.code.startsWith("BUILD")?"BUILD":"REPAIR";
      if(m.type!==expectedType)add("MISSION_TYPE_RULE_MISMATCH");
      if(m.type!=="DISCOVER"&&(s.rule.requiredKnownInputs.some(ref=>!requiredKnownInputs.includes(ref))||s.refs.some(ref=>!p?.inputRefs.includes(ref))))add("OMITTED_MISSION_REQUIREMENT");
    }
    if(m.type!=="DISCOVER"&&(!m.requiredKnownInputs.length||m.requiredKnownInputs.some(ref=>!isRegisteredValueRef(ref)||context[ref].status!=="KNOWN"||!p?.inputRefs.includes(ref))))add("ACTION_REQUIRES_KNOWN_INPUTS");
    if(m.type==="DISCOVER"&&missingInformation.length===0&&m.code!=="EVALUATE_RESOURCE_RUNWAY")add("DISCOVERY_REQUIRES_MISSING_INFORMATION");
    // Registered evidence describes model support, not a fulfillment receipt.
    // This candidate has no completion-proof contract, so neither a system
    // label nor a static research reference can establish verified completion.
    if(m.status==="VERIFIED_DONE")add("MISSION_COMPLETION_NOT_VERIFIED");
    if(strings(m.verification.evidenceRefs)&&m.verification.evidenceRefs.some(id=>!evidence.some(e=>e.id===id)))add("UNKNOWN_MISSION_EVIDENCE");
  };
  if(value.mainQuest!==null)checkMission(value.mainQuest);
  for(const mission of value.sideMissions as unknown[])checkMission(mission);
  if((value.sideMissions as unknown[]).length>3)add("SIDE_MISSION_INVARIANT");
  const metricIds=new Set<string>();
  for(const metric of value.metrics as unknown[]){
    if(!record(metric)||!isRegisteredValueRef(metric.id)||!nonempty(metric.labelCode)||!record(metric.value)){add("INVALID_DECISION_METRIC");continue;}
    const id=metric.id,d=valueRefRegistry[id];
    if(metric.labelCode!==id)add("METRIC_LABEL_CODE_MISMATCH");
    if(metricIds.has(id))add("DUPLICATE_METRIC_ID");metricIds.add(id);
    if(d.source!=="METRIC"||metric.unit!==d.unit||metric.timeBasis!==d.timeBasis||d.currency==="NOT_APPLICABLE"&&metric.currency!=="NOT_APPLICABLE")add("METRIC_UNIT_CONTRACT_MISMATCH");
    if(d.currency==="profile.primaryCurrency"){
      const primary=inputRecords["profile.primaryCurrency"];
      if(evaluation.source==="PROFILE_NORMALIZATION"&&(!record(primary)||primary.status!=="KNOWN"||!nonempty(primary.value)||metric.currency!==primary.value))add("METRIC_CURRENCY_CONTEXT_MISMATCH");
      if(evaluation.source==="REFERENCE_CONTEXT"&&metric.currency!=="UNDECLARED_PRIMARY_CURRENCY"&&(!record(primary)||metric.currency!==primary.value))add("METRIC_CURRENCY_CONTEXT_MISMATCH");
    }
    if(!validateContext({[id]:metric.value},true).valid)add("INVALID_METRIC_VALUE");
    if(!same(metric.value,context[id]))add("METRIC_CONTEXT_MISMATCH");
    const p=parseProvenance(metric.provenance);checkConfidence(metric.confidence,p);
    if(!p?.metricRefs.includes(id)||!p.inputRefs.includes(id))add("MISSING_METRIC_SELF_PROVENANCE");
  }
  for(const ref of registeredValueRefs)if(valueRefRegistry[ref].source==="METRIC"&&!metricIds.has(ref))add("MISSING_DECISION_METRIC");
  for(const option of value.options as unknown[]){if(!record(option)||!semantic(option)||!nonempty(option.id)||!nonempty(option.consequenceCode)||!record(option.consequenceParams)||!Object.values(option.consequenceParams).every(scalar)){add("INVALID_DECISION_OPTION");continue;}parseProvenance(option.provenance,true,true);add("UNSUPPORTED_RULE_OPTION");}
  if(!versionRefs(value.ruleRefs)||!versionRefs(value.modelVersions)||!revisionRefs(value.assumptions)||!strings(value.ruleIds)||!strings(value.evidenceIds)||!strings(value.assumptionIds))add("INVALID_TOP_LEVEL_REFS");
  else if(globalProvenance&&(!setSame(value.ruleRefs,globalProvenance.ruleRefs)||!setSame(value.modelVersions,globalProvenance.modelRefs)||!setSame(value.assumptions,globalProvenance.assumptionRefs)||!setSame(value.ruleIds,globalProvenance.ruleRefs.map(r=>r.id))||!setSame(value.evidenceIds,globalProvenance.evidenceRefs.map(r=>r.id))||!setSame(value.assumptionIds,globalProvenance.assumptionRefs.map(r=>r.id))))add("OUTPUT_REFERENCE_MISMATCH");
  // Aggregate decision support must retain every displayed conclusion's chain.
  // Unused metric records are independently validated, not promoted into the
  // decision's consumed-model or assumption inventory.
  if(globalProvenance)for(const p of conclusionProvenance)for(const field of ["ruleRefs","modelRefs","metricRefs","inputRefs","sourceInputRefs","evidenceRefs","assumptionRefs","findingIds"] as const)if(p[field].some(ref=>!globalProvenance[field].some(item=>same(item,ref))))add("INCOMPLETE_AGGREGATE_PROVENANCE");
  const globalSupports=supports(globalProvenance);
  const declaredMissing=globalSupports.flatMap(s=>s.effect.missingInformation);
  // Replay only the trusted engine's existing exposure policy. This preserves
  // its rule order, downstream blocks and critical halts without inventing a
  // second rule for which unknown values are required to be disclosed.
  const replay=evaluateReference(context,executableRules,undefined,bundle);
  if(globalProvenance&&!setSame(globalProvenance.ruleRefs,replay.ruleRefs))add("EXECUTED_RULE_PROVENANCE_MISMATCH");
  const requiredMissing=[...declaredMissing,...replay.missingInformation];
  for(const required of requiredMissing)if(!missingInformation.some(item=>semantic(item)&&same(item,required)))add(required.code==="MISSING_VALUE_REF"?"UNEXPOSED_REQUIRED_UNKNOWN_INPUT":"OMITTED_RULE_MISSING_INFORMATION");
  const conclusionSemantic=(item:unknown)=>semantic(item)?{code:item.code,params:item.params}:null;
  if(!same(conclusionSemantic(value.mainQuest),conclusionSemantic(replay.mainQuest)))add("MAIN_MISSION_PRIORITY_MISMATCH");
  if(!same(conclusionSemantic(value.primaryBottleneck),conclusionSemantic(replay.primaryBottleneck))||value.currentStage!==replay.currentStage)add("PRIMARY_DECISION_PRIORITY_MISMATCH");
  for(const required of replay.sideMissions.filter(mission=>mission.type==="DISCOVER"))if(!(value.sideMissions as unknown[]).some(mission=>same(conclusionSemantic(mission),conclusionSemantic(required))))add("OMITTED_REQUIRED_SIDE_DISCOVERY");
  const contradictoryCount=context["counts.unresolvedPriorityClaims"].status==="KNOWN"&&context["counts.unresolvedPriorityClaims"].data.value===0&&record(value.mainQuest)&&value.mainQuest.type!=="DISCOVER";
  for(const item of missingInformation){
    if(!semantic(item))continue;
    const directMissing=item.code==="MISSING_VALUE_REF"&&isRegisteredValueRef(item.params.ref)&&same(item.params,{ref:item.params.ref})&&context[item.params.ref].status!=="KNOWN";
    const reconciliation=item.code==="PRIORITY_CLAIM_COUNT_RECONCILIATION"&&contradictoryCount&&same(item.params,{});
    if(!directMissing&&!reconciliation&&!declaredMissing.some(ref=>same(ref,{code:item.code,params:item.params})))add("UNSUPPORTED_MISSING_INFORMATION");
  }
  if(contradictoryCount&&!missingInformation.some(item=>semantic(item)&&item.code==="PRIORITY_CLAIM_COUNT_RECONCILIATION"))add("UNEXPOSED_CLAIM_COUNT_CONTRADICTION");
  if(value.currentStage!==null&&!(bottleneckSupports.length?bottleneckSupports:globalSupports).some(s=>s.effect.stageCandidate===value.currentStage))add("UNSUPPORTED_STAGE");
  const supportedSeverity=globalSupports.map(s=>s.effect.severityCandidate??"NONE").sort((a,b)=>severities.indexOf(b)-severities.indexOf(a))[0]??"NONE";
  if(value.severity!==supportedSeverity)add("SEVERITY_RULE_MISMATCH");
  for(const explanation of value.explanationRefs as unknown[])if(semantic(explanation)&&!findings.some(f=>semantic(f)&&same(explanation,{code:f.code,params:f.params})))add("EXPLANATION_FINDING_MISMATCH");
  return done();
}
