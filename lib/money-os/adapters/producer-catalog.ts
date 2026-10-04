import { PRODUCER_BUNDLE_VERSION } from "../contracts/producer-manifest.ts";

/** Representation scope only. No thresholds, priority ranking or automatic allocation. */
export const producerCatalog = Object.freeze({
  version: PRODUCER_BUNDLE_VERSION,
  profile: Object.freeze({ id: "profile-facts", sourceSchemaVersion: "1.0.0", mapping: "FROZEN_INPUT_FIELDS", unknownStrategy: "PRESERVE_TAGS", policyApproval: "NOT_REQUIRED",
    requiredFacts: Object.freeze(["basis", "inventories", "classification", "tagged-values"]), completeness: "CONFIRMED_ALL_AND_MAPPED_RECORDS" }),
  resources: Object.freeze({ id: "owned-cash-views", sourceSchemaVersion: "1.0.0", mapping: "CASH_DEPOSIT_AND_EXPLICIT_ASSIGNMENTS", unknownStrategy: "INCOMPLETE_WITH_LINEAGE", policyApproval: "NOT_REQUIRED",
    requiredFacts: Object.freeze(["assetId", "SOLE", "CASH_OR_DEPOSIT", "IMMEDIATE", "availability", "availableFrom", "assignmentId", "purpose", "amount"]), completeness: "ASSETS_AND_ASSIGNMENTS_ALL_WITH_VALID_CONSERVATION" }),
  claims: Object.freeze({ id: "claim-candidates", sourceSchemaVersion: "1.0.0", mapping: "ORIGIN_LIFECYCLE_FUNDING_ONLY", unknownStrategy: "NO_FROZEN_CLAIM_WITHOUT_REVIEWED_MAPPING", policyApproval: "NOT_APPROVED",
    requiredFacts: Object.freeze(["claimIntents", "origin", "occurrence", "lifecycle", "assignment-funding", "debt-breakdown"]), missingMappings: Object.freeze(["userPriority", "urgency", "severity", "reversibility", "stageImpact", "fulfillmentEffects"]), completeness: "ALL_INVENTORIES_AND_RECONCILED_FACTS_AND_REVIEWED_MAPPING" }),
  research: Object.freeze(["MINIMUM_VIABLE_LIQUIDITY", "DYNAMIC_SAFETY_TARGET", "HIGH_COST_DEBT_CLASSIFICATION", "GOAL_SUSTAINABILITY", "IRREGULAR_INCOME_NORMALIZATION", "ANNUAL_PERIODIZATION", "PROTECTION", "TAX_LEGAL", "LIQUIDITY_HAIRCUT", "RISK_CAPACITY", "RISK_TOLERANCE", "ASSET_ALLOCATION", "OPTIONALITY"]),
});
