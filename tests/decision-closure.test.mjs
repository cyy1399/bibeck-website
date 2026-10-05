import assert from "node:assert/strict";
import test from "node:test";
import { evaluateReference } from "../docs/money-model/reference/reference-evaluator.ts";
import { createContext, flag, scalar } from "../docs/money-model/reference/context-builder.ts";
import { normalizeProfile } from "../docs/money-model/reference/profile-normalizer.ts";
import { validateDecisionOutput } from "../docs/money-model/reference/output-validator.ts";
import { known, unknown, notApplicable } from "../docs/money-model/schemas/domain-value.schema.ts";
const dp=value=>({value,source:"USER_REPORTED",updatedAt:"2026-10-01"});
const profile=()=>({profile:{primaryCurrency:"TWD",country:"TW"},income:[{id:"salary",type:"SALARY",averageMonthlyNetIncome:dp(60000),stability:"HIGH"}],expenses:{necessaryMonthly:dp(20000),discretionaryMonthly:dp(10000),otherMonthlyRequired:dp(0),aggregatesExcludeDebtAndObligations:true},assets:[{id:"cash",type:"CASH",currentValue:dp(100000),ownership:"SOLE",liquidity:"IMMEDIATE",purpose:"UNASSIGNED"}],liabilities:[],obligations:[],goals:[],household:{dependents:dp(0),externalSupportAvailable:dp(false)}});
const options=()=>({snapshotId:"closure-snapshot",asOf:"2026-10-01",monthlyPeriodId:"2026-10",primaryCurrencyConfirmed:true,netMonthlyBasisConfirmed:true,stockAsOfConfirmed:true,approvedMonthlyIncomeIds:["salary"],complete:{income:true,expenses:true,assets:true,liabilities:true,obligations:true,goals:true,resources:true,assignments:true,claims:true},resources:[{id:"cash-resource",type:"CURRENT_CASH",amount:known(100000),underlyingAssetId:"cash",ownership:"SOLE",availability:"AVAILABLE",liquidity:"IMMEDIATE",valuationStatus:"KNOWN",purpose:"UNASSIGNED",availableFrom:known("2026-10-01"),reservedForClaimIds:[],source:"USER_REPORTED",certainty:"HIGH"}],assignments:[],claims:[]});
const decision=(p=profile(),opts=options())=>{const normalized=normalizeProfile(p,opts);return {normalized,output:evaluateReference(normalized.context,undefined,normalized.metadata)};};
test("B1 all unknown remains Discover, not a confident financial conclusion",()=>{
  const out=evaluateReference(createContext());
  assert.equal(out.mainQuest.type,"DISCOVER");
  assert.equal(out.confidence,"LOW");
  assert.equal(out.modelConfidence,"LOW");
  assert.ok(out.missingInformation.some(ref=>ref.params.ref==="flags.hasDelinquentDebt"));
  assert.equal(validateDecisionOutput(JSON.parse(JSON.stringify(out))).valid,true);
});
test("B1 zero, unknown and not-applicable produce distinct guarded mission outcomes",()=>{
  for(const input of [unknown("NOT_REPORTED"),notApplicable("NOT_APPLICABLE")]) {
    const out=evaluateReference(createContext({"flags.hasDelinquentDebt":input}));
    assert.notEqual(out.mainQuest?.code,"RESOLVE_DELINQUENCY");
  }
  assert.notEqual(evaluateReference(createContext({"flags.hasDelinquentDebt":flag(false)})).mainQuest?.code,"RESOLVE_DELINQUENCY");
  assert.equal(evaluateReference(createContext({"flags.hasDelinquentDebt":flag(true)})).mainQuest.code,"RESOLVE_DELINQUENCY");
});
test("B1 critical candidate survives contradictory zero claim count with explicit reconciliation",()=>{
  const out=evaluateReference(createContext({"flags.hasDelinquentDebt":flag(true),"counts.unresolvedPriorityClaims":scalar(0)}));
  assert.equal(out.mainQuest.code,"RESOLVE_DELINQUENCY");
  assert.equal(out.currentStage,"SURVIVAL");
  assert.ok(out.blockers.some(ref=>ref.code==="STATE_CLAIM_COUNT_CONTRADICTION"));
  assert.ok(out.missingInformation.some(ref=>ref.code==="PRIORITY_CLAIM_COUNT_RECONCILIATION"));
});
test("B1 unknown APR blocks debt action while independently known delinquency survives",()=>{
  const p=profile();
  p.liabilities=[{id:"loan",type:"PERSONAL_LOAN",balance:dp(50000),apr:unknown("NOT_REPORTED"),minimumMonthlyPayment:dp(1000),economicPaymentId:"loan-minimum",secured:false,delinquencyStatus:"CURRENT"}];
  let result=decision(p);
  assert.equal(result.output.mainQuest.code,"CONFIRM_DEBT_COST");
  assert.equal(result.output.mainQuest.type,"DISCOVER");
  assert.ok(!result.output.findings.some(f=>f.code==="HIGH_COST_DEBT"));
  assert.ok(result.output.confidence!=="HIGH");
  p.liabilities[0].delinquencyStatus="DELINQUENT";
  p.income[0].averageMonthlyNetIncome=unknown("NOT_REPORTED");
  result=decision(p);
  assert.equal(result.output.mainQuest.code,"RESOLVE_DELINQUENCY");
  assert.ok(result.output.sideMissions.some(m=>m.code==="CONFIRM_DEBT_COST"));
  assert.ok(result.output.missingInformation.some(ref=>ref.params.ref==="flags.hasNegativeCoreCashFlow"));
  assert.deepEqual(validateDecisionOutput(JSON.parse(JSON.stringify(result.output))),{valid:true,codes:[]});
});
test("B1 known empty complete claims do not force a task or infer Optionality from unknown future models",()=>{
  const {normalized,output}=decision();
  assert.equal(normalized.context["flags.hasGoalConflict"].status,"UNKNOWN");
  assert.equal(output.mainQuest,null);
  assert.equal(output.currentStage,null);
  assert.equal(output.primaryBottleneck.code,"NO_UNRESOLVED_PRIORITY_CLAIM");
});
test("B5 complete normalized decision preserves raw input, metric, model and versioned assumption chain",()=>{
  const p=profile();
  p.liabilities=[{id:"loan",type:"PERSONAL_LOAN",balance:dp(50000),apr:dp(12),costClassification:known("HIGH_COST"),minimumMonthlyPayment:dp(1000),economicPaymentId:"loan-minimum",secured:false,delinquencyStatus:"CURRENT"}];
  const {output}=decision(p);
  assert.equal(output.mainQuest.code,"REDUCE_HIGH_COST_DEBT");
  assert.ok(output.mainQuest.provenance.inputRefs.includes("metrics.financialRunwayMonths"));
  assert.ok(output.mainQuest.provenance.metricRefs.includes("metrics.coreMonthlyOutflow"));
  assert.ok(output.mainQuest.provenance.sourceInputRefs.includes("expenses.necessaryMonthly"));
  assert.ok(output.metrics.find(metric=>metric.id==="metrics.netMonthlyIncome").provenance.sourceInputRefs.includes("income.salary.averageMonthlyNetIncome"));
  assert.ok(output.mainQuest.provenance.sourceInputRefs.includes("liabilities.loan.costClassification"));
  assert.ok(output.mainQuest.provenance.assumptionRefs.some(ref=>ref.id==="AS-001"&&ref.revision===1));
  assert.ok(output.confidenceAssessment.reasonCodes.includes("RESEARCH_REQUIRED:AS-001"));
  assert.equal(output.confidence,"LOW");
  assert.equal(output.evaluation.configValues["config.minimumViableLiquidityMonths"],1);
  assert.equal(validateDecisionOutput(JSON.parse(JSON.stringify(output))).valid,true);
  assert.deepEqual(decision(p).output,output);
});
