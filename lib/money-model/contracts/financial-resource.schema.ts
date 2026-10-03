import type { DataSource } from "./common.ts";
import type { CapitalPurpose, Liquidity } from "./financial-profile.schema.ts";
import type { DomainValue } from "./domain-value.schema.ts";
import type { ClaimType } from "./financial-claim.schema.ts";

export type ResourceType = "CURRENT_CASH" | "MONTHLY_SURPLUS" | "SAFETY_CAPITAL" | "GOAL_CAPITAL" | "LONG_TERM_CAPITAL" | "FUTURE_INCOME" | "EXTERNAL_SUPPORT" | "CREDIT_AVAILABILITY";
export type ResourceOwnership = "SOLE" | "JOINT" | "EXTERNAL" | "UNKNOWN";
export type ResourceAvailability = "AVAILABLE" | "RESERVED" | "RESTRICTED" | "LOCKED" | "UNSETTLED" | "UNKNOWN";
export type ResourceValuationStatus = "KNOWN" | "ESTIMATED" | "UNKNOWN";

export interface ResourceRestriction {
  reasonCode: string;
  allowsCurrentFunding: boolean;
  allowedClaimIds?: string[];
  allowedClaimTypes?: ClaimType[];
}

export interface JointResourceOwnership {
  /** Fraction of the underlying whole asset's declared available economic value. */
  ownedFraction: number;
  /** A share alone is not permission to fund a claim. */
  allocationConsent: boolean;
}

export interface FinancialResource {
  id: string;
  type: ResourceType;
  amount: DomainValue<number>;
  underlyingAssetId?: string;
  underlyingIncomeId?: string;
  ownership: ResourceOwnership;
  availability: ResourceAvailability;
  liquidity: Liquidity;
  valuationStatus: ResourceValuationStatus;
  restrictionReason?: string;
  restriction?: ResourceRestriction;
  jointOwnership?: JointResourceOwnership;
  purpose: CapitalPurpose;
  availableFrom: DomainValue<string>;
  reservedForClaimIds: string[];
  /** Multiple Resource records for one Asset must name disjoint assignments. */
  partitionAssignmentIds?: string[];
  source: DataSource;
  certainty: "HIGH" | "MEDIUM" | "LOW";
}

export interface ResourceAllocation {
  resourceId: string;
  claimId: string;
  amount: number;
  capitalAssignmentId: string;
}

export interface CapitalAssignment {
  id: string;
  assetId: string;
  purpose: CapitalPurpose;
  amount: DomainValue<number>;
  claimId?: string;
}
