import assert from "node:assert/strict";
import test from "node:test";
import * as api from "../lib/money-model/index.ts";
import { normalizeProfile } from "../lib/money-model/runtime/profile-normalizer.ts";
import { validateDecisionOutput } from "../lib/money-model/runtime/output-validator.ts";
import { validateResourceLineage, validateResourceClaimCompatibility } from "../lib/money-model/runtime/resource-validator.ts";
import { validateClaims, deriveFundingStatus } from "../lib/money-model/runtime/claim-validator.ts";
import { evaluateCondition, validateCondition } from "../lib/money-model/runtime/predicate-evaluator.ts";
import { assumptions } from "../docs/money-model/registries/assumptions.ts";
import { evidence } from "../docs/money-model/registries/evidence.ts";
import { goldenCase, goldenExpected, point, missing, asOf } from "./money-os/fixtures/golden-cases.ts";

const analyze=({profile,options},bundle=api.moneyModelV1Bundle)=>api.analyzeFinancialProfile(profile,options,bundle);
const success=fixture=>{const result=analyze(fixture);assert.equal(result.ok,true,JSON.stringify(result));return result;};
const metric=(output,id)=>output.metrics.find(m=>m.id==="metrics."+id).value;
const deepFreeze=v=>{if(v && typeof v==="object"){Object.values(v).forEach(deepFreeze);Object.freeze(v);}return v;};

for (const id of Object.keys(goldenExpected)) test("S01 golden "+id+": independent frozen UX expectations",()=>{
  const expected=goldenExpected[id];const {output,diagnostics}=success(goldenCase(id));
  for (const [name,value] of [["coreCashFlow",expected.core],["monthlySurplus",expected.surplus],["coreMonthlyOutflow",expected.outflow],["availableSafetyLiquidity30d",expected.liquidity],["netWorth",expected.netWorth]]) {
    const actual=metric(output,name);assert.equal(actual.status,"KNOWN");assert.equal(actual.data.value,value);
  }
  assert.equal(metric(output,"financialRunwayMonths").data.value,expected.liquidity/expected.outflow);
  assert.equal(output.currentStage,expected.stage);assert.equal(output.severity,expected.severity);
  assert.equal(output.mainQuest?.code??null,expected.main);assert.equal(output.primaryBottleneck?.code??null,expected.bottleneck);
  assert.deepEqual(diagnostics.matchedRuleIds,expected.rules);assert.equal(output.confidence,"LOW");
  assert.equal(validateDecisionOutput(output,api.moneyModelV1Bundle).valid,true);
});

test("S01: same explicit input is deterministic, pure and serialization-stable",()=>{
  const fixture=deepFreeze(goldenCase("B"));const before=JSON.stringify(fixture);
  const first=success(fixture);assert.deepEqual(success(fixture),first);assert.equal(JSON.stringify(fixture),before);
  assert.deepEqual(JSON.parse(JSON.stringify(first)),first);
  assert.equal(validateDecisionOutput(JSON.parse(JSON.stringify(first.output)),api.moneyModelV1Bundle).valid,true);
  assert.deepEqual(Object.keys(api).sort(),["analyzeFinancialProfile","moneyModelV1Bundle"]);
});

test("S01: UNKNOWN and N/A never become zero or fabricated false flags",()=>{
  for (const state of [missing(),missing("INVALID_EXTERNAL_OBSERVATION"),{status:"NOT_APPLICABLE",reasonCode:"NOT_AVAILABLE"}]) {
    const f=goldenCase("D");f.profile.income[0].averageMonthlyNetIncome=state;
    const {output,diagnostics}=success(f);
    assert.equal(metric(output,"netMonthlyIncome").status,"UNKNOWN");
    assert.equal(metric(output,"coreCashFlow").status,"UNKNOWN");
    assert.equal(output.evaluation.inputStates["flags.hasNegativeCoreCashFlow"].status,"UNKNOWN");
    assert.ok(diagnostics.categories.includes("MISSING_REQUIRED_INFORMATION"));
    assert.equal(output.mainQuest.type,"DISCOVER");
  }
});

test("S01: unknown APR remains Discover even after APR alone becomes known",()=>{
  const f=goldenCase("C");const first=success(f);
  assert.equal(first.output.mainQuest.code,"CONFIRM_DEBT_COST");assert.equal(first.output.mainQuest.type,"DISCOVER");
  f.profile.liabilities[0].apr=point(5);
  const second=success(f);assert.equal(second.output.mainQuest.code,"CONFIRM_DEBT_COST");
  assert.equal(second.output.evaluation.inputStates["flags.hasHighCostDebt"].status,"UNKNOWN");
  assert.ok(!second.output.findings.some(item=>item.code==="HIGH_COST_DEBT"));
});

test("S01: qualified high-cost fixture exposes AS-001 baseline, research and LOW cap",()=>{
  const {output,diagnostics}=success(goldenCase("B"));
  assert.equal(output.evaluation.configValues["config.minimumViableLiquidityMonths"],1);
  assert.ok(output.mainQuest.provenance.assumptionRefs.some(a=>a.id==="AS-001" && a.revision===1));
  assert.ok(output.mainQuest.confidence.reasonCodes.includes("RESEARCH_REQUIRED:AS-001"));
  assert.equal(diagnostics.bundle.configVersion,"AS-001-revision-1-baseline-1");
});

test("S01: double-counted economic resource triggers the frozen critical correction projection",()=>{
  const f=goldenCase("A");f.options.resources.push({...f.options.resources[0],id:"duplicate-view"});
  assert.equal(validateResourceLineage(f.profile.assets,f.options.resources,[],{asOf}).valid,false);
  const {output,diagnostics}=success(f);
  assert.deepEqual(diagnostics.matchedRuleIds,["R-008"]);assert.equal(diagnostics.halted,true);
  assert.equal(output.primaryBottleneck.code,"CAPITAL_ASSIGNMENT_CONFLICT");
  assert.equal(output.mainQuest,null);assert.equal(output.currentStage,null);assert.equal(output.severity,"HIGH");
  assert.ok(diagnostics.categories.includes("CONTRADICTORY_STATE"));
});

test("S01: assignment exceeding underlying asset cannot certify present cash",()=>{
  const f=goldenCase("D");f.options.assignments=[{id:"use",assetId:"cash",purpose:"SAFETY",amount:point(100001)}];
  const result=success(f);assert.deepEqual(result.diagnostics.matchedRuleIds,["R-008"]);
  assert.equal(metric(result.output,"availableSafetyLiquidity30d").status,"UNKNOWN");
});

test("S01: reserved capital is subtracted once and cash is not created",()=>{
  const f=goldenCase("D");f.options.assignments=[{id:"goal-use",assetId:"cash",purpose:"GOAL",amount:point(20000)}];
  const {output}=success(f);assert.equal(metric(output,"availableSafetyLiquidity30d").data.value,80000);
  assert.equal(metric(output,"netWorth").data.value,100000);
});

test("S01: future income, external support and credit cannot become present owned cash",()=>{
  for (const [type,ownership] of [["FUTURE_INCOME","SOLE"],["EXTERNAL_SUPPORT","EXTERNAL"],["CREDIT_AVAILABILITY","EXTERNAL"]]) {
    const f=goldenCase("D");const resource={...f.options.resources[0],id:type,type,ownership,amount:point(900000),certainty:"LOW"};
    delete resource.underlyingAssetId;
    if (type==="FUTURE_INCOME") resource.underlyingIncomeId="salary";
    f.options.resources.push(resource);
    const {output}=success(f);assert.equal(metric(output,"availableSafetyLiquidity30d").data.value,100000);
    assert.equal(metric(output,"netWorth").data.value,100000);
  }
});

test("S01: unknown claim amount has UNKNOWN funding, not a ratio or zero",()=>{
  const f=goldenCase("F");const claim=f.options.claims[0];claim.amount=missing();claim.fundingStatus="UNKNOWN";
  assert.equal(deriveFundingStatus(claim),"UNKNOWN");assert.equal(validateClaims([claim]).valid,true);
  const {output}=success(f);assert.equal(metric(output,"totalGoalClaims").status,"UNKNOWN");
  assert.equal(output.evaluation.inputStates["flags.hasGoalFundingClaim"].status,"UNKNOWN");
});

test("S01: invalid claim funding returns invariant error, never a plausible decision",()=>{
  const f=goldenCase("A");f.options.claims[0].fundingStatus="FUNDED";
  const result=analyze(f);assert.equal(result.ok,false);assert.equal(result.error.category,"DOMAIN_INVARIANT_VIOLATION");
  assert.equal(result.error.safeCode,"INVALID_CLAIM_STATE");assert.ok(!("output" in result));
  assert.ok(result.error.fieldRefs.includes("FUNDING_STATUS_AMOUNT_MISMATCH"));
});

test("S01: FUNDED never implies FULFILLED or verified mission completion",()=>{
  const f=goldenCase("B");const claim=f.options.claims[0];claim.fundedAmount=point(30000);claim.fundingStatus="FUNDED";
  success(f);assert.equal(claim.lifecycleStatus,"ACTIVE");
  const {output}=success(goldenCase("A"));assert.equal(output.mainQuest.status,"TODO");
  assert.equal(output.mainQuest.verification.type,"STATE_RECALCULATION");
});

test("S01: contradictory cash flow blocks only supported downstream conclusions",()=>{
  const f=goldenCase("D");f.profile.reportedMonthlySavings=point(50000);
  const {output,diagnostics}=success(f);assert.ok(diagnostics.matchedRuleIds.includes("R-015"));
  assert.equal(output.mainQuest.code,"RECONCILE_CASH_FLOW_INPUTS");
  assert.ok(diagnostics.categories.includes("CONTRADICTORY_STATE"));
  assert.equal(metric(output,"netWorth").data.value,100000);
});

test("S01: independent delinquency repair outranks missing debt-cost discovery",()=>{
  const f=goldenCase("C");f.profile.liabilities[0].delinquencyStatus="DELINQUENT";
  const {output,diagnostics}=success(f);assert.equal(output.mainQuest.code,"RESOLVE_DELINQUENCY");
  assert.equal(output.currentStage,"SURVIVAL");assert.equal(output.severity,"CRITICAL");
  assert.deepEqual(diagnostics.matchedRuleIds,["R-002","R-006"]);
  assert.ok(output.sideMissions.some(m=>m.code==="CONFIRM_DEBT_COST"));assert.ok(output.sideMissions.length<=3);
});

test("S01: research slots stay UNKNOWN; income or house target does not manufacture a mission",()=>{
  for (const id of ["E","F"]) {
    const {output}=success(goldenCase(id));assert.equal(output.mainQuest,null);assert.equal(output.currentStage,null);
    for (const name of ["sustainableGoalCapital","longTermInvestableCapital"]) assert.equal(metric(output,name).status,"UNKNOWN");
    assert.equal(output.evaluation.inputStates["flags.hasGoalConflict"].status,"UNKNOWN");
    assert.equal(output.options.length,0);
  }
});

test("S01: complete provenance retains rule/version, raw inputs, dependencies and finding links",()=>{
  const {output}=success(goldenCase("A"));const p=output.mainQuest.provenance;
  assert.deepEqual(p.ruleRefs,[{id:"R-003",version:"1.1.0"}]);assert.ok(p.findingIds.length);
  assert.ok(p.modelRefs.some(m=>m.id==="cash_flow_v1" && m.version==="1.1.0"));
  assert.ok(p.inputRefs.includes("metrics.netMonthlyIncome"));assert.ok(p.sourceInputRefs.includes("income.salary.averageMonthlyNetIncome"));
  assert.ok(p.evidenceRefs.some(e=>e.id==="EV-003" && e.revision===1));
  assert.equal(output.decisionOutputVersion,"1.0");assert.equal(output.evaluation.schemaVersion,"1.0.0");
  assert.equal(output.evaluation.snapshotId,"golden-A");assert.equal(output.evaluation.evaluatedAt,asOf);
  assert.ok(!/[\u3400-\u9fff]/u.test(JSON.stringify(output)),"Output is semantic, not zh-TW display copy");
});

test("S01: provenance forgeries and verified completion are rejected at output boundary",()=>{
  const {output}=success(goldenCase("A"));
  for (const mutate of [o=>{o.mainQuest.provenance.ruleRefs[0].version="9";},o=>{o.mainQuest.provenance.sourceInputRefs=[];},o=>{o.mainQuest.status="VERIFIED_DONE";},o=>{o.evaluation.configValues["config.minimumViableLiquidityMonths"]=2;}]) {
    const forged=structuredClone(output);mutate(forged);assert.equal(validateDecisionOutput(forged,api.moneyModelV1Bundle).valid,false);
  }
});

test("S01: registered bundle is deep-frozen and copied/changed/missing bundles never fall back",()=>{
  const bundle=api.moneyModelV1Bundle;assert.ok(Object.isFrozen(bundle));assert.ok(Object.isFrozen(bundle.rules[0].condition));
  assert.throws(()=>{bundle.config.minimumViableLiquidityMonths.value=2;},TypeError);
  assert.throws(()=>{bundle.models[0].version="9";},TypeError);
  for (const invalid of [undefined,null,{...bundle},{...bundle,config:{minimumViableLiquidityMonths:{...bundle.config.minimumViableLiquidityMonths,value:2}}}]) {
    const f=goldenCase("D");const result=api.analyzeFinancialProfile(f.profile,f.options,invalid);
    assert.equal(result.ok,false);assert.equal(result.error.category,"UNSUPPORTED_MODEL_VERSION");
  }
});

test("S01: malformed dates/enums/liabilities/obligations and injected flags fail safely",()=>{
  for (const mutate of [f=>{f.options.asOf="2026-02-30";},f=>{f.options.complete.assets="true";},f=>{f.profile.liabilities=[{id:"x",type:"UNSUPPORTED",secured:false,delinquencyStatus:"CURRENT"}];},f=>{f.profile.obligations=[{id:"x",name:"x",required:"true",reservedAmount:point(0)}];},f=>{f.profile.flags={hasHighCostDebt:true};},f=>{f.options.overrides={"flags.hasHighCostDebt":point(true)};},f=>{f.profile.income[0].averageMonthlyNetIncome=point("30000");},f=>{f.profile.income[0].averageMonthlyNetIncome=point(Infinity);}]) {
    const f=goldenCase("D");mutate(f);const result=analyze(f);
    assert.equal(result.ok,false);assert.equal(result.error.category,"VALIDATION_ERROR");assert.equal(result.error.safeCode,"INVALID_DOMAIN_INPUT");
  }
});

test("S01: cycles, accessors, functions, oversized/deep data are bounded before execution",()=>{
  const cycle=goldenCase("D");cycle.profile.household.cycle=cycle.profile;
  const getter=goldenCase("D");Object.defineProperty(getter.profile,"income",{get(){throw new Error("must not run");},enumerable:true});
  const fn=goldenCase("D");fn.profile.household.bad=()=>0;
  const deep=goldenCase("D");let v=deep.profile.household;for(let i=0;i<70;i++){v.extra={};v=v.extra;}
  const large=goldenCase("D");large.profile.household.extra=Array(50001).fill(0);
  const sparse=goldenCase("D");sparse.profile.income.length=2;
  const subclass=goldenCase("D");class ForeignArray extends Array {} subclass.profile.income=new ForeignArray(...subclass.profile.income);
  for (const f of [cycle,getter,fn,deep,large,sparse,subclass]) {const result=analyze(f);assert.equal(result.ok,false);assert.equal(result.error.category,"VALIDATION_ERROR");}
});

test("S01: typed DSL rejects invalid ValueRefs/type/unit rather than executable strings",()=>{
  const eq=(left,value)=>({kind:"comparison",left,operator:"EQ",right:{kind:"literal",value}});
  assert.equal(validateCondition(eq("metrics.notRegistered",0)).valid,false);
  assert.equal(validateCondition(eq("flags.hasHighCostDebt",1)).valid,false);
  assert.equal(validateCondition({kind:"comparison",left:"metrics.coreCashFlow",operator:"EQ",right:{kind:"ref",ref:"metrics.financialRunwayMonths"}}).valid,false);
  const f=goldenCase("D");const normalized=normalizeProfile(f.profile,f.options,api.moneyModelV1Bundle);
  assert.equal(evaluateCondition(eq("flags.hasGoalConflict",false),normalized.context),"UNKNOWN");
});

test("S01: restricted and future resources do not certify claim funding",()=>{
  const f=goldenCase("A");const claim=f.options.claims[0];const resource=f.options.resources[0];
  assert.equal(validateResourceClaimCompatibility({...resource,availability:"RESTRICTED",restriction:{reasonCode:"LOCK",allowsCurrentFunding:false}},claim,asOf).valid,false);
  assert.equal(validateResourceClaimCompatibility({...resource,availableFrom:point("2027-10-02")},claim,asOf).valid,false);
});

test("S01: unconfirmed structural basis is missing information, never a zero or runtime fault",()=>{
  for (const key of ["primaryCurrencyConfirmed","netMonthlyBasisConfirmed","stockAsOfConfirmed"]) {
    const f=goldenCase("D");f.options[key]=false;const result=analyze(f);
    assert.equal(result.ok,false);assert.equal(result.error.category,"MISSING_REQUIRED_INFORMATION");
    assert.equal(result.error.safeCode,"ANALYSIS_BASIS_NOT_CONFIRMED");assert.deepEqual(result.error.fieldRefs,["basis."+key]);
    assert.ok(!("output" in result));
  }
});

test("S01: production artifact does not follow mutable historical revision probes",()=>{
  const before=success(goldenCase("B"));const a=assumptions.find(v=>v.id==="AS-001"),e=evidence.find(v=>v.id==="EV-005");
  const oldA=a.revision,oldE=e.revision;
  try {a.revision=3;e.revision=2;assert.deepEqual(success(goldenCase("B")),before);}
  finally {a.revision=oldA;e.revision=oldE;}
});

test("S01: returned output cannot mutate caller inputs through shared DataPoints",()=>{
  const f=goldenCase("A");const {output}=success(f);
  metric(output,"netMonthlyIncome").data.value=9999;
  output.mainQuest.requiredKnownInputs.push("flags.hasGoalConflict");
  assert.equal(f.profile.income[0].averageMonthlyNetIncome.data.value,30000);
  assert.equal(metric(success(f).output,"netMonthlyIncome").data.value,30000);
  assert.ok(!api.moneyModelV1Bundle.rules.find(r=>r.id==="R-003").requiredKnownInputs.includes("flags.hasGoalConflict"));
});

test("S01: unexpected host object failure is a controlled internal fault without stack or input values",()=>{
  const f=goldenCase("D");f.profile=new Proxy(f.profile,{ownKeys(){throw new Error("private-data");}});
  const result=analyze(f);assert.equal(result.ok,false);assert.equal(result.error.category,"INTERNAL_ERROR");
  assert.equal(result.error.safeCode,"DOMAIN_RUNTIME_FAULT");assert.ok(!JSON.stringify(result).includes("private-data"));
});

test("S01: impossible resource amounts and malformed claim origins are invalid rather than incomplete",()=>{
  for (const mutate of [f=>{f.options.resources[0].amount=point(-1);},f=>{f.options.resources[0].availableFrom=point("2026-02-30");},f=>{f.options.claims[0].origin.type="FAKE";},f=>{f.options.claims[0].fundedAmount=point(-1);}]) {
    const f=goldenCase("A");mutate(f);const result=analyze(f);
    assert.equal(result.ok,false);assert.equal(result.error.category,"VALIDATION_ERROR");
  }
});
