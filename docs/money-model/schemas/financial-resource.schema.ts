import type { DataSource } from "./common.ts";
import type { CapitalPurpose, Liquidity } from "./financial-profile.schema.ts";
import type { DomainValue } from "./domain-value.schema.ts";
export type ResourceType = "CURRENT_CASH" | "MONTHLY_SURPLUS" | "SAFETY_CAPITAL" | "GOAL_CAPITAL" | "LONG_TERM_CAPITAL" | "FUTURE_INCOME" | "EXTERNAL_SUPPORT";
export type ResourceOwnership = "SOLE" | "JOINT" | "EXTERNAL" | "UNKNOWN";
export type ResourceAvailability = "AVAILABLE" | "RESERVED" | "RESTRICTED" | "LOCKED" | "UNSETTLED" | "UNKNOWN";
export type ResourceValuationStatus = "KNOWN" | "ESTIMATED" | "UNKNOWN";
export interface FinancialResource { id:string; type:ResourceType; amount:DomainValue<number>; underlyingAssetId?:string; underlyingIncomeId?:string; ownership:ResourceOwnership; availability:ResourceAvailability; liquidity:Liquidity; valuationStatus:ResourceValuationStatus; restrictionReason?:string; purpose:CapitalPurpose; availableFrom:DomainValue<string>; reservedForClaimIds:string[]; source:DataSource; certainty:"HIGH"|"MEDIUM"|"LOW" }
export interface ResourceAllocation { resourceId: string; claimId: string; amount: number; capitalAssignmentId: string }
export interface CapitalAssignment { id:string; assetId:string; purpose:CapitalPurpose; amount:DomainValue<number>; claimId?:string }
