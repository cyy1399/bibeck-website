import type { DataPoint } from "./common.ts";

export type IncomeType = "SALARY" | "BUSINESS" | "FREELANCE" | "COMMISSION" | "INVESTMENT" | "RENTAL" | "OTHER";
export type Stability = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
export type AssetType = "CASH" | "DEPOSIT" | "STOCKS" | "FUNDS" | "BONDS" | "CRYPTO" | "REAL_ESTATE" | "BUSINESS" | "OTHER";
export type Liquidity = "IMMEDIATE" | "SHORT" | "LIMITED" | "ILLIQUID";
export type CapitalPurpose = "OPERATING" | "SAFETY" | "GOAL" | "LONG_TERM" | "BUSINESS" | "EXPERIMENTAL" | "UNASSIGNED";
export type LiabilityType = "CREDIT_CARD" | "PERSONAL_LOAN" | "MORTGAGE" | "AUTO_LOAN" | "STUDENT_LOAN" | "FAMILY_LOAN" | "OTHER";
export type DelinquencyStatus = "CURRENT" | "AT_RISK" | "DELINQUENT" | "DEFAULT" | "UNKNOWN";
export type GoalPriority = "HIGH" | "MEDIUM" | "LOW";

export interface IncomeSource { id: string; type: IncomeType; averageMonthlyNetIncome: DataPoint<number>; stability: Stability }
export interface Expenses { necessaryMonthly?: DataPoint<number>; discretionaryMonthly?: DataPoint<number>; otherMonthlyRequired?: DataPoint<number> }
export interface Asset { id: string; type: AssetType; currentValue: DataPoint<number>; liquidity: Liquidity; purpose: CapitalPurpose }
export interface Liability { id: string; type: LiabilityType; balance: DataPoint<number>; apr?: DataPoint<number>; nominalRate?: DataPoint<number>; minimumMonthlyPayment: DataPoint<number>; remainingTermMonths?: DataPoint<number>; secured: boolean; variableRate?: boolean; prepaymentPenalty?: DataPoint<number>; delinquencyStatus: DelinquencyStatus }
export interface Obligation { id: string; name: string; amount: DataPoint<number>; dueDate: string; required: boolean; reservedAmount: DataPoint<number> }
export interface Goal { id: string; name: string; targetAmount: DataPoint<number>; currentFunding: DataPoint<number>; targetDate: string; priority: GoalPriority; required: boolean }
export interface Household { dependents: DataPoint<number>; externalSupportAvailable: DataPoint<boolean> }
export interface FinancialProfile { profile: { age?: number; primaryCurrency: string; country: string }; income: IncomeSource[]; expenses: Expenses; assets: Asset[]; liabilities: Liability[]; obligations: Obligation[]; goals: Goal[]; household: Household; reportedMonthlySavings?: DataPoint<number> }
