import type { Asset, IncomeSource, Liability, Goal, ExpenseComponent } from "../../money-model/contracts/financial-profile.schema.ts";
import type { FinancialProfile, DomainValue, FinancialClaim, CapitalAssignment, FinancialResource, NormalizationOptions } from "../../money-model/index.ts";
import type { ClaimLifecycleStatus, FundingStatus, ClaimType } from "../../money-model/contracts/financial-claim.schema.ts";
import type { ResourceAvailability } from "../../money-model/contracts/financial-resource.schema.ts";
import type { SourceEnvelope, SourceFieldDto, SourceCollection } from "./source.ts";

export const PRODUCER_BUNDLE_VERSION = "1.0.0";
export const ADAPTER_SOURCE_VERSION = "1.0.0";
export const inventoryKeys = ["income", "expenses", "assets", "liabilities", "obligations", "goals", "assignments", "claims"] as const;
export type InventoryKey = typeof inventoryKeys[number];
export type InventoryState = "NOT_CONFIRMED" | "PARTIAL" | "CONFIRMED";
/** Scope is explicit: a cash/dated subset can never certify the whole inventory. */
export interface SourceInventory {
  state: InventoryState;
  scope: "ALL" | "CASH_ONLY" | "DATED_30D" | "DATED_90D" | "DATED_365D";
}
export interface AssetFacts extends Pick<Asset, "type" | "liquidity" | "purpose"> {
  ownership: NonNullable<Asset["ownership"]>;
  availability: ResourceAvailability;
  availableFrom?: SourceFieldDto;
  restriction?: { reasonCode: string; allowsCurrentFunding: false };
}
export interface ObligationFacts {
  required: boolean;
  economicPaymentId?: string;
  recurrence: "NONE" | "MONTHLY" | "UNNORMALIZED";
  occurrence?: { templateId: string; occurrenceKey: string };
}
export interface AssignmentFacts { assetId: string; purpose: Asset["purpose"]; claimId?: string }
export interface SourceClaimIntent {
  id: string;
  claimType: ClaimType;
  sourceCollection: "expenses" | "liabilities" | "obligations" | "goals";
  sourceId: string;
  lifecycleStatus: ClaimLifecycleStatus;
  occurrence?: { templateId: string; occurrenceKey: string };
  /** Explicit occurrence facts, not a monthly rate silently converted into a cash claim. */
  occurrenceAmount?: SourceFieldDto;
  dueDate?: SourceFieldDto;
  /** Source evidence only; never a posted debt reduction or inferred principal split. */
  debtPayment?: { principal: SourceFieldDto; interest: SourceFieldDto; fees: SourceFieldDto };
}
export interface AdapterSource {
  adapterSourceVersion: typeof ADAPTER_SOURCE_VERSION;
  envelope: SourceEnvelope;
  country: string;
  inventories: Partial<Record<InventoryKey, SourceInventory>>;
  facts: {
    income?: Record<string, Pick<IncomeSource, "type" | "stability"> & { monthlyBasisConfirmed: boolean }>;
    expenses?: { aggregatesExcludeDebtAndObligations?: boolean };
    assets?: Record<string, AssetFacts>;
    liabilities?: Record<string, Pick<Liability, "type" | "secured" | "delinquencyStatus"> & { economicPaymentId?: string }>;
    obligations?: Record<string, ObligationFacts>;
    goals?: Record<string, Pick<Goal, "priority" | "required" | "status">>;
    assignments?: Record<string, AssignmentFacts>;
  };
  expenseComponents?: (Pick<ExpenseComponent, "id" | "economicPaymentId" | "category" | "timeBasis"> & { amount: SourceFieldDto })[];
  claimIntents?: SourceClaimIntent[];
}
export interface ProducerLimitation {
  code: string;
  fieldRefs: string[];
  kind: "MISSING_SOURCE" | "UNSUPPORTED_MAPPING" | "RESEARCH_REQUIRED" | "UNRESOLVED_SOURCE";
}
export interface ClaimCandidate {
  id: string;
  claimType: ClaimType;
  sourceCollection: SourceClaimIntent["sourceCollection"];
  sourceId: string;
  lifecycleStatus: ClaimLifecycleStatus;
  occurrence?: SourceClaimIntent["occurrence"];
  amount: DomainValue<number>;
  dueDate: DomainValue<string>;
  fundedAmount: DomainValue<number>;
  fundingStatus: FundingStatus;
  debtPayment?: { principal: DomainValue<number>; interest: DomainValue<number>; fees: DomainValue<number> };
  mappingStatus: "UNSUPPORTED";
}
export interface ProducerCoverage {
  producerId: string;
  inventoryState: InventoryState;
  complete: boolean;
  sourceRefs: string[];
  producedIds: string[];
  reasonCodes: string[];
}
/** Derived per invocation, portable but not independently mutable persistent state. */
export interface ProducerManifest {
  adapterSourceVersion: typeof ADAPTER_SOURCE_VERSION;
  codecVersion: SourceEnvelope["codecVersion"];
  producerBundleVersion: typeof PRODUCER_BUNDLE_VERSION;
  financialModelVersion: string;
  snapshotId: string;
  asOf: string;
  monthlyPeriodId: string;
  inventories: Partial<Record<InventoryKey, SourceInventory>>;
  coverage: ProducerCoverage[];
  limitations: ProducerLimitation[];
  answerMetadata: { fieldRef: string; status: "KNOWN" | "UNKNOWN" | "NOT_APPLICABLE" | "UNANSWERED" }[];
}
export interface AdaptedProfile {
  source: AdapterSource;
  profile: FinancialProfile;
  options: NormalizationOptions;
  manifest: ProducerManifest;
  claimCandidates: ClaimCandidate[];
}
export interface ResourceProduction { resources: FinancialResource[]; assignments: CapitalAssignment[]; limitations: ProducerLimitation[]; coveredAssetIds: string[] }
export interface ClaimProduction { claims: FinancialClaim[]; candidates: ClaimCandidate[]; limitations: ProducerLimitation[]; complete: boolean }
export type CollectionRecord = { id: string; name?: string; values: Record<string, { value: DomainValue<number | string | boolean> }> };
export type DomainCollections = Partial<Record<SourceCollection, CollectionRecord[]>>;
