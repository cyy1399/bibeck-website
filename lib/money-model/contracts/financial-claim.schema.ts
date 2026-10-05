import type { Confidence, DataSource, Stage } from "./common.ts";
import type { DomainValue } from "./domain-value.schema.ts";
export type ClaimCategory = "HARD" | "PROTECTIVE" | "CHOSEN" | "OPTIMIZATION";
export type ClaimType = "NECESSARY_LIVING" | "DEBT_MINIMUM" | "DELINQUENT_DEBT" | "IMMEDIATE_OBLIGATION" | "SAFETY_BUFFER" | "DEBT_ACCELERATION" | "GOAL_FUNDING" | "HUMAN_CAPITAL" | "BUSINESS_CAPITAL" | "LONG_TERM_GROWTH" | "EXPERIMENTAL" | "TRADING_COST_OPTIMIZATION";
export type FundingStatus = "UNFUNDED" | "PARTIALLY_FUNDED" | "FUNDED" | "OVERFUNDED" | "UNKNOWN" | "NOT_APPLICABLE";
export type ClaimLifecycleStatus = "CREATED" | "ACTIVE" | "FULFILLED" | "EXPIRED" | "CANCELLED";
export type PriorityClass = "P0_HARD" | "P1_PROTECTIVE" | "P2_CHOSEN" | "P3_OPTIMIZATION";
export type ClaimOriginType = "USER_INPUT" | "OBLIGATION" | "DERIVED_MODEL" | "GOAL" | "DEBT" | "SYSTEM_RULE";
export type ClaimRecurrence = "NONE" | "MONTHLY" | "QUARTERLY" | "ANNUAL" | "CUSTOM";
export type FulfillmentEffectCode = "REDUCE_CASH" | "REDUCE_DEBT_BALANCE" | "INCREASE_SAFETY_CAPITAL" | "FUND_GOAL" | "NO_BALANCE_SHEET_EFFECT";
export interface ClaimOrigin { type:ClaimOriginType; sourceId?:string; modelId?:string; ruleId?:string }
export interface FulfillmentEffect {
  code:FulfillmentEffectCode;
  targetId?:string;
  amountSource:"FUNDED_AMOUNT" | "CLAIM_AMOUNT" | "DEBT_PRINCIPAL";
  /** These historical effect codes reclassify an existing assignment, never create an asset. */
  assignmentOnly?:true;
}
export interface DebtPaymentBreakdown {
  liabilityId:string;
  principal:DomainValue<number>;
  interest:DomainValue<number>;
  fees:DomainValue<number>;
}
export interface FinancialClaim {
  id:string; claimType:ClaimType; category:ClaimCategory;
  amount:DomainValue<number>; dueDate:DomainValue<string>; required:boolean;
  userPriority:"HIGH"|"MEDIUM"|"LOW"; urgency:"IMMEDIATE"|"NEAR_TERM"|"LATER";
  severity:"CRITICAL"|"HIGH"|"MEDIUM"|"LOW"; certainty:Confidence; reversibility:"LOW"|"MEDIUM"|"HIGH";
  lifecycleStatus:ClaimLifecycleStatus; fundedAmount:DomainValue<number>; fundingStatus:FundingStatus;
  /** Overfunding is opt-in for non-hard, non-debt targets; no default policy is inferred. */
  overfundingSupport?:{reasonCode:string};
  eligibleResources:string[]; stageImpact:Stage; source:DataSource; modelVersion:string;
  origin:ClaimOrigin; recurrence:ClaimRecurrence;
  customRecurrence?:{ interval:number; unit:"DAY"|"WEEK"|"MONTH" };
  occurrence?:{templateId:string; occurrenceKey:string};
  debtPayment?:DebtPaymentBreakdown;
  fulfillmentEffects:FulfillmentEffect[];
}
