/** Closed registry: keys are direct record keys, never property traversal paths. */
export interface ValueRefDefinition {
  key: string;
  source: "METRIC" | "STATE" | "NORMALIZED_INPUT" | "ASSUMPTION_CONFIG";
  valueType: "money" | "ratio" | "months" | "count" | "boolean";
  unit: "PRIMARY_CURRENCY" | "DIMENSIONLESS_RATIO" | "MONTHS" | "COUNT" | "BOOLEAN";
  timeBasis: "MONTHLY" | "AS_OF" | "HORIZON_30D" | "HORIZON_90D" | "HORIZON_365D" | "NOT_APPLICABLE";
  currency: "profile.primaryCurrency" | "NOT_APPLICABLE";
  sign: "SIGNED" | "NONNEGATIVE" | "POSITIVE" | "NOT_APPLICABLE";
  unknownAllowed: boolean;
  description: string;
  producerModel: string | null;
  producerContract: "REFERENCE_NORMALIZATION" | "EXPLICIT_INPUT" | "RESEARCH_REQUIRED_SLOT" | "VERSIONED_ASSUMPTION_CONFIG";
  maximum?: number;
}

const money = (key:string,description:string,timeBasis:ValueRefDefinition["timeBasis"],sign:ValueRefDefinition["sign"],producerModel:string|null,producerContract:ValueRefDefinition["producerContract"]="REFERENCE_NORMALIZATION"):ValueRefDefinition => ({key,source:producerContract==="EXPLICIT_INPUT"?"NORMALIZED_INPUT":"METRIC",valueType:"money",unit:"PRIMARY_CURRENCY",timeBasis,currency:"profile.primaryCurrency",sign,unknownAllowed:true,description,producerModel,producerContract});
const state = (key:string,description:string,producerModel:string|null,producerContract:ValueRefDefinition["producerContract"]="REFERENCE_NORMALIZATION"):ValueRefDefinition => ({key,source:"STATE",valueType:"boolean",unit:"BOOLEAN",timeBasis:"NOT_APPLICABLE",currency:"NOT_APPLICABLE",sign:"NOT_APPLICABLE",unknownAllowed:true,description,producerModel,producerContract});
const ratio = (key:string,description:string,maximum?:number):ValueRefDefinition => ({key,source:"METRIC",valueType:"ratio",unit:"DIMENSIONLESS_RATIO",timeBasis:"MONTHLY",currency:"NOT_APPLICABLE",sign:"NONNEGATIVE",unknownAllowed:true,description,producerModel:"cash_flow_v1",producerContract:"REFERENCE_NORMALIZATION",...(maximum===undefined?{}:{maximum})});

export const valueRefRegistry = {
  "metrics.netMonthlyIncome":money("metrics.netMonthlyIncome","Sum of complete, explicitly normalized net monthly income; not owned cash.","MONTHLY","NONNEGATIVE","cash_flow_v1"),
  "metrics.coreMonthlyOutflow":money("metrics.coreMonthlyOutflow","Deduplicated required recurring monthly outflow, including debt minimums.","MONTHLY","NONNEGATIVE","cash_flow_v1"),
  "metrics.coreCashFlow":money("metrics.coreCashFlow","Net monthly income minus core monthly outflow; positive denotes arithmetic excess.","MONTHLY","SIGNED","cash_flow_v1"),
  "metrics.monthlySurplus":money("metrics.monthlySurplus","Core cash flow minus discretionary monthly expense; no repeated obligation deduction.","MONTHLY","SIGNED","cash_flow_v1"),
  "metrics.netWorth":money("metrics.netWorth","Owned assets less liabilities at one snapshot; no assignments, future income or external support added.","AS_OF","SIGNED",null),
  "metrics.availableSafetyLiquidity30d":money("metrics.availableSafetyLiquidity30d","Owned realizable liquidity after unique reservations and uncovered required claims within 30 days; negative means deficit.","HORIZON_30D","SIGNED","liquidity_v1"),
  "metrics.availableSafetyLiquidity90d":money("metrics.availableSafetyLiquidity90d","Post-obligation owned liquidity on the explicitly selected 90-day horizon.","HORIZON_90D","SIGNED","liquidity_v1"),
  "metrics.availableSafetyLiquidity365d":money("metrics.availableSafetyLiquidity365d","Post-obligation owned liquidity on the explicitly selected 365-day horizon.","HORIZON_365D","SIGNED","liquidity_v1"),
  "metrics.requiredObligations30d":money("metrics.requiredObligations30d","Unique required dated obligation amount in the next 30 days; not a recurring monthly flow.","HORIZON_30D","NONNEGATIVE","liquidity_v1"),
  "metrics.financialRunwayMonths":{key:"metrics.financialRunwayMonths",source:"METRIC",valueType:"months",unit:"MONTHS",timeBasis:"HORIZON_30D",currency:"NOT_APPLICABLE",sign:"SIGNED",unknownAllowed:true,description:"Post-obligation 30-day safety liquidity divided by positive core monthly outflow; never infinity.",producerModel:"liquidity_v1",producerContract:"REFERENCE_NORMALIZATION"},
  "metrics.debtServiceRatio":ratio("metrics.debtServiceRatio","Deduplicated mandatory monthly debt payments divided by positive net monthly income; 0.25 means 25 percent."),
  "metrics.incomeConcentration":ratio("metrics.incomeConcentration","Largest approved recurring income source divided by positive complete net monthly income.",1),
  "metrics.sustainableGoalCapital":money("metrics.sustainableGoalCapital","Explicit current capital available for chosen goals; unresolved sustainability model emits UNKNOWN.","AS_OF","NONNEGATIVE","goal_funding_v1","RESEARCH_REQUIRED_SLOT"),
  "metrics.totalGoalClaims":money("metrics.totalGoalClaims","Outstanding goal claim capital on the same stock basis; unknown target/funding propagates.","AS_OF","NONNEGATIVE","goal_funding_v1"),
  "metrics.longTermInvestableCapital":money("metrics.longTermInvestableCapital","Current allocatable capital minus unique higher-priority claims; unresolved allocation dependencies emit UNKNOWN.","AS_OF","NONNEGATIVE","investable_capital_v1","RESEARCH_REQUIRED_SLOT"),
  "metrics.reportedMonthlySavings":money("metrics.reportedMonthlySavings","User-reported monthly savings on the normalized monthly basis; not automatically equal to computed surplus.","MONTHLY","SIGNED",null,"EXPLICIT_INPUT"),
  "flags.hasMissingCriticalData":state("flags.hasMissingCriticalData","Required normalization dependencies are unknown or unsupported.",null),
  "flags.hasDelinquentDebt":state("flags.hasDelinquentDebt","Known current debt delinquency state; missing delinquency data remains UNKNOWN.","debt_priority_v1"),
  "flags.hasImmediateFundingGap":state("flags.hasImmediateFundingGap","Negative post-obligation 30-day residual; the same obligations are not subtracted twice.","liquidity_v1"),
  "flags.hasNegativeCoreCashFlow":state("flags.hasNegativeCoreCashFlow","Known core cash flow is strictly below zero.","cash_flow_v1"),
  "flags.hasUnknownDebtCost":state("flags.hasUnknownDebtCost","A debt cost dependency or required classification is unresolved.","debt_priority_v1"),
  "flags.hasHighCostDebt":state("flags.hasHighCostDebt","Explicit qualified high-cost classification only; no guessed universal APR threshold.","debt_priority_v1","EXPLICIT_INPUT"),
  "flags.hasMinimumViableLiquidityGap":state("flags.hasMinimumViableLiquidityGap","Known liquidity fails the injected working milestone; assumption remains research-required.","liquidity_v1"),
  "flags.hasCapitalAssignmentConflict":state("flags.hasCapitalAssignmentConflict","Resource identity or allocation-conservation validation fails.","investable_capital_v1"),
  "flags.hasReservedCapital":state("flags.hasReservedCapital","Known reservations exclude capital from free liquidity.","liquidity_v1"),
  "flags.hasGoalConflict":state("flags.hasGoalConflict","Chosen claims exceed known sustainable goal capital; unknown dependencies do not infer conflict.","goal_funding_v1","RESEARCH_REQUIRED_SLOT"),
  "flags.hasGoalFundingClaim":state("flags.hasGoalFundingClaim","An active unfunded or partially funded chosen goal claim exists.","goal_funding_v1"),
  "flags.hasAllocationConflict":state("flags.hasAllocationConflict","Explicit allocation trade-off state; no invented risk or allocation policy.",null,"EXPLICIT_INPUT"),
  "flags.hasNegativeNetWorth":state("flags.hasNegativeNetWorth","Known owned-asset net worth is strictly below zero.",null),
  "flags.hasZeroIncome":state("flags.hasZeroIncome","Complete known normalized monthly income equals zero; unknown income is not zero.","cash_flow_v1"),
  "flags.hasCashFlowContradiction":state("flags.hasCashFlowContradiction","Explicit reconciliation conflict on equal monthly bases; no invented materiality threshold.","cash_flow_v1"),
  "flags.hasUnresolvedPriorityClaim":state("flags.hasUnresolvedPriorityClaim","An active priority claim remains unresolved; incomplete claim discovery stays UNKNOWN.","bottleneck_v1"),
  "counts.unresolvedPriorityClaims":{key:"counts.unresolvedPriorityClaims",source:"STATE",valueType:"count",unit:"COUNT",timeBasis:"AS_OF",currency:"NOT_APPLICABLE",sign:"NONNEGATIVE",unknownAllowed:true,description:"Integer number of unresolved active priority claims; incomplete discovery is UNKNOWN, not zero.",producerModel:"bottleneck_v1",producerContract:"REFERENCE_NORMALIZATION"},
  "config.minimumViableLiquidityMonths":{key:"config.minimumViableLiquidityMonths",source:"ASSUMPTION_CONFIG",valueType:"months",unit:"MONTHS",timeBasis:"NOT_APPLICABLE",currency:"NOT_APPLICABLE",sign:"POSITIVE",unknownAllowed:true,description:"Injected AS-001 working liquidity milestone, LOW confidence and RESEARCH_REQUIRED; not frozen financial truth.",producerModel:null,producerContract:"VERSIONED_ASSUMPTION_CONFIG"},
} as const satisfies Record<string,ValueRefDefinition>;

export type RegisteredValueRef = keyof typeof valueRefRegistry;
export const registeredValueRefs = Object.freeze(Object.keys(valueRefRegistry) as RegisteredValueRef[]);
export const isRegisteredValueRef = (value:unknown):value is RegisteredValueRef => typeof value==="string" && Object.prototype.hasOwnProperty.call(valueRefRegistry,value);
