import type { Confidence, DataSource, Stage } from "./common.ts";
export type ClaimCategory = "HARD" | "PROTECTIVE" | "CHOSEN" | "OPTIMIZATION";
export type ClaimType = "NECESSARY_LIVING" | "DEBT_MINIMUM" | "DELINQUENT_DEBT" | "IMMEDIATE_OBLIGATION" | "SAFETY_BUFFER" | "DEBT_ACCELERATION" | "GOAL_FUNDING" | "HUMAN_CAPITAL" | "BUSINESS_CAPITAL" | "LONG_TERM_GROWTH" | "EXPERIMENTAL" | "TRADING_COST_OPTIMIZATION";
export type FundingStatus = "UNFUNDED" | "PARTIALLY_FUNDED" | "FUNDED" | "OVERFUNDED" | "NOT_APPLICABLE";
export type PriorityClass = "P0_HARD" | "P1_PROTECTIVE" | "P2_CHOSEN" | "P3_OPTIMIZATION";
export interface FinancialClaim { id: string; claimType: ClaimType; category: ClaimCategory; amount: number; dueDate?: string; required: boolean; userPriority: "HIGH" | "MEDIUM" | "LOW"; urgency: "IMMEDIATE" | "NEAR_TERM" | "LATER"; severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; certainty: Confidence; reversibility: "LOW" | "MEDIUM" | "HIGH"; fundedAmount: number; fundingStatus: FundingStatus; eligibleResources: string[]; stageImpact: Stage; source: DataSource; modelVersion: string }
