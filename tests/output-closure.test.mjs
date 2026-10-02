import assert from "node:assert/strict";
import test from "node:test";
import { evaluateReference } from "../docs/money-model/reference/reference-evaluator.ts";
import { validateDecisionOutput } from "../docs/money-model/reference/output-validator.ts";
import { createContext, flag, scalar } from "../docs/money-model/reference/context-builder.ts";
import { known, unknown } from "../docs/money-model/schemas/domain-value.schema.ts";
import { executableCases } from "../docs/money-model/tests/executable-cases.ts";
import { evidence } from "../docs/money-model/registries/evidence.ts";
import { assumptions } from "../docs/money-model/registries/assumptions.ts";
import { normalizeProfile } from "../docs/money-model/reference/profile-normalizer.ts";
const clone=(value)=>JSON.parse(JSON.stringify(value));
const baseline=()=>evaluateReference(createContext({"flags.hasDelinquentDebt":flag(true)}));
const revisionBaseline=()=>evaluateReference(createContext({"flags.hasDelinquentDebt":flag(true),"flags.hasMissingCriticalData":flag(true)}));
const normalizedBaseline=(mutateProfile=()=>{})=>{
  const dp=(value)=>({value,source:"USER_REPORTED",updatedAt:"2026-10-01"});
  const profile={profile:{primaryCurrency:"TWD",country:"TW"},income:[{id:"salary",type:"SALARY",averageMonthlyNetIncome:dp(60000),stability:"HIGH"}],expenses:{necessaryMonthly:dp(20000),discretionaryMonthly:dp(10000),otherMonthlyRequired:dp(0),aggregatesExcludeDebtAndObligations:true},assets:[{id:"cash",type:"CASH",currentValue:dp(100000),ownership:"SOLE",liquidity:"IMMEDIATE",purpose:"UNASSIGNED"}],liabilities:[{id:"loan",type:"PERSONAL_LOAN",balance:dp(50000),apr:dp(12),costClassification:known("HIGH_COST"),minimumMonthlyPayment:dp(1000),economicPaymentId:"loan-minimum",secured:false,delinquencyStatus:"CURRENT"}],obligations:[],goals:[],household:{dependents:dp(0),externalSupportAvailable:dp(false)}};
  const options={snapshotId:"output-closure-snapshot",asOf:"2026-10-01",monthlyPeriodId:"2026-10",primaryCurrencyConfirmed:true,netMonthlyBasisConfirmed:true,stockAsOfConfirmed:true,approvedMonthlyIncomeIds:["salary"],complete:{income:true,expenses:true,assets:true,liabilities:true,obligations:true,goals:true,resources:true,assignments:true,claims:true},resources:[{id:"cash-resource",type:"CURRENT_CASH",amount:known(100000),underlyingAssetId:"cash",ownership:"SOLE",availability:"AVAILABLE",liquidity:"IMMEDIATE",valuationStatus:"KNOWN",purpose:"UNASSIGNED",availableFrom:known("2026-10-01"),reservedForClaimIds:[],source:"USER_REPORTED",certainty:"HIGH"}],assignments:[],claims:[]};
  mutateProfile(profile);
  const normalized=normalizeProfile(profile,options);
  return evaluateReference(normalized.context,undefined,normalized.metadata);
};
const reject=(output,code)=>{const actual=validateDecisionOutput(output);assert.equal(actual.valid,false,JSON.stringify(actual));if(code)assert.ok(actual.codes.includes(code),JSON.stringify(actual));};

test("B5: serialized reference outputs preserve every executable acceptance decision",()=>{
  for(const fixture of executableCases){const result=validateDecisionOutput(clone(evaluateReference(fixture.context)));assert.equal(result.valid,true,fixture.id+":"+JSON.stringify(result.codes));}
});
test("B1/B5: all-unknown fallback is a valid low-confidence Discover output",()=>{
  const output=evaluateReference(createContext());
  assert.equal(output.mainQuest.type,"DISCOVER");
  assert.equal(output.confidence,"LOW");
  assert.ok(output.missingInformation.some((item)=>item.code==="MISSING_VALUE_REF"));
  assert.deepEqual(validateDecisionOutput(clone(output)),{valid:true,codes:[]});
});
test("B1/B5: a critical action survives a contradictory zero claim count and exposes reconciliation",()=>{
  const output=evaluateReference(createContext({"flags.hasDelinquentDebt":flag(true),"counts.unresolvedPriorityClaims":scalar(0)}));
  assert.equal(output.mainQuest.code,"RESOLVE_DELINQUENCY");
  assert.ok(output.missingInformation.some((item)=>item.code==="PRIORITY_CLAIM_COUNT_RECONCILIATION"));
  assert.deepEqual(validateDecisionOutput(clone(output)),{valid:true,codes:[]});
});
for(const [description,mutate]of [
  ["nonarray assumptions",(o)=>o.provenance.assumptionRefs={}],
  ["missing bottleneck refs",(o)=>o.primaryBottleneck.provenance={}],
  ["null finding provenance",(o)=>o.findings[0].provenance=null],
  ["null side mission",(o)=>o.sideMissions=[null]],
  ["null option",(o)=>o.options=[null]],
  ["null metric",(o)=>o.metrics=[null]],
  ["invalid lineage container",(o)=>o.evaluation.valueLineage={"flags.hasDelinquentDebt":42}],
  ["nonarray confidence refs",(o)=>o.confidenceAssessment.modelRefs={}],
  ["missing source inventory",(o)=>{o.evaluation.source="PROFILE_NORMALIZATION";delete o.evaluation.inputRecords;}],
])test(`B5: malformed ${description} returns invalid instead of throwing`,()=>{
  const output=clone(baseline());mutate(output);
  assert.doesNotThrow(()=>validateDecisionOutput(output));reject(output);
});
test("B5: cycles functions BigInt NaN and Infinity are not serializable output",()=>{
  for(const value of [NaN,Infinity,1n,()=>{}]){const output=baseline();output.bad=value;reject(output,"OUTPUT_NOT_SERIALIZABLE");}
  const output=baseline();output.self=output;reject(output,"OUTPUT_NOT_SERIALIZABLE");
});
test("B5: complete output requires explicit nullable fields and unique metric identity",()=>{
  for(const field of ["mainQuest","primaryBottleneck"]){const output=clone(baseline());delete output[field];reject(output,"MISSING_OUTPUT_FIELD:"+field);}
  const output=clone(baseline());output.metrics.push(clone(output.metrics[0]));reject(output,"DUPLICATE_METRIC_ID");
});
for(const [description,mutate,code]of [
  ["currency mismatch",(o)=>o.metrics[0].currency="FAKE_CURRENCY","METRIC_CURRENCY_CONTEXT_MISMATCH"],
  ["money sign",(o)=>{o.metrics.find((m)=>m.id==="metrics.netMonthlyIncome").value=known(-1);},"INVALID_METRIC_VALUE"],
  ["ratio bound",(o)=>{o.metrics.find((m)=>m.id==="metrics.incomeConcentration").value=known(1.1);},"INVALID_METRIC_VALUE"],
  ["unit mismatch",(o)=>o.metrics[0].unit="MONTHS","METRIC_UNIT_CONTRACT_MISMATCH"],
  ["period mismatch",(o)=>o.metrics[0].timeBasis="AS_OF","METRIC_UNIT_CONTRACT_MISMATCH"],
  ["invalid source",(o)=>{o.metrics[0].value=known(1);o.metrics[0].value.data.source="LLM";},"INVALID_METRIC_VALUE"],
  ["invalid date",(o)=>{o.metrics[0].value=known(1);o.metrics[0].value.data.updatedAt="NOT_A_DATE";},"INVALID_METRIC_VALUE"],
  ["snapshot mismatch",(o)=>{o.metrics.find((m)=>m.id==="metrics.coreCashFlow").value=known(999);},"METRIC_CONTEXT_MISMATCH"],
  ["unknown with invented value",(o)=>{o.metrics[0].value.value=123;},"INVALID_METRIC_VALUE"],
])test(`B5: metric ${description} cannot be persisted as supported`,()=>{const output=clone(baseline());mutate(output);reject(output,code);});
for(const [description,mutate,code]of [
  ["invented mission",(o)=>o.mainQuest.code="PAY_UNKNOWN_HIGH_COST_DEBT","MISSION_RULE_SEMANTIC_MISMATCH"],
  ["invented mission params",(o)=>o.mainQuest.params={amount:999999},"MISSION_RULE_SEMANTIC_MISMATCH"],
  ["invented mission type",(o)=>o.mainQuest.type="MADE_UP","INVALID_MISSION_STATE"],
  ["invented mission status",(o)=>o.mainQuest.status="MADE_UP","INVALID_MISSION_STATE"],
  ["action relabeled Discover",(o)=>o.mainQuest.type="DISCOVER","MISSION_TYPE_RULE_MISMATCH"],
  ["invented finding",(o)=>o.findings[0].code="WEALTH_GUARANTEE","FINDING_RULE_SEMANTIC_MISMATCH"],
  ["invented bottleneck",(o)=>o.primaryBottleneck.code="WEALTH_GUARANTEE","BOTTLENECK_RULE_SEMANTIC_MISMATCH"],
  ["unsupported stage",(o)=>o.currentStage="GROWTH","UNSUPPORTED_STAGE"],
  ["false supporting predicate",(o)=>o.evaluation.inputStates["flags.hasDelinquentDebt"].value=false,"UNSUPPORTED_RULE_CONCLUSION"],
  ["missing required action input",(o)=>o.mainQuest.requiredKnownInputs=[],"OMITTED_MISSION_REQUIREMENT"],
])test(`B5: retained legitimate refs cannot legitimize ${description}`,()=>{const output=clone(baseline());mutate(output);reject(output,code);});
test("B5: stable refs versions revisions and ID aliases must remain consistent",()=>{
  const tests=[
    [(o)=>o.provenance.ruleRefs[0].version="99.0.0","UNKNOWN_RULE_VERSION"],
    [(o)=>o.provenance.modelRefs[0].version="99.0.0","UNKNOWN_MODEL_VERSION"],
    [(o)=>o.provenance.evidenceRefs.push({id:"EV-FAKE",revision:1}),"UNKNOWN_EVIDENCE_REVISION"],
    [(o)=>o.provenance.evidenceRefs[0].revision=2,"UNKNOWN_EVIDENCE_REVISION"],
    [(o)=>o.provenance.assumptionRefs[0].revision=2,"UNKNOWN_ASSUMPTION_REVISION"],
    [(o)=>o.provenance.assumptionRefs[0].revision=0,"INCOMPLETE_PROVENANCE"],
    [(o)=>o.provenance.evidenceRefs[0].revision=1.5,"INCOMPLETE_PROVENANCE"],
    [(o)=>o.ruleIds=["GHOST"],"OUTPUT_REFERENCE_MISMATCH"],
    [(o)=>o.evidenceIds=["GHOST"],"OUTPUT_REFERENCE_MISMATCH"],
    [(o)=>o.assumptionIds=["GHOST"],"OUTPUT_REFERENCE_MISMATCH"],
    [(o)=>o.confidenceAssessment.inputRefs=[],"CONFIDENCE_REFERENCE_MISMATCH"],
  ];
  for(const [mutate,code]of tests){const output=clone(revisionBaseline());mutate(output);reject(output,code);}
});

test("B5: evidence and assumption revisions follow their declared registries, not a hardcoded initial revision",()=>{
  const selected=revisionBaseline();
  const evidenceRecord=evidence.find((item)=>item.id===selected.provenance.evidenceRefs[0].id);
  const assumptionRecord=assumptions.find((item)=>item.id===selected.provenance.assumptionRefs[0].id);
  const originalEvidenceRevision=evidenceRecord.revision,originalAssumptionRevision=assumptionRecord.revision;
  try {
    evidenceRecord.revision=2;assumptionRecord.revision=3;
    const output=clone(revisionBaseline());
    assert.equal(output.provenance.evidenceRefs.find((item)=>item.id===evidenceRecord.id).revision,2);
    assert.equal(output.provenance.assumptionRefs.find((item)=>item.id===assumptionRecord.id).revision,3);
    assert.deepEqual(validateDecisionOutput(output),{valid:true,codes:[]});
    output.provenance.evidenceRefs.find((item)=>item.id===evidenceRecord.id).revision=1;
    reject(output,"UNKNOWN_EVIDENCE_REVISION");
  } finally {evidenceRecord.revision=originalEvidenceRevision;assumptionRecord.revision=originalAssumptionRevision;}
});
test("B5: confidence cannot hide research or overstate unknown/unversioned input support",()=>{
  const output=clone(baseline());output.confidence="HIGH";output.confidenceAssessment.level="HIGH";reject(output,"CONFIDENCE_EXCEEDS_SUPPORT");
  const hidden=clone(evaluateReference(createContext({"flags.hasHighCostDebt":flag(true),"flags.hasMinimumViableLiquidityGap":flag(false),"flags.hasUnknownDebtCost":flag(false)})));hidden.confidenceAssessment.reasonCodes=hidden.confidenceAssessment.reasonCodes.filter((reason)=>!reason.startsWith("RESEARCH_REQUIRED:"));reject(hidden,"HIDDEN_RESEARCH_REQUIRED_ASSUMPTION");
});
test("B5: user-reported done is not verified completion and static model evidence is not fulfillment proof",()=>{
  const output=clone(baseline());output.mainQuest.status="USER_REPORTED_DONE";
  assert.equal(validateDecisionOutput(output).valid,true);
  output.mainQuest.status="VERIFIED_DONE";output.mainQuest.verification.verifiedBy="USER";reject(output,"MISSION_COMPLETION_NOT_VERIFIED");
  for(const verifiedBy of ["SYSTEM","EXTERNAL_SOURCE"]){
    output.mainQuest.verification.verifiedBy=verifiedBy;
    output.mainQuest.verification.evidenceRefs=["EV-001"];
    reject(output,"MISSION_COMPLETION_NOT_VERIFIED");
  }
});
test("B5: narrative code labels, missing-data narratives and unsupported options cannot be invented",()=>{
  const tests=[
    [(o)=>o.mainQuest.actionCode="GUARANTEED_PROFIT","MISSION_EXPLANATION_CODE_MISMATCH"],
    [(o)=>o.mainQuest.whyCode="WHY_GUARANTEED_PROFIT","MISSION_EXPLANATION_CODE_MISMATCH"],
    [(o)=>o.mainQuest.impactCode="IMPACT_GUARANTEED_PROFIT","MISSION_EXPLANATION_CODE_MISMATCH"],
    [(o)=>o.metrics[0].labelCode="PROFIT_FORECAST","METRIC_LABEL_CODE_MISMATCH"],
    [(o)=>o.missingInformation.push({code:"INVEST_ALL_SAVINGS",params:{}}),"UNSUPPORTED_MISSING_INFORMATION"],
    [(o)=>o.options=[{id:"fake",code:"BUY_UNKNOWN_ASSET",params:{},consequenceCode:"GUARANTEED_RETURN",consequenceParams:{},provenance:clone(o.mainQuest.provenance)}],"UNSUPPORTED_RULE_OPTION"],
    [(o)=>{o.mainQuest.provenance.modelRefs=o.mainQuest.provenance.modelRefs.filter((ref)=>ref.id!=="mission_v1");o.mainQuest.confidence.modelRefs=clone(o.mainQuest.provenance.modelRefs);},"MISSING_MISSION_MODEL"],
  ];
  for(const [mutate,code]of tests){const output=clone(baseline());mutate(output);reject(output,code);}
});

test("B5: missing-information references must be registered, actually missing and semantically exact",()=>{
  for(const params of [{ref:"UNREGISTERED_INPUT"},{ref:"flags.hasDelinquentDebt"},{ref:"metrics.netMonthlyIncome",inventedOutput:1000}]){
    const output=clone(baseline());output.missingInformation.push({code:"MISSING_VALUE_REF",params});reject(output,"UNSUPPORTED_MISSING_INFORMATION");
  }
  const output=clone(baseline());output.missingInformation.push({code:"PRIORITY_CLAIM_COUNT_RECONCILIATION",params:{}});reject(output,"UNSUPPORTED_MISSING_INFORMATION");
});

test("B5: retained rule IDs cannot replace actual predicate inputs on any conclusion or aggregate",()=>{
  for(const select of [(o)=>o.findings[0],(o)=>o.primaryBottleneck,(o)=>o.mainQuest,(o)=>o]){
    const output=clone(baseline()),conclusion=select(output);
    conclusion.provenance.inputRefs=[];conclusion.provenance.metricRefs=[];conclusion.provenance.sourceInputRefs=[];
    if(conclusion.confidence&&typeof conclusion.confidence==="object")conclusion.confidence.inputRefs=[];
    if(conclusion===output)conclusion.confidenceAssessment.inputRefs=[];
    reject(output,"MISSING_RULE_INPUT_PROVENANCE");
  }
  const output=clone(evaluateReference(createContext()));
  output.mainQuest.provenance.inputRefs=[];output.mainQuest.provenance.metricRefs=[];output.mainQuest.provenance.sourceInputRefs=[];output.mainQuest.confidence.inputRefs=[];
  reject(output,"MISSING_RULE_INPUT_PROVENANCE");
});

test("B5: finding and bottleneck predicate support retains transitive metrics and actual raw inputs",()=>{
  const baseline=clone(normalizedBaseline());
  assert.deepEqual(validateDecisionOutput(baseline),{valid:true,codes:[]});
  for(const select of [(o)=>o.findings.find((finding)=>finding.code==="HIGH_COST_DEBT"),(o)=>o.primaryBottleneck]){
    const missingDependency=clone(baseline),conclusion=select(missingDependency);
    assert.ok(conclusion.provenance.inputRefs.includes("metrics.coreMonthlyOutflow"));
    conclusion.provenance.inputRefs=conclusion.provenance.inputRefs.filter((ref)=>ref!=="metrics.coreMonthlyOutflow");
    conclusion.provenance.metricRefs=conclusion.provenance.metricRefs.filter((ref)=>ref!=="metrics.coreMonthlyOutflow");
    if(conclusion.confidence)conclusion.confidence.inputRefs=clone(conclusion.provenance.inputRefs);
    reject(missingDependency,"MISSING_DEPENDENCY_PROVENANCE");
    const missingSource=clone(baseline),sourceConclusion=select(missingSource);
    assert.ok(sourceConclusion.provenance.sourceInputRefs.includes("expenses.necessaryMonthly"));
    sourceConclusion.provenance.sourceInputRefs=sourceConclusion.provenance.sourceInputRefs.filter((ref)=>ref!=="expenses.necessaryMonthly");
    reject(missingSource,"MISSING_RAW_INPUT_LINEAGE");
  }
});

test("B5: an independent delinquency action cannot hide unknown required data by deleting its side Discover",()=>{
  const baseline=clone(normalizedBaseline((profile)=>{
    profile.liabilities[0].delinquencyStatus="DELINQUENT";
    profile.liabilities[0].apr=unknown("NOT_REPORTED");
    profile.liabilities[0].costClassification=unknown("NOT_CLASSIFIED");
  }));
  assert.deepEqual(validateDecisionOutput(baseline),{valid:true,codes:[]});
  assert.equal(baseline.mainQuest.code,"RESOLVE_DELINQUENCY");
  assert.ok(baseline.sideMissions.some((mission)=>mission.code==="CONFIRM_DEBT_COST"));
  assert.ok(baseline.missingInformation.some((item)=>item.code==="DEBT_COST_CLASSIFICATION"));
  assert.ok(baseline.missingInformation.some((item)=>item.code==="MISSING_VALUE_REF"));
  const withoutMatchedEffect=clone(baseline);
  withoutMatchedEffect.missingInformation=withoutMatchedEffect.missingInformation.filter((item)=>item.code!=="DEBT_COST_CLASSIFICATION");
  reject(withoutMatchedEffect,"OMITTED_RULE_MISSING_INFORMATION");
  const withoutUnknownRef=clone(baseline);
  withoutUnknownRef.missingInformation=withoutUnknownRef.missingInformation.filter((item)=>item.code!=="MISSING_VALUE_REF");
  withoutUnknownRef.sideMissions=[];
  reject(withoutUnknownRef,"UNEXPOSED_REQUIRED_UNKNOWN_INPUT");
  const withoutAllDisclosure=clone(baseline);
  withoutAllDisclosure.missingInformation=[];withoutAllDisclosure.sideMissions=[];
  reject(withoutAllDisclosure,"OMITTED_RULE_MISSING_INFORMATION");
  reject(withoutAllDisclosure,"UNEXPOSED_REQUIRED_UNKNOWN_INPUT");
  const withoutSideDiscovery=clone(baseline);
  withoutSideDiscovery.sideMissions=withoutSideDiscovery.sideMissions.filter((mission)=>mission.code!=="CONFIRM_DEBT_COST");
  reject(withoutSideDiscovery,"OMITTED_REQUIRED_SIDE_DISCOVERY");
});

test("B5: a supported lower-priority mission cannot replace the resolved critical main mission",()=>{
  const output=clone(normalizedBaseline((profile)=>{profile.liabilities[0].delinquencyStatus="DELINQUENT";}));
  const lowerPriority=clone(normalizedBaseline());
  assert.deepEqual(validateDecisionOutput(output),{valid:true,codes:[]});
  assert.equal(output.mainQuest.code,"RESOLVE_DELINQUENCY");
  assert.equal(lowerPriority.mainQuest.code,"REDUCE_HIGH_COST_DEBT");
  assert.ok(output.ruleIds.includes("R-002")&&output.ruleIds.includes("R-006"));
  // Preserve both legitimate rule references, predicate truth and findings.
  // Local support for R-006 cannot override the engine's R-002 resolution.
  output.mainQuest=lowerPriority.mainQuest;
  reject(output,"MAIN_MISSION_PRIORITY_MISMATCH");
});

test("B5: a locally supported lower-priority bottleneck cannot replace the resolved critical decision",()=>{
  const baseline=clone(normalizedBaseline((profile)=>{profile.liabilities[0].delinquencyStatus="DELINQUENT";}));
  const lowerPriority=clone(normalizedBaseline());
  for(const replaceStage of [false,true]){
    const output=clone(baseline);
    output.primaryBottleneck=lowerPriority.primaryBottleneck;
    if(replaceStage)output.currentStage=lowerPriority.currentStage;
    reject(output,"PRIMARY_DECISION_PRIORITY_MISMATCH");
  }
});

test("B5: aggregate provenance cannot hide a matched rule and its research support behind the primary mission",()=>{
  const output=clone(evaluateReference(createContext({"flags.hasDelinquentDebt":flag(true),"flags.hasHighCostDebt":flag(true),"flags.hasMinimumViableLiquidityGap":flag(false),"flags.hasUnknownDebtCost":flag(false)})));
  assert.deepEqual(validateDecisionOutput(output),{valid:true,codes:[]});
  assert.deepEqual(output.ruleIds,["R-002","R-006"]);
  output.provenance=clone(output.mainQuest.provenance);
  output.ruleRefs=clone(output.provenance.ruleRefs);
  output.ruleIds=output.ruleRefs.map((ref)=>ref.id);
  output.modelVersions=clone(output.provenance.modelRefs);
  output.assumptions=clone(output.provenance.assumptionRefs);
  output.assumptionIds=output.assumptions.map((ref)=>ref.id);
  output.evidenceIds=output.provenance.evidenceRefs.map((ref)=>ref.id);
  output.confidenceAssessment.inputRefs=clone(output.provenance.inputRefs);
  output.confidenceAssessment.modelRefs=clone(output.provenance.modelRefs);
  output.confidenceAssessment.assumptionRefs=clone(output.provenance.assumptionRefs);
  // Consistent aliases alone cannot certify a truncated executed-support chain.
  reject(output,"INCOMPLETE_AGGREGATE_PROVENANCE");
  reject(output,"EXECUTED_RULE_PROVENANCE_MISMATCH");
  output.findings=output.findings.filter((finding)=>!finding.provenance.ruleRefs.some((ref)=>ref.id==="R-006"));
  output.explanationRefs=output.findings.map(({code,params})=>({code,params}));
  reject(output,"EXECUTED_RULE_PROVENANCE_MISMATCH");
});
