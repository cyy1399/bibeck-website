import assert from "node:assert/strict";
import test from "node:test";
import { validateCondition, validateContext, evaluateCondition, collectConditionRefs } from "../docs/money-model/reference/predicate-evaluator.ts";
import { createContext, scalar, flag } from "../docs/money-model/reference/context-builder.ts";
import { normalizeProfile } from "../docs/money-model/reference/profile-normalizer.ts";
import { known, unknown, notApplicable } from "../docs/money-model/schemas/domain-value.schema.ts";
import { valueRefRegistry } from "../docs/money-model/registries/value-refs.ts";
import { executableRules } from "../docs/money-model/registries/executable-rules.ts";
import { evaluateReference } from "../docs/money-model/reference/reference-evaluator.ts";
import { validateDecisionOutput } from "../docs/money-model/reference/output-validator.ts";
import { models } from "../docs/money-model/registries/models.ts";
import { readInput, validInputDate } from "../docs/money-model/reference/input-value.ts";
import { decimalSum, decimalProduct } from "../docs/money-model/reference/decimal-arithmetic.ts";

const dp=(value)=>({value,source:"VERIFIED",updatedAt:"2026-10-01"});
const comparison=(left,operator,right)=>({kind:"comparison",left,operator,right:{kind:"literal",value:right}});
const fixture=()=>{
  const profile={profile:{primaryCurrency:"TWD",country:"TW"},income:[{id:"salary",type:"SALARY",averageMonthlyNetIncome:dp(10000),stability:"HIGH"}],expenses:{components:[{id:"living",economicPaymentId:"living",category:"NECESSARY",timeBasis:"MONTHLY",amount:dp(3000)},{id:"debtExpense",economicPaymentId:"debtPayment",category:"OTHER_REQUIRED",timeBasis:"MONTHLY",amount:dp(2000)},{id:"optional",economicPaymentId:"optional",category:"DISCRETIONARY",timeBasis:"MONTHLY",amount:dp(1000)}]},assets:[{id:"cash",type:"CASH",currentValue:dp(100000),ownership:"SOLE",liquidity:"IMMEDIATE",purpose:"UNASSIGNED"}],liabilities:[{id:"loan",type:"PERSONAL_LOAN",balance:dp(40000),apr:dp(.05),costClassification:known("OTHER_COST"),economicPaymentId:"debtPayment",minimumMonthlyPayment:dp(2000),secured:false,delinquencyStatus:"CURRENT"}],obligations:[{id:"rent",name:"rent",economicPaymentId:"rentOccurrence",amount:dp(10000),dueDate:"2026-10-15",recurrence:"NONE",required:true,reservedAmount:dp(0)}],goals:[],household:{dependents:dp(0),externalSupportAvailable:dp(false)},reportedMonthlySavings:dp(4000)};
  const resources=[{id:"cashResource",type:"CURRENT_CASH",amount:known(100000),underlyingAssetId:"cash",ownership:"SOLE",availability:"AVAILABLE",liquidity:"IMMEDIATE",valuationStatus:"KNOWN",purpose:"UNASSIGNED",availableFrom:known("2026-10-01"),reservedForClaimIds:[],source:"VERIFIED",certainty:"HIGH"}];
  const options={snapshotId:"snapshot-1",asOf:"2026-10-01",monthlyPeriodId:"2026-09",primaryCurrencyConfirmed:true,netMonthlyBasisConfirmed:true,stockAsOfConfirmed:true,approvedMonthlyIncomeIds:["salary"],complete:{income:true,expenses:true,assets:true,liabilities:true,obligations:true,goals:true,resources:true,assignments:true,claims:true},resources,assignments:[],claims:[]};
  return {profile,options};
};
const amount=(result,ref)=>{assert.equal(result.context[ref].status,"KNOWN",JSON.stringify(result.context[ref]));return result.context[ref].data.value;};

test("decimal reference arithmetic uses exact canonical operands without epsilon or rounding policy",()=>{
  assert.equal(decimalSum([.1,.2]),.3);
  assert.equal(decimalSum([.3,-.1]),.2);
  assert.equal(decimalProduct(.3,.1),.03);
  assert.equal(decimalSum([1e-308,-1e-308]),0);
  assert.equal(decimalSum([]),0);
  assert.ok(Number.isNaN(decimalSum([1e16,.1])));
  assert.ok(!Number.isFinite(decimalSum([1e308,1e308])));
  assert.ok(Number.isNaN(decimalProduct(Infinity,0)));
});

test("decimal currency conservation cannot invent a negative zero cash flow or liquidity deficit",()=>{
  const {profile,options}=fixture();
  profile.income[0].averageMonthlyNetIncome=dp(.3);
  profile.expenses.components[0].amount=dp(.1);
  profile.expenses.components[1].amount=dp(.2);
  profile.expenses.components[2].amount=dp(0);
  profile.liabilities[0].minimumMonthlyPayment=dp(.2);
  profile.liabilities[0].balance=dp(.1);
  profile.assets[0].currentValue=dp(.3);
  options.resources[0].amount=known(.3);
  profile.obligations[0].amount=dp(.1);
  profile.reportedMonthlySavings=dp(0);
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"metrics.coreMonthlyOutflow"),.3);
  assert.equal(amount(result,"metrics.coreCashFlow"),0);
  assert.equal(amount(result,"metrics.monthlySurplus"),0);
  assert.equal(amount(result,"metrics.netWorth"),.2);
  assert.equal(amount(result,"metrics.availableSafetyLiquidity30d"),.2);
  assert.equal(amount(result,"flags.hasNegativeCoreCashFlow"),false);
  assert.equal(amount(result,"flags.hasCashFlowContradiction"),false);
});

test("unrepresentable decimal arithmetic stays UNKNOWN rather than silently rounding a conclusion",()=>{
  const {profile,options}=fixture();
  profile.income[0].averageMonthlyNetIncome=dp(1e16);
  profile.expenses.components[0].amount=dp(.1);
  profile.expenses.components[1].amount=dp(0);
  profile.liabilities[0].minimumMonthlyPayment=dp(0);
  profile.liabilities[0].delinquencyStatus="DELINQUENT";
  const result=normalizeProfile(profile,options);
  for (const ref of ["metrics.coreCashFlow","metrics.monthlySurplus","flags.hasNegativeCoreCashFlow"]) assert.equal(result.context[ref].status,"UNKNOWN",ref);
  assert.equal(evaluateReference(result.context,undefined,result.metadata).mainQuest.code,"RESOLVE_DELINQUENCY");
});

test("all executable predicate refs resolve through the closed declared registry",()=>{
  for (const rule of executableRules) {
    assert.equal(validateCondition(rule.condition).valid,true,rule.id);
    for (const ref of collectConditionRefs(rule.condition)) {
      const declaration=valueRefRegistry[ref];
      assert.equal(declaration.key,ref);
      assert.ok(declaration.unit && declaration.timeBasis && declaration.description);
      if (declaration.producerModel) assert.ok(models.some((model)=>model.id===declaration.producerModel));
    }
  }
});
for (const [description,node] of [
  ["unknown ref",comparison("metrics.notDeclared","EQ",0)],
  ["implicit traversal",comparison("metrics.coreCashFlow.value","EQ",0)],
  ["money versus enum",comparison("metrics.coreCashFlow","GT","HIGH")],
  ["months versus boolean",comparison("metrics.financialRunwayMonths","EQ",true)],
  ["boolean ordering",comparison("flags.hasDelinquentDebt","GT",false)],
  ["infinite literal",comparison("metrics.coreCashFlow","GT",Infinity)],
  ["NaN literal",comparison("metrics.coreCashFlow","EQ",NaN)],
  ["ratio versus currency",{kind:"comparison",left:"metrics.debtServiceRatio",operator:"LT",right:{kind:"ref",ref:"metrics.coreCashFlow"}}],
  ["different currency periods",{kind:"comparison",left:"metrics.netWorth",operator:"GT",right:{kind:"ref",ref:"metrics.coreCashFlow"}}],
  ["different liquidity horizons",{kind:"comparison",left:"metrics.availableSafetyLiquidity30d",operator:"LT",right:{kind:"ref",ref:"metrics.availableSafetyLiquidity90d"}}],
  ["undeclared AST field",{...comparison("metrics.coreCashFlow","GT",0),callback:"x"}],
  ["empty AND",{kind:"logical",operator:"AND",conditions:[]}],
]) test(`runtime predicate validator rejects ${description}`,()=>{
  assert.equal(validateCondition(node).valid,false);
  assert.throws(()=>evaluateCondition(node,createContext()));
});
test("compatible numeric refs use identical type units currency and monthly period",()=>{
  const node={kind:"comparison",left:"metrics.coreCashFlow",operator:"GT",right:{kind:"ref",ref:"metrics.monthlySurplus"}};
  assert.equal(validateCondition(node).valid,true);
  assert.equal(evaluateCondition(node,createContext({"metrics.coreCashFlow":scalar(10),"metrics.monthlySurplus":scalar(5)})),"TRUE");
});
test("runtime context rejects stale keys coercion nonfinite numbers bad signs and noninteger counts",()=>{
  for (const overrides of [{"metrics.stale":known(0)},{"metrics.coreCashFlow":known("2")},{"metrics.netMonthlyIncome":known(-1)},{"metrics.coreCashFlow":known(Infinity)},{"counts.unresolvedPriorityClaims":known(1.5)},{"flags.hasDelinquentDebt":known(1)},{"metrics.incomeConcentration":known(1.1)}]) assert.throws(()=>createContext(overrides));
  assert.equal(validateContext({"metrics.coreCashFlow":{status:"UNKNOWN"}},true).valid,false);
});
test("KNOWN zero UNKNOWN and NOT_APPLICABLE keep distinct three-valued evaluation",()=>{
  for (const [input,expected] of [[scalar(0),"TRUE"],[unknown("MISSING"),"UNKNOWN"],[notApplicable("NA"),"UNKNOWN"]]) {
    const context=createContext({"metrics.coreCashFlow":input});
    assert.equal(evaluateCondition(comparison("metrics.coreCashFlow","EQ",0),context),expected);
  }
  const context=createContext({"flags.hasDelinquentDebt":flag(false)});
  assert.equal(evaluateCondition({kind:"logical",operator:"AND",conditions:[comparison("flags.hasDelinquentDebt","EQ",true),comparison("metrics.coreCashFlow","LT",0)]},context),"FALSE");
});
test("core eight metrics normalize with exact debt-expense payment dedup and dated liquidity basis",()=>{
  const {profile,options}=fixture();
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"metrics.netMonthlyIncome"),10000);
  assert.equal(amount(result,"metrics.coreMonthlyOutflow"),5000);
  assert.equal(amount(result,"metrics.coreCashFlow"),5000);
  assert.equal(amount(result,"metrics.monthlySurplus"),4000);
  assert.equal(amount(result,"metrics.netWorth"),60000);
  assert.equal(amount(result,"metrics.availableSafetyLiquidity30d"),90000);
  assert.equal(amount(result,"metrics.financialRunwayMonths"),18);
  assert.equal(amount(result,"metrics.debtServiceRatio"),.2);
  assert.equal(amount(result,"metrics.requiredObligations30d"),10000);
  assert.equal(validateContext(result.context).valid,true);
  assert.ok(result.metadata.valueLineage["flags.hasNegativeCoreCashFlow"].includes("income.salary.averageMonthlyNetIncome"));
  assert.ok(result.metadata.valueLineage["flags.hasNegativeCoreCashFlow"].includes("liabilities.loan.minimumMonthlyPayment"));
  assert.equal(result.metadata.inputRecords["assets.cash.ownership"].value,"SOLE");
});
test("missing completeness attestation is not a zero income or empty claim discovery",()=>{
  const {profile,options}=fixture();
  options.complete.income=false; options.complete.claims=false;
  const result=normalizeProfile(profile,options);
  assert.equal(result.context["metrics.netMonthlyIncome"].status,"UNKNOWN");
  assert.equal(result.context["flags.hasZeroIncome"].status,"UNKNOWN");
  assert.equal(result.context["counts.unresolvedPriorityClaims"].status,"UNKNOWN");
});
test("unknown income and inapplicable required input propagate rather than zero-fill",()=>{
  for (const missing of [unknown("SALARY_UNKNOWN"),notApplicable("NO_VALUE")]) {
    const {profile,options}=fixture(); profile.income[0].averageMonthlyNetIncome=missing;
    const result=normalizeProfile(profile,options);
    for (const ref of ["metrics.netMonthlyIncome","metrics.coreCashFlow","metrics.monthlySurplus","metrics.debtServiceRatio"]) assert.equal(result.context[ref].status,"UNKNOWN");
    assert.equal(amount(result,"metrics.netWorth"),60000);
  }
});
test("a known independent delinquency remains known despite missing income",()=>{
  const {profile,options}=fixture();profile.income[0].averageMonthlyNetIncome=unknown("NOT_REPORTED");profile.liabilities[0].delinquencyStatus="DELINQUENT";
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"flags.hasDelinquentDebt"),true);
  assert.equal(result.context["metrics.netMonthlyIncome"].status,"UNKNOWN");
});
test("APR unknown never produces a high-cost debt classification",()=>{
  const {profile,options}=fixture();profile.liabilities[0].apr=unknown("APR_MISSING");profile.liabilities[0].costClassification=known("HIGH_COST");
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"flags.hasUnknownDebtCost"),true);
  assert.equal(result.context["flags.hasHighCostDebt"].status,"UNKNOWN");
});

test("future-dated debt classification cannot produce a financial repayment action",()=>{
  const {profile,options}=fixture();profile.liabilities[0].costClassification=known("HIGH_COST","2026-10-02");
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"flags.hasUnknownDebtCost"),true);
  assert.equal(result.context["flags.hasHighCostDebt"].status,"UNKNOWN");
  assert.equal(result.metadata.inputRecords["liabilities.loan.costClassification"].status,"UNKNOWN");
  const decision=evaluateReference(result.context,undefined,result.metadata);
  assert.equal(decision.mainQuest.code,"CONFIRM_DEBT_COST");
  assert.equal(decision.mainQuest.type,"DISCOVER");
});

test("invalid delinquency enums stay UNKNOWN while independently known delinquency survives",()=>{
  const {profile,options}=fixture();profile.liabilities[0].delinquencyStatus="MADE_UP";
  assert.equal(normalizeProfile(profile,options).context["flags.hasDelinquentDebt"].status,"UNKNOWN");
  profile.liabilities.push({...profile.liabilities[0],id:"delinquent",economicPaymentId:"delinquent",delinquencyStatus:"DELINQUENT"});
  assert.equal(amount(normalizeProfile(profile,options),"flags.hasDelinquentDebt"),true);
});

test("raw input dates require a real ISO calendar date and UNKNOWN cannot hide a value",()=>{
  for (const date of ["2026-02-30","2026-02-29","2026-04-31","2026-10-01T24:00:00Z","10/01/2026"]) {
    assert.equal(validInputDate(date),false,date);
    assert.equal(readInput({...dp(1),updatedAt:date}).status,"UNKNOWN");
  }
  for (const date of ["2024-02-29","2026-10-01","2026-10-01T12:30:00+08:00"]) assert.equal(validInputDate(date),true,date);
  for (const state of ["UNKNOWN","NOT_APPLICABLE"]) {
    const result=readInput({status:state,reasonCode:"MISSING",value:100});
    assert.equal(result.status,"UNKNOWN");assert.ok(!Object.hasOwn(result,"value"));
  }
  const {profile,options}=fixture();options.asOf="2026-02-30";
  assert.throws(()=>normalizeProfile(profile,options),/NORMALIZATION_REQUIRES_SNAPSHOT_AND_PERIOD/);
});

test("future-valued resources assignments and underlying assets cannot certify current liquidity",()=>{
  for (const mutate of [
    ({options})=>{options.resources[0].amount=known(100000,"2026-10-02");},
    ({options})=>{options.assignments=[{id:"future",assetId:"cash",purpose:"GOAL",amount:known(10000,"2026-10-02")}];},
    ({profile})=>{profile.assets[0].currentValue={...dp(100000),updatedAt:"2026-10-02"};},
  ]) {
    const data=fixture();mutate(data);
    const result=normalizeProfile(data.profile,data.options);
    assert.equal(result.context["metrics.availableSafetyLiquidity30d"].status,"UNKNOWN");
  }
});
test("unapproved irregular income and unsupported expense periodization remain research unknown",()=>{
  const {profile,options}=fixture();profile.income[0].type="FREELANCE";options.approvedMonthlyIncomeIds=[];
  profile.expenses.components[0].timeBasis="UNNORMALIZED";
  const result=normalizeProfile(profile,options);
  assert.equal(result.context["metrics.netMonthlyIncome"].status,"UNKNOWN");
  assert.equal(result.context["metrics.coreMonthlyOutflow"].status,"UNKNOWN");
  assert.equal(result.context["metrics.longTermInvestableCapital"].status,"UNKNOWN");
  assert.equal(result.context["metrics.sustainableGoalCapital"].status,"UNKNOWN");
});
test("conflicting duplicate payment amounts do not choose an arbitrary deduction",()=>{
  const {profile,options}=fixture();profile.expenses.components[1].amount=dp(2500);
  const result=normalizeProfile(profile,options);
  assert.equal(result.context["metrics.coreMonthlyOutflow"].status,"UNKNOWN");
  assert.equal(result.context["metrics.coreCashFlow"].status,"UNKNOWN");
});
test("unknown mixed currency or stock snapshot basis cannot certify core money outputs",()=>{
  const {profile,options}=fixture();options.primaryCurrencyConfirmed=false;options.stockAsOfConfirmed=false;
  const result=normalizeProfile(profile,options);
  for (const ref of ["metrics.netMonthlyIncome","metrics.coreMonthlyOutflow","metrics.netWorth","metrics.availableSafetyLiquidity30d"]) assert.equal(result.context[ref].status,"UNKNOWN");
});
test("zero denominators produce reasoned UNKNOWN not infinity",()=>{
  const {profile,options}=fixture();profile.income[0].averageMonthlyNetIncome=dp(0);
  let result=normalizeProfile(profile,options);
  assert.equal(amount(result,"flags.hasZeroIncome"),true);
  assert.equal(result.context["metrics.debtServiceRatio"].status,"UNKNOWN");
  profile.expenses.components=[];profile.liabilities=[];profile.obligations=[];
  result=normalizeProfile(profile,options);
  assert.equal(amount(result,"metrics.coreMonthlyOutflow"),0);
  assert.equal(result.context["metrics.financialRunwayMonths"].status,"UNKNOWN");
});
test("overflowing mandatory debt-payment sum is UNKNOWN rather than coerced into zero ratio",()=>{
  const {profile,options}=fixture();
  profile.liabilities=[{...profile.liabilities[0],id:"huge1",economicPaymentId:"huge1",minimumMonthlyPayment:dp(1e308)},{...profile.liabilities[0],id:"huge2",economicPaymentId:"huge2",minimumMonthlyPayment:dp(1e308)}];
  const result=normalizeProfile(profile,options);
  assert.equal(result.context["metrics.debtServiceRatio"].status,"UNKNOWN");
  assert.equal(result.context["metrics.coreMonthlyOutflow"].status,"UNKNOWN");
});
test("capital purposes do not create assets or duplicate safety capital",()=>{
  const {profile,options}=fixture();options.assignments=[{id:"goal",assetId:"cash",purpose:"GOAL",amount:known(10000)}];
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"metrics.netWorth"),60000);
  assert.equal(amount(result,"metrics.availableSafetyLiquidity30d"),80000);
  assert.equal(amount(result,"flags.hasReservedCapital"),true);
});
test("dated rent reservation is deducted once rather than as both reservation and full claim",()=>{
  const {profile,options}=fixture();profile.obligations[0].reservedAmount=dp(4000);
  options.assignments=[{id:"rentReservation",assetId:"cash",purpose:"OPERATING",amount:known(4000),claimId:"rent"}];
  options.claims=[{id:"rent",claimType:"IMMEDIATE_OBLIGATION",category:"HARD",amount:known(10000),dueDate:known("2026-10-15"),required:true,userPriority:"HIGH",urgency:"NEAR_TERM",severity:"HIGH",certainty:"HIGH",reversibility:"LOW",lifecycleStatus:"ACTIVE",fundedAmount:known(4000),fundingStatus:"PARTIALLY_FUNDED",eligibleResources:["cashResource"],stageImpact:"SURVIVAL",source:"VERIFIED",modelVersion:"1.0.0",origin:{type:"OBLIGATION",sourceId:"rent"},recurrence:"NONE",fulfillmentEffects:[{code:"REDUCE_CASH",amountSource:"CLAIM_AMOUNT",targetId:"cash"}]}];
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"metrics.requiredObligations30d"),10000);
  assert.equal(amount(result,"metrics.availableSafetyLiquidity30d"),90000);
  assert.equal(amount(result,"flags.hasReservedCapital"),true);
});
test("single dedicated goal resource is not silently counted as free safety liquidity",()=>{
  const {profile,options}=fixture();options.resources[0].purpose="GOAL";options.resources[0].type="GOAL_CAPITAL";
  options.assignments=[{id:"goal",assetId:"cash",purpose:"GOAL",amount:known(100000)}];
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"metrics.availableSafetyLiquidity30d"),-10000);
  assert.equal(amount(result,"metrics.netWorth"),60000);
});
test("joint ownership cannot be normalized as wholly owned cash or net worth",()=>{
  const {profile,options}=fixture();profile.assets[0].ownership="JOINT";
  const result=normalizeProfile(profile,options);
  assert.equal(result.context["metrics.netWorth"].status,"UNKNOWN");
  assert.equal(result.context["metrics.availableSafetyLiquidity30d"].status,"UNKNOWN");
});
test("duplicate current economic resources invalidate liquidity calculation",()=>{
  const {profile,options}=fixture();options.resources.push({...options.resources[0],id:"duplicate"});
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"flags.hasCapitalAssignmentConflict"),true);
  assert.equal(result.context["metrics.availableSafetyLiquidity30d"].status,"UNKNOWN");
});
test("future income is neither owned cash nor net worth and cannot fund the 30d metric",()=>{
  const {profile,options}=fixture();options.resources.push({id:"futureSalary",type:"FUTURE_INCOME",amount:known(10000),underlyingIncomeId:"salary",ownership:"SOLE",availability:"UNSETTLED",liquidity:"IMMEDIATE",valuationStatus:"KNOWN",purpose:"UNASSIGNED",availableFrom:known("2026-10-30"),reservedForClaimIds:[],source:"USER_REPORTED",certainty:"LOW"});
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"metrics.availableSafetyLiquidity30d"),90000);
  assert.equal(amount(result,"metrics.netWorth"),60000);
});
test("overdue or recurring obligation cannot disappear from liquidity as if settled",()=>{
  const {profile,options}=fixture();profile.obligations[0].recurrence="MONTHLY";
  const result=normalizeProfile(profile,options);
  assert.equal(result.context["metrics.availableSafetyLiquidity30d"].status,"UNKNOWN");
});
test("required overdue dated occurrence remains an obligation until fulfillment",()=>{
  const {profile,options}=fixture();profile.obligations[0].dueDate="2026-09-15";
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"metrics.requiredObligations30d"),10000);
  assert.equal(amount(result,"metrics.availableSafetyLiquidity30d"),90000);
});
test("unknown capital valuation is not a proved allocation conflict that suppresses delinquency",()=>{
  const {profile,options}=fixture();profile.assets[0].currentValue=unknown("VALUATION_MISSING");profile.liabilities[0].delinquencyStatus="DELINQUENT";
  const result=normalizeProfile(profile,options);
  assert.equal(result.context["flags.hasCapitalAssignmentConflict"].status,"UNKNOWN");
  const decision=evaluateReference(result.context,undefined,result.metadata);
  assert.equal(decision.mainQuest.code,"RESOLVE_DELINQUENCY");
  assert.ok(!decision.matchedRuleIds.includes("R-008"));
});
test("explicit no claims does not erase discovery when actual debt cost remains unknown",()=>{
  const {profile,options}=fixture();profile.liabilities[0].apr=unknown("APR_MISSING");
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"counts.unresolvedPriorityClaims"),0);
  const decision=evaluateReference(result.context,undefined,result.metadata);
  assert.equal(decision.mainQuest.code,"CONFIRM_DEBT_COST");
  assert.equal(decision.mainQuest.type,"DISCOVER");
  assert.equal(decision.confidence,"LOW");
  assert.ok(decision.missingInformation.some((item)=>item.code==="DEBT_COST_CLASSIFICATION"));
});
test("explicit empty claims and known no debt do not force a mission from unused research slots",()=>{
  const {profile,options}=fixture();profile.liabilities=[];
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"counts.unresolvedPriorityClaims"),0);
  assert.equal(amount(result,"flags.hasUnknownDebtCost"),false);
  assert.equal(result.context["flags.hasGoalConflict"].status,"UNKNOWN");
  assert.equal(result.context["flags.hasAllocationConflict"].status,"UNKNOWN");
  const decision=evaluateReference(result.context,undefined,result.metadata);
  assert.equal(decision.mainQuest,null);
  assert.ok(decision.matchedRuleIds.includes("R-014"));
  assert.equal(decision.currentStage,null);
});
test("normalization lineage contains every cited raw input including unsupported inputs",()=>{
  const {profile,options}=fixture();options.approvedMonthlyIncomeIds=[];
  const result=normalizeProfile(profile,options);
  for (const paths of Object.values(result.metadata.valueLineage)) for (const path of paths) assert.ok(result.metadata.inputRecords[path],path);
  assert.ok(result.metadata.valueLineage["metrics.monthlySurplus"].includes("expenses.components.optional.amount"));
  assert.ok(result.metadata.valueLineage["metrics.reportedMonthlySavings"].includes("reportedMonthlySavings"));
  assert.ok(result.metadata.valueLineage["flags.hasMinimumViableLiquidityGap"].includes("assumptions.AS-001.minimumViableLiquidityMonths"));
  assert.ok(result.metadata.valueDependencies["flags.hasMinimumViableLiquidityGap"].includes("config.minimumViableLiquidityMonths"));
});
test("complete normalized output retains real currency and validates its source provenance",()=>{
  const {profile,options}=fixture();
  const result=normalizeProfile(profile,options);
  const decision=evaluateReference(result.context,undefined,result.metadata);
  for (const metric of decision.metrics.filter((metric)=>metric.unit==="PRIMARY_CURRENCY")) assert.equal(metric.currency,"TWD");
  assert.deepEqual(validateDecisionOutput(decision),{valid:true,codes:[]});
});

test("debt service lineage records liability completeness for both known and unknown ratios",()=>{
  const {profile,options}=fixture();
  for (const complete of [true,false]) {
    options.complete.liabilities=complete;
    const result=normalizeProfile(profile,options);
    assert.equal(result.metadata.inputRecords["completeness.liabilities"].value,complete);
    assert.ok(result.metadata.valueLineage["metrics.debtServiceRatio"].includes("completeness.liabilities"));
    assert.equal(result.context["metrics.debtServiceRatio"].status,complete?"KNOWN":"UNKNOWN");
  }
});

test("liquidity and capital validation lineage records actual asset realization and classifications",()=>{
  const {profile,options}=fixture();
  profile.assets[0].type="STOCKS";
  profile.assets[0].availableEconomicValue={status:"KNOWN",data:dp(80000)};
  options.resources[0].type="SAFETY_CAPITAL";
  options.resources[0].amount={status:"KNOWN",data:dp(80000)};
  const result=normalizeProfile(profile,options);
  assert.equal(amount(result,"metrics.availableSafetyLiquidity30d"),70000);
  assert.equal(result.metadata.inputRecords["assets.cash.availableEconomicValue"].value,80000);
  assert.equal(result.metadata.inputRecords["assets.cash.availableEconomicValue"].source,"VERIFIED");
  for (const ref of ["metrics.availableSafetyLiquidity30d","metrics.availableSafetyLiquidity90d","metrics.availableSafetyLiquidity365d","flags.hasCapitalAssignmentConflict","flags.hasReservedCapital"]) {
    for (const key of ["type","ownership","liquidity","purpose","availableEconomicValue"]) assert.ok(result.metadata.valueLineage[ref].includes(`assets.cash.${key}`),`${ref}: ${key}`);
  }
});

test("unknown or future realization basis stays raw UNKNOWN rather than proved capital conflict",()=>{
  for (const mutate of [
    ({profile})=>{profile.assets[0].availableEconomicValue=known(100000,"2026-10-02");},
    ({profile})=>{profile.assets[0].availableEconomicValue=known(100000);profile.assets[0].currentValue=unknown("VALUATION_MISSING");},
    ({profile,options})=>{profile.assets[0].type="STOCKS";options.resources[0].type="SAFETY_CAPITAL";},
  ]) {
    const data=fixture();mutate(data);data.profile.liabilities[0].delinquencyStatus="DELINQUENT";
    const result=normalizeProfile(data.profile,data.options);
    assert.equal(result.context["metrics.availableSafetyLiquidity30d"].status,"UNKNOWN");
    assert.equal(result.context["flags.hasCapitalAssignmentConflict"].status,"UNKNOWN");
    assert.ok(result.metadata.valueLineage["metrics.availableSafetyLiquidity30d"].includes("assets.cash.availableEconomicValue"));
    if (data.profile.assets[0].currentValue.status !== "UNKNOWN") assert.equal(result.metadata.inputRecords["assets.cash.availableEconomicValue"].status,"UNKNOWN");
    assert.equal(evaluateReference(result.context,undefined,result.metadata).mainQuest.code,"RESOLVE_DELINQUENCY");
  }
});

test("consumed resource restrictions partitions reservations and expense categories retain scalar lineage",()=>{
  const {profile,options}=fixture();
  const resource=options.resources[0];
  resource.availability="RESTRICTED";
  resource.reservedForClaimIds=["rent"];
  resource.partitionAssignmentIds=["rentReservation"];
  resource.restriction={reasonCode:"RENT_ONLY",allowsCurrentFunding:true,allowedClaimIds:["rent"],allowedClaimTypes:["IMMEDIATE_OBLIGATION"]};
  resource.jointOwnership={ownedFraction:.5,allocationConsent:false};
  const result=normalizeProfile(profile,options);
  const expected={"resources.cashResource.reservedForClaimIds.length":1,"resources.cashResource.reservedForClaimIds.0":"rent","resources.cashResource.partitionAssignmentIds.0":"rentReservation","resources.cashResource.restriction.reasonCode":"RENT_ONLY","resources.cashResource.restriction.allowsCurrentFunding":true,"resources.cashResource.restriction.allowedClaimIds.0":"rent","resources.cashResource.restriction.allowedClaimTypes.0":"IMMEDIATE_OBLIGATION","resources.cashResource.jointOwnership.ownedFraction":.5,"resources.cashResource.jointOwnership.allocationConsent":false,"resources.cashResource.source":"VERIFIED","resources.cashResource.certainty":"HIGH"};
  for (const [path,value] of Object.entries(expected)) {
    assert.equal(result.metadata.inputRecords[path].value,value,path);
    for (const ref of ["flags.hasCapitalAssignmentConflict","metrics.availableSafetyLiquidity30d","flags.hasReservedCapital"]) assert.ok(result.metadata.valueLineage[ref].includes(path),`${ref}: ${path}`);
  }
  assert.equal(result.metadata.inputRecords["expenses.components.optional.category"].value,"DISCRETIONARY");
  for (const ref of ["metrics.coreMonthlyOutflow","metrics.monthlySurplus"]) assert.ok(result.metadata.valueLineage[ref].includes("expenses.components.optional.category"));
  assert.equal(result.metadata.inputRecords["inventory.assignments.length"].value,0);
  for (const paths of Object.values(result.metadata.valueLineage)) for (const path of paths) assert.ok(result.metadata.inputRecords[path],path);
});

test("claim inventory cannot certify duplicate recurring economic occurrences under renamed IDs",()=>{
  const {profile,options}=fixture();
  const claim={id:"goalOccurrence",claimType:"GOAL_FUNDING",category:"CHOSEN",amount:known(10000),dueDate:known("2026-10-15"),required:false,userPriority:"MEDIUM",urgency:"NEAR_TERM",severity:"LOW",certainty:"HIGH",reversibility:"HIGH",lifecycleStatus:"ACTIVE",fundedAmount:known(0),fundingStatus:"UNFUNDED",eligibleResources:["cashResource"],stageImpact:"ACCUMULATION",source:"VERIFIED",modelVersion:"1.0.0",origin:{type:"GOAL",sourceId:"goal"},recurrence:"MONTHLY",occurrence:{templateId:"goalTemplate",occurrenceKey:"2026-10"},fulfillmentEffects:[{code:"FUND_GOAL",amountSource:"FUNDED_AMOUNT",targetId:"goalAssignment",assignmentOnly:true}]};
  options.claims=[claim,{...structuredClone(claim),id:"renamedOccurrence"}];
  const result=normalizeProfile(profile,options);
  for (const ref of ["counts.unresolvedPriorityClaims","flags.hasUnresolvedPriorityClaim","metrics.totalGoalClaims"]) assert.equal(result.context[ref].status,"UNKNOWN",ref);
  for (const path of ["claims.goalOccurrence.occurrence.templateId","claims.goalOccurrence.occurrence.occurrenceKey","claims.goalOccurrence.eligibleResources.0","claims.goalOccurrence.fulfillmentEffects.0.assignmentOnly"]) {
    assert.ok(result.metadata.inputRecords[path],path);
    assert.ok(result.metadata.valueLineage["metrics.totalGoalClaims"].includes(path),path);
  }
  options.claims[1].occurrence.occurrenceKey="2026-11";
  assert.equal(amount(normalizeProfile(profile,options),"counts.unresolvedPriorityClaims"),2);
});

test("discretionary overlap is checked after assembling debt and recurring obligation identities",()=>{
  for (const source of ["DEBT","OBLIGATION"]) {
    const {profile,options}=fixture();
    profile.expenses.components=profile.expenses.components.filter(({id})=>id!=="debtExpense");
    const optional=profile.expenses.components.find(({id})=>id==="optional");
    optional.economicPaymentId=source==="DEBT"?"debtPayment":"rentOccurrence";
    if (source==="OBLIGATION") profile.obligations[0].recurrence="MONTHLY";
    const result=normalizeProfile(profile,options);
    for (const ref of ["metrics.coreMonthlyOutflow","metrics.coreCashFlow","metrics.monthlySurplus"]) assert.equal(result.context[ref].status,"UNKNOWN",`${source}: ${ref}`);
    assert.equal(result.context["flags.hasNegativeCoreCashFlow"].status,"UNKNOWN");
  }
});

test("unknown resource availability date is discovery, not a proved capital conflict suppressing known repair",()=>{
  for (const availableFrom of [unknown("AVAILABILITY_NOT_REPORTED"),known("2026-10-01","2026-10-02")]) {
    const {profile,options}=fixture();
    options.resources[0].availableFrom=availableFrom;
    profile.liabilities[0].delinquencyStatus="DELINQUENT";
    const result=normalizeProfile(profile,options);
    assert.equal(result.context["metrics.availableSafetyLiquidity30d"].status,"UNKNOWN");
    assert.equal(result.context["flags.hasCapitalAssignmentConflict"].status,"UNKNOWN");
    const decision=evaluateReference(result.context,undefined,result.metadata);
    assert.equal(decision.mainQuest.code,"RESOLVE_DELINQUENCY");
    assert.ok(!decision.matchedRuleIds.includes("R-008"));
    assert.equal(result.metadata.inputRecords["resources.cashResource.availableFrom"].status,"UNKNOWN");
  }
});
