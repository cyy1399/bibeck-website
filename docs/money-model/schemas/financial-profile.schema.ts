import type { DataPoint } from "./common.ts";
import type { DomainValue } from "./domain-value.schema.ts";
export type FinancialInput<T> = DataPoint<T> | DomainValue<T>;

export type IncomeType = "SALARY" | "BUSINESS" | "FREELANCE" | "COMMISSION" | "INVESTMENT" | "RENTAL" | "OTHER";
export type Stability = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
export type AssetType = "CASH" | "DEPOSIT" | "STOCKS" | "FUNDS" | "BONDS" | "CRYPTO" | "REAL_ESTATE" | "BUSINESS" | "OTHER";
export type Liquidity = "IMMEDIATE" | "SHORT" | "LIMITED" | "ILLIQUID";
export type CapitalPurpose = "OPERATING" | "SAFETY" | "GOAL" | "LONG_TERM" | "BUSINESS" | "EXPERIMENTAL" | "UNASSIGNED";
export type LiabilityType = "CREDIT_CARD" | "PERSONAL_LOAN" | "MORTGAGE" | "AUTO_LOAN" | "STUDENT_LOAN" | "FAMILY_LOAN" | "OTHER";
export type DelinquencyStatus = "CURRENT" | "AT_RISK" | "DELINQUENT" | "DEFAULT" | "UNKNOWN";
export type GoalPriority = "HIGH" | "MEDIUM" | "LOW";

export interface IncomeSource { id: string; type: IncomeType; averageMonthlyNetIncome: FinancialInput<number>; stability: Stability }
export interface ExpenseComponent { id:string; economicPaymentId:string; category:"NECESSARY"|"DISCRETIONARY"|"OTHER_REQUIRED"; timeBasis:"MONTHLY"|"ONE_TIME"|"UNNORMALIZED"; amount:FinancialInput<number> }
export interface Expenses { necessaryMonthly?: FinancialInput<number>; discretionaryMonthly?: FinancialInput<number>; otherMonthlyRequired?: FinancialInput<number>; components?:ExpenseComponent[]; aggregatesExcludeDebtAndObligations?:boolean }
export interface Asset { id: string; type: AssetType; currentValue: FinancialInput<number>; availableEconomicValue?:DomainValue<number>; ownership?:"SOLE"|"JOINT"|"EXTERNAL"|"UNKNOWN"; liquidity: Liquidity; purpose: CapitalPurpose }
export interface Liability { id:string; type:LiabilityType; balance:FinancialInput<number>; apr?:FinancialInput<number>; costClassification?:DomainValue<"HIGH_COST"|"OTHER_COST">; economicPaymentId?:string; nominalRate?:FinancialInput<number>; promotionalRate?:FinancialInput<number>; promotionalRateEndDate?:string; minimumMonthlyPayment:FinancialInput<number>; remainingTermMonths?:FinancialInput<number>; secured:boolean; variableRate?:boolean; rateResetTerms?:string; prepaymentPenalty?:FinancialInput<number>; prepaymentPenaltyType?:"FIXED"|"PERCENTAGE"|"UNKNOWN"; delinquencyStatus:DelinquencyStatus }
export interface Obligation { id:string; name:string; economicPaymentId?:string; amount?:FinancialInput<number>; dueDate?:string; recurrence?:"NONE"|"MONTHLY"|"UNNORMALIZED"; required:boolean; reservedAmount:FinancialInput<number> }
export interface Goal { id:string; name:string; targetAmount?:FinancialInput<number>; currentFunding?:FinancialInput<number>; targetDate?:string; priority:GoalPriority; required:boolean; status?:"ACTIVE"|"PAUSED"|"ABANDONED"|"COMPLETED" }
export interface Household { dependents: FinancialInput<number>; externalSupportAvailable: FinancialInput<boolean> }
export interface FinancialProfile { profile: { age?: number; primaryCurrency: string; country: string }; income: IncomeSource[]; expenses: Expenses; assets: Asset[]; liabilities: Liability[]; obligations: Obligation[]; goals: Goal[]; household: Household; reportedMonthlySavings?:FinancialInput<number> }
