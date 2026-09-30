export const valueRefs = [
  "metrics.netMonthlyIncome","metrics.coreMonthlyOutflow","metrics.coreCashFlow","metrics.monthlySurplus","metrics.netWorth","metrics.availableSafetyLiquidity30d","metrics.availableSafetyLiquidity90d","metrics.availableSafetyLiquidity365d","metrics.financialRunwayMonths","metrics.sustainableGoalCapital","metrics.totalGoalClaims","metrics.longTermInvestableCapital","metrics.reportedMonthlySavings",
  "flags.hasMissingCriticalData","flags.hasDelinquentDebt","flags.hasImmediateFundingGap","flags.hasNegativeCoreCashFlow","flags.hasUnknownDebtCost","flags.hasHighCostDebt","flags.hasMinimumViableLiquidityGap","flags.hasCapitalAssignmentConflict","flags.hasReservedCapital","flags.hasGoalConflict","flags.hasGoalFundingClaim","flags.hasAllocationConflict","flags.hasNegativeNetWorth","flags.hasZeroIncome","flags.hasCashFlowContradiction","flags.hasUnresolvedPriorityClaim",
  "counts.unresolvedPriorityClaims","config.minimumViableLiquidityMonths",
] as const;
export type ValueRef = typeof valueRefs[number];
export type LiteralValue = string | number | boolean | null;
export type ComparisonOperator = "EQ" | "NE" | "GT" | "GTE" | "LT" | "LTE";
export type Condition =
  | { kind:"comparison"; left:ValueRef; operator:ComparisonOperator; right:{ kind:"literal"; value:LiteralValue } | { kind:"ref"; ref:ValueRef } }
  | { kind:"logical"; operator:"AND" | "OR"; conditions:Condition[] }
  | { kind:"not"; condition:Condition }
  | { kind:"exists"; ref:ValueRef }
  | { kind:"missing"; ref:ValueRef };
export type TruthValue = "TRUE" | "FALSE" | "UNKNOWN";
