import type { FinancialProfile, FinancialClaim, DomainValue } from "../../../lib/money-model/index.ts";
import type { NormalizationOptions } from "../../../lib/money-model/index.ts";
import { fromDomainNumber } from "../../../lib/money-os/adapters/money-codec.ts";
import type { AdapterSource } from "../../../lib/money-os/contracts/producer-manifest.ts";
import type { SourceFieldDto, SourceUnit } from "../../../lib/money-os/contracts/source.ts";

export const asOf="2026-10-02";
export const point=<T>(value:T):DomainValue<T>=>({status:"KNOWN",data:{value,source:"USER_REPORTED",updatedAt:asOf}});
export const missing=<T>(reasonCode="NOT_REPORTED"):DomainValue<T>=>({status:"UNKNOWN",reasonCode});

/** Hand-written inputs/expectations from UX V1 A–F; not evaluator-generated. */
export function goldenCase(id:"A"|"B"|"C"|"D"|"E"|"F") {
  const amounts={A:[30000,35000,0,60000],B:[60000,25000,10000,10000],C:[60000,20000,10000,100000],D:[60000,20000,10000,100000],E:[200000,80000,120000,300000],F:[100000,40000,20000,1000000]}[id];
  const [income,necessary,discretionary,cash]=amounts;
  const profile:FinancialProfile={
    profile:{primaryCurrency:"TWD",country:"TW"},
    income:[{id:"salary",type:"SALARY",averageMonthlyNetIncome:point(income),stability:"HIGH"}],
    expenses:{necessaryMonthly:point(necessary),discretionaryMonthly:point(discretionary),otherMonthlyRequired:point(0),aggregatesExcludeDebtAndObligations:true},
    assets:[{id:"cash",type:"CASH",currentValue:point(cash),ownership:"SOLE",liquidity:"IMMEDIATE",purpose:"UNASSIGNED"}],
    liabilities:[],obligations:[],goals:[],household:{dependents:missing(),externalSupportAvailable:missing()},
  };
  const options:NormalizationOptions={snapshotId:"golden-"+id,asOf,monthlyPeriodId:"2026-09",primaryCurrencyConfirmed:true,netMonthlyBasisConfirmed:true,stockAsOfConfirmed:true,approvedMonthlyIncomeIds:["salary"],
    complete:{income:true,expenses:true,assets:true,liabilities:true,obligations:true,goals:true,resources:true,assignments:true,claims:id!=="C"},
    resources:[{id:"cash-view",type:"CURRENT_CASH",amount:point(cash),underlyingAssetId:"cash",ownership:"SOLE",availability:"AVAILABLE",liquidity:"IMMEDIATE",valuationStatus:"KNOWN",purpose:"UNASSIGNED",availableFrom:point(asOf),reservedForClaimIds:[],source:"USER_REPORTED",certainty:"HIGH"}],assignments:[],claims:[],
  };
  if (id==="B" || id==="C") profile.liabilities=[{id:"loan",type:"PERSONAL_LOAN",balance:point(id==="B"?100000:50000),minimumMonthlyPayment:point(id==="B"?5000:1000),economicPaymentId:"loan-payment",secured:false,delinquencyStatus:"CURRENT",apr:id==="B"?point(0.2):missing(),costClassification:id==="B"?point("HIGH_COST"):missing()}];
  if (id==="A" || id==="B" || id==="F") {
    const claimType=id==="A"?"NECESSARY_LIVING":id==="B"?"SAFETY_BUFFER":"GOAL_FUNDING";
    const claim:FinancialClaim={id:"claim-"+id,claimType,category:id==="A"?"HARD":id==="B"?"PROTECTIVE":"CHOSEN",amount:point(id==="A"?35000:id==="B"?30000:2000000),fundedAmount:point(0),dueDate:missing(),required:id!=="F",userPriority:"HIGH",urgency:id==="A"?"IMMEDIATE":"LATER",severity:"MEDIUM",certainty:"LOW",reversibility:"HIGH",lifecycleStatus:"ACTIVE",fundingStatus:"UNFUNDED",eligibleResources:["cash-view"],stageImpact:id==="A"?"SURVIVAL":id==="B"?"STABILITY":"ACCUMULATION",source:"USER_REPORTED",modelVersion:"1.1.0",origin:{type:"USER_INPUT"},recurrence:"NONE",fulfillmentEffects:id==="A"?[{code:"REDUCE_CASH",amountSource:"CLAIM_AMOUNT"}]:[{code:id==="B"?"INCREASE_SAFETY_CAPITAL":"FUND_GOAL",targetId:"future-assignment",amountSource:"FUNDED_AMOUNT",assignmentOnly:true}]};
    options.claims=[claim];
  }
  if (id==="F") profile.goals=[{id:"house",name:"House",targetAmount:point(2000000),currentFunding:point(0),targetDate:"2028-10-02",priority:"HIGH",required:false,status:"ACTIVE"}];
  return {profile,options};
}

export const goldenExpected={
  A:{core: -5000,surplus:-5000,outflow:35000,liquidity:60000,netWorth:60000,stage:"SURVIVAL",severity:"CRITICAL",main:"REPAIR_CORE_CASH_FLOW",bottleneck:"NEGATIVE_CORE_CASH_FLOW",rules:["R-003"]},
  B:{core:30000,surplus:20000,outflow:30000,liquidity:10000,netWorth:-90000,stage:"STABILITY",severity:"HIGH",main:"BUILD_MINIMUM_LIQUIDITY",bottleneck:"MINIMUM_LIQUIDITY_GAP",rules:["R-005","R-012"]},
  C:{core:39000,surplus:29000,outflow:21000,liquidity:100000,netWorth:50000,stage:"CONTROL",severity:"MEDIUM",main:"CONFIRM_DEBT_COST",bottleneck:"NEED_MORE_INFORMATION",rules:["R-006"]},
  D:{core:40000,surplus:30000,outflow:20000,liquidity:100000,netWorth:100000,stage:null,severity:"NONE",main:null,bottleneck:"NO_UNRESOLVED_PRIORITY_CLAIM",rules:["R-014"]},
  E:{core:120000,surplus:0,outflow:80000,liquidity:300000,netWorth:300000,stage:null,severity:"NONE",main:null,bottleneck:"NO_UNRESOLVED_PRIORITY_CLAIM",rules:["R-014"]},
  F:{core:60000,surplus:40000,outflow:40000,liquidity:1000000,netWorth:1000000,stage:null,severity:"MEDIUM",main:null,bottleneck:null,rules:["R-009"]},
} as const;

/** Synthetic raw sources, not manufactured frozen claims or Research Required policies. */
export function sourceGoldenCase(id: "A" | "B" | "C" | "D" | "E" | "F"): AdapterSource {
  const { profile } = goldenCase(id);
  const scalar = (value: DomainValue<number | string | boolean>, unit: SourceUnit): SourceFieldDto => {
    if (value.status !== "KNOWN") return { unit, ...(unit.startsWith("MONEY") ? { currency: "TWD" } : {}), value };
    const numeric = typeof value.data.value === "number" ? fromDomainNumber(value.data.value) : undefined;
    if (numeric && !numeric.ok) throw new Error("INVALID_SYNTHETIC_FIXTURE");
    return { unit, ...(unit.startsWith("MONEY") ? { currency: "TWD" } : {}), value: { status: "KNOWN", data: { value: numeric?.ok ? numeric.value : value.data.value as string | boolean, source: "USER_REPORTED", updatedAt: asOf } } };
  };
  const source: AdapterSource = {
    adapterSourceVersion: "1.0.0", country: "TW",
    envelope: { profileEnvelopeVersion: "1.0.0", codecVersion: "1.0.0", basis: { primaryCurrency: "TWD", financialCalendarZone: "Asia/Taipei", asOf, monthlyPeriodId: "2026-09", primaryCurrencyConfirmed: true, netMonthlyBasisConfirmed: true, stockAsOfConfirmed: true }, collections: {
      income: [{ id: "salary", values: { averageMonthlyNetIncome: scalar(profile.income[0].averageMonthlyNetIncome as DomainValue<number>, "MONEY_PER_MONTH") } }],
      expenses: [{ id: "monthly", values: Object.fromEntries(["necessaryMonthly", "discretionaryMonthly", "otherMonthlyRequired"].map(key => [key, scalar(profile.expenses[key as keyof typeof profile.expenses] as DomainValue<number>, "MONEY_PER_MONTH")])) }],
      assets: [{ id: "cash", values: { currentValue: scalar(profile.assets[0].currentValue as DomainValue<number>, "MONEY") } }],
      liabilities: profile.liabilities.map(debt => ({ id: debt.id, values: { balance: scalar(debt.balance as DomainValue<number>, "MONEY"), minimumMonthlyPayment: scalar(debt.minimumMonthlyPayment as DomainValue<number>, "MONEY_PER_MONTH"), apr: scalar(debt.apr as DomainValue<number>, "APR_PERCENT") } })),
      obligations: [], goals: profile.goals.map(goal => ({ id: goal.id, name: goal.name, values: { targetAmount: scalar(goal.targetAmount as DomainValue<number>, "MONEY"), currentFunding: scalar(goal.currentFunding as DomainValue<number>, "MONEY"), targetDate: scalar(point(goal.targetDate!), "DATE") } })), assignments: [],
    } },
    inventories: Object.fromEntries(["income", "expenses", "assets", "liabilities", "obligations", "goals", "assignments", "claims"].map(key => [key, { state: "CONFIRMED", scope: "ALL" }])),
    facts: { income: { salary: { type: "SALARY", stability: "HIGH", monthlyBasisConfirmed: true } }, expenses: { aggregatesExcludeDebtAndObligations: true },
      assets: { cash: { type: "CASH", ownership: "SOLE", liquidity: "IMMEDIATE", purpose: "UNASSIGNED", availability: "AVAILABLE", availableFrom: scalar(point(asOf), "DATE") } },
      liabilities: Object.fromEntries(profile.liabilities.map(debt => [debt.id, { type: debt.type, secured: debt.secured, delinquencyStatus: debt.delinquencyStatus, economicPaymentId: debt.economicPaymentId! }])),
      goals: Object.fromEntries(profile.goals.map(goal => [goal.id, { priority: goal.priority, required: goal.required, status: goal.status }])), assignments: {} },
    claimIntents: id === "A" ? [{ id: "living", claimType: "NECESSARY_LIVING", sourceCollection: "expenses", sourceId: "monthly", lifecycleStatus: "ACTIVE" }]
      : id === "F" ? [{ id: "house-goal", claimType: "GOAL_FUNDING", sourceCollection: "goals", sourceId: "house", lifecycleStatus: "ACTIVE" }] : [],
  };
  return source;
}
