import type { Asset, CapitalAssignment, FinancialClaim, FinancialResource, ResourceAllocation } from "../schemas/index.ts";
import { decimalProduct, decimalSum } from "./decimal-arithmetic.ts";

export interface ResourceValidationResult { valid:boolean; codes:string[] }
export interface ResourceValidationContext {
  incomeIds?: string[];
  claims?: FinancialClaim[];
  allocations?: ResourceAllocation[];
  /** Required to certify whether a dated resource can fund a claim now. */
  asOf?: string;
}

const resourceTypes = new Set(["CURRENT_CASH", "MONTHLY_SURPLUS", "SAFETY_CAPITAL", "GOAL_CAPITAL", "LONG_TERM_CAPITAL", "FUTURE_INCOME", "EXTERNAL_SUPPORT", "CREDIT_AVAILABILITY"]);
const assetTypes = new Set(["CASH","DEPOSIT","STOCKS","FUNDS","BONDS","CRYPTO","REAL_ESTATE","BUSINESS","OTHER"]);
const ownerships = new Set(["SOLE", "JOINT", "EXTERNAL", "UNKNOWN"]);
const availabilities = new Set(["AVAILABLE", "RESERVED", "RESTRICTED", "LOCKED", "UNSETTLED", "UNKNOWN"]);
const claimTypes = new Set(["NECESSARY_LIVING", "DEBT_MINIMUM", "DELINQUENT_DEBT", "IMMEDIATE_OBLIGATION", "SAFETY_BUFFER", "DEBT_ACCELERATION", "GOAL_FUNDING", "HUMAN_CAPITAL", "BUSINESS_CAPITAL", "LONG_TERM_GROWTH", "EXPERIMENTAL", "TRADING_COST_OPTIMIZATION"]);
const dataSources = new Set(["USER_REPORTED", "CALCULATED", "VERIFIED", "IMPORTED"]);
const liquidities = ["IMMEDIATE", "SHORT", "LIMITED", "ILLIQUID"];
const purposes = new Set(["OPERATING", "SAFETY", "GOAL", "LONG_TERM", "BUSINESS", "EXPERIMENTAL", "UNASSIGNED"]);
const record = (value:unknown):value is Record<string,unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const nonempty = (value:unknown):value is string => typeof value === "string" && value.trim().length > 0;
const strings = (value:unknown):value is string[] => Array.isArray(value) && value.every(nonempty) && new Set(value).size === value.length;
const finiteAmount = (value:unknown):value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;
const result = (codes:string[]):ResourceValidationResult => ({ valid:codes.length === 0, codes:[...new Set(codes)] });

/** A tagged UNKNOWN/N/A is representable, but cannot certify a safe amount. */
function amount(value:unknown, legacy = false):number|null {
  if (!record(value)) return null;
  if (legacy && !("status" in value)) return finiteAmount(value.value) && typeof value.source==="string" && dataSources.has(value.source) && date(value.updatedAt)!==null ? value.value : null;
  return value.status === "KNOWN" && record(value.data) && finiteAmount(value.data.value)
    && typeof value.data.source === "string" && dataSources.has(value.data.source) && date(value.data.updatedAt) !== null ? value.data.value : null;
}

function date(value:unknown):number|null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/u.test(value)) return null;
  const parsed = Date.parse(value);
  const calendar = Date.parse(value.slice(0,10));
  return Number.isFinite(parsed) && Number.isFinite(calendar) && new Date(calendar).toISOString().slice(0,10) === value.slice(0,10) ? parsed : null;
}

function availableDate(value:unknown):number|null {
  return record(value) && value.status==="KNOWN" && record(value.data) && typeof value.data.source==="string" && dataSources.has(value.data.source)
    && date(value.data.updatedAt)!==null ? date(value.data.value) : null;
}

function qualityValid(resource:FinancialResource):boolean {
  return ["KNOWN","ESTIMATED","UNKNOWN"].includes(resource.valuationStatus) && ["HIGH","MEDIUM","LOW"].includes(resource.certainty) && dataSources.has(resource.source);
}

function restrictionValid(resource:FinancialResource):boolean {
  const restriction:unknown = resource.restriction;
  return record(restriction) && nonempty(restriction.reasonCode) && typeof restriction.allowsCurrentFunding === "boolean"
    && (restriction.allowedClaimIds === undefined || strings(restriction.allowedClaimIds))
    && (restriction.allowedClaimTypes === undefined || strings(restriction.allowedClaimTypes) && restriction.allowedClaimTypes.every((type) => claimTypes.has(type)));
}

function jointFraction(resource:FinancialResource):number|null {
  const joint:unknown = resource.jointOwnership;
  return record(joint) && typeof joint.ownedFraction === "number" && Number.isFinite(joint.ownedFraction)
    && joint.ownedFraction > 0 && joint.ownedFraction <= 1 && typeof joint.allocationConsent === "boolean" ? joint.ownedFraction : null;
}

/** Asset is economic identity; Resources are bounded views; Assignments are uses, not new assets. */
export function validateResourceLineage(assets:Asset[], resources:FinancialResource[], assignments:CapitalAssignment[], context:ResourceValidationContext = {}):ResourceValidationResult {
  const codes:string[] = [];
  if (!Array.isArray(assets) || !Array.isArray(resources) || !Array.isArray(assignments)) return result(["RESOURCE_INVENTORY_MUST_BE_ARRAYS"]);
  if (!record(context)) return result(["INVALID_RESOURCE_VALIDATION_CONTEXT"]);
  if (context.incomeIds!==undefined && !strings(context.incomeIds)) codes.push("INVALID_RESOURCE_INCOME_INVENTORY");
  const incomeIds=strings(context.incomeIds)?context.incomeIds:[];
  if (context.claims!==undefined && !Array.isArray(context.claims)) codes.push("INVALID_RESOURCE_CLAIM_INVENTORY");
  const claims=(Array.isArray(context.claims)?context.claims:[]).filter((claim)=>record(claim) && nonempty(claim.id));
  if (Array.isArray(context.claims) && claims.length!==context.claims.length) codes.push("INVALID_RESOURCE_CLAIM_INVENTORY");
  if (claims.some((claim)=>!claimTypes.has(claim.claimType) || !strings(claim.eligibleResources) || !["CREATED","ACTIVE","FULFILLED","EXPIRED","CANCELLED"].includes(claim.lifecycleStatus)
    || !["IMMEDIATE","NEAR_TERM","LATER"].includes(claim.urgency))) codes.push("INVALID_RESOURCE_CLAIM_REFERENCE_CONTRACT");
  if (new Set(claims.map((claim)=>claim.id)).size!==claims.length) codes.push("DUPLICATE_RESOURCE_CLAIM_ID");
  if (context.allocations!==undefined && !Array.isArray(context.allocations)) codes.push("INVALID_RESOURCE_ALLOCATION_INVENTORY");
  const allocations=(Array.isArray(context.allocations)?context.allocations:[]).filter((allocation)=>record(allocation));
  if (Array.isArray(context.allocations) && allocations.length!==context.allocations.length) codes.push("INVALID_RESOURCE_ALLOCATION_INVENTORY");
  if (context.asOf!==undefined && date(context.asOf)===null) codes.push("INVALID_RESOURCE_EVALUATION_DATE");
  const asOf=typeof context.asOf==="string"?context.asOf:undefined;
  const assetMap = new Map<string,Asset>();
  const resourceMap = new Map<string,FinancialResource>();
  const assignmentMap = new Map<string,CapitalAssignment>();
  const claimMap = new Map(claims.map((claim) => [claim.id, claim]));
  for (const asset of assets) {
    if (!record(asset) || !nonempty(asset.id)) { codes.push("INVALID_ASSET_ID"); continue; }
    if (assetMap.has(asset.id)) codes.push("DUPLICATE_ASSET_ID");
    assetMap.set(asset.id, asset);
    if (!assetTypes.has(asset.type) || !liquidities.includes(asset.liquidity) || !purposes.has(asset.purpose) || asset.ownership!==undefined && !ownerships.has(asset.ownership)) codes.push("INVALID_ASSET_CLASSIFICATION");
    if (amount(asset.currentValue, true) === null) codes.push("ASSET_VALUE_UNCALCULABLE");
    if (asset.availableEconomicValue !== undefined) {
      const available = amount(asset.availableEconomicValue);
      const current = amount(asset.currentValue, true);
      if (available === null || current === null || available > current) codes.push("INVALID_AVAILABLE_ECONOMIC_VALUE");
    }
  }
  for (const assignment of assignments) {
    if (!record(assignment) || !nonempty(assignment.id)) { codes.push("INVALID_CAPITAL_ASSIGNMENT_ID"); continue; }
    if (assignmentMap.has(assignment.id)) codes.push("DUPLICATE_CAPITAL_ASSIGNMENT_ID");
    assignmentMap.set(assignment.id, assignment);
    if (!nonempty(assignment.assetId) || assignment.claimId!==undefined && !nonempty(assignment.claimId)) codes.push("INVALID_CAPITAL_ASSIGNMENT_REFERENCE");
    if (!assetMap.has(assignment.assetId)) codes.push("CAPITAL_ASSIGNMENT_ASSET_NOT_FOUND");
    if (!purposes.has(assignment.purpose)) codes.push("INVALID_CAPITAL_ASSIGNMENT_PURPOSE");
    if (amount(assignment.amount) === null) codes.push("CAPITAL_ASSIGNMENT_AMOUNT_UNCALCULABLE");
    if (assignment.claimId !== undefined && context.claims !== undefined && !claimMap.has(assignment.claimId)) codes.push("CAPITAL_ASSIGNMENT_CLAIM_NOT_FOUND");
  }
  for (const resource of resources) {
    if (!record(resource) || !nonempty(resource.id)) { codes.push("INVALID_RESOURCE_ID"); continue; }
    if (resourceMap.has(resource.id)) codes.push("DUPLICATE_RESOURCE_ID");
    resourceMap.set(resource.id, resource);
    if (!resourceTypes.has(resource.type) || !ownerships.has(resource.ownership) || !availabilities.has(resource.availability)
      || !liquidities.includes(resource.liquidity) || !purposes.has(resource.purpose)) codes.push("INVALID_RESOURCE_CLASSIFICATION");
    if (!qualityValid(resource)) codes.push("INVALID_RESOURCE_QUALITY_METADATA");
    const start=availableDate(resource.availableFrom);
    if (start===null) codes.push("RESOURCE_AVAILABILITY_DATE_UNRESOLVED");
    else if (context.asOf!==undefined && date(context.asOf)!==null && start>date(context.asOf)! && resource.availability==="AVAILABLE" && ["CURRENT_CASH","SAFETY_CAPITAL","GOAL_CAPITAL","LONG_TERM_CAPITAL"].includes(resource.type)) codes.push("RESOURCE_AVAILABLE_IN_FUTURE");
    if (amount(resource.amount) === null) codes.push("RESOURCE_AMOUNT_UNCALCULABLE");
    if (!strings(resource.reservedForClaimIds)) codes.push("INVALID_RESOURCE_RESERVATIONS");
    if (resource.availability === "RESERVED" && (!Array.isArray(resource.reservedForClaimIds) || resource.reservedForClaimIds.length === 0)) codes.push("RESERVED_RESOURCE_WITHOUT_CLAIM");
    if (resource.availability === "AVAILABLE" && Array.isArray(resource.reservedForClaimIds) && resource.reservedForClaimIds.length > 0) codes.push("AVAILABLE_RESOURCE_HAS_RESERVATIONS");
    if (resource.availability === "RESTRICTED" && !restrictionValid(resource)) codes.push("RESTRICTED_RESOURCE_REQUIRES_SEMANTICS");
    if (resource.restriction !== undefined && (!restrictionValid(resource) || resource.availability === "AVAILABLE")) codes.push("RESTRICTION_AVAILABILITY_MISMATCH");
    if (resource.ownership === "JOINT" && jointFraction(resource) === null) codes.push("JOINT_OWNERSHIP_REQUIRES_SHARE_AND_CONSENT");
    if (resource.ownership !== "JOINT" && resource.jointOwnership !== undefined) codes.push("JOINT_OWNERSHIP_CLASSIFICATION_MISMATCH");
    if (resource.type === "FUTURE_INCOME" && resource.certainty === "HIGH") codes.push("FUTURE_INCOME_CERTAINTY_TOO_HIGH");
    if (resource.type === "EXTERNAL_SUPPORT" && resource.ownership !== "EXTERNAL") codes.push("EXTERNAL_SUPPORT_NOT_OWNED_CAPITAL");
    if (resource.type === "CREDIT_AVAILABILITY" && ["SOLE","JOINT"].includes(resource.ownership)) codes.push("CREDIT_AVAILABILITY_NOT_OWNED_CAPITAL");
    const assetBacked = ["CURRENT_CASH", "SAFETY_CAPITAL", "GOAL_CAPITAL", "LONG_TERM_CAPITAL"].includes(resource.type);
    if (assetBacked && !nonempty(resource.underlyingAssetId)) codes.push("RESOURCE_REQUIRES_UNDERLYING_ASSET");
    if (resource.underlyingAssetId !== undefined && !assetMap.has(resource.underlyingAssetId)) codes.push("RESOURCE_ASSET_NOT_FOUND");
    if (["FUTURE_INCOME", "MONTHLY_SURPLUS"].includes(resource.type) && (!nonempty(resource.underlyingIncomeId) || !incomeIds.includes(resource.underlyingIncomeId))) codes.push("RESOURCE_INCOME_NOT_FOUND");
    if (["FUTURE_INCOME", "EXTERNAL_SUPPORT", "CREDIT_AVAILABILITY", "MONTHLY_SURPLUS"].includes(resource.type) && resource.underlyingAssetId !== undefined) codes.push("NONSTOCK_RESOURCE_CANNOT_REUSE_ASSET");
    if (context.claims !== undefined && Array.isArray(resource.reservedForClaimIds) && resource.reservedForClaimIds.some((id) => !claimMap.has(id))) codes.push("RESOURCE_RESERVED_CLAIM_NOT_FOUND");
    const asset = assetMap.get(resource.underlyingAssetId ?? "");
    if (asset) {
      const assetOwnership = asset.ownership ?? "SOLE";
      if (assetOwnership !== resource.ownership) codes.push("RESOURCE_ASSET_OWNERSHIP_MISMATCH");
      if (liquidities.indexOf(resource.liquidity) < liquidities.indexOf(asset.liquidity)) codes.push("RESOURCE_LIQUIDITY_EXCEEDS_ASSET");
      if (resource.type === "CURRENT_CASH" && !["CASH", "DEPOSIT"].includes(asset.type)) codes.push("CURRENT_CASH_REQUIRES_CASH_ASSET");
    }
  }
  for (const asset of assetMap.values()) {
    const views = [...resourceMap.values()].filter((item) => item.underlyingAssetId === asset.id);
    const uses = [...assignmentMap.values()].filter((item) => item.assetId === asset.id);
    let budget = asset.availableEconomicValue === undefined
      ? ((asset.ownership ?? "SOLE") === "SOLE" && ["CASH", "DEPOSIT"].includes(asset.type) && asset.liquidity === "IMMEDIATE" ? amount(asset.currentValue, true) : null)
      : amount(asset.availableEconomicValue);
    if (asset.ownership === "EXTERNAL" || asset.ownership === "UNKNOWN") budget = null;
    if (asset.ownership === "JOINT") {
      const shares = views.map(jointFraction);
      if (shares.length === 0 || shares.some((share) => share === null) || new Set(shares).size !== 1) { codes.push("JOINT_ASSET_ECONOMIC_SHARE_UNRESOLVED"); budget = null; }
      else if (budget !== null) budget=decimalProduct(budget,shares[0]!);
    }
    if (budget!==null && !Number.isFinite(budget)) budget=null;
    if (budget === null && (views.length > 0 || uses.length > 0)) codes.push("AVAILABLE_ECONOMIC_VALUE_UNCALCULABLE");
    const resourceTotal = decimalSum(views.map(item=>amount(item.amount)??0));
    const assignmentTotal = decimalSum(uses.map(item=>amount(item.amount)??0));
    if (!Number.isFinite(resourceTotal)) codes.push("RESOURCE_AMOUNT_AGGREGATE_UNCALCULABLE");
    if (!Number.isFinite(assignmentTotal)) codes.push("CAPITAL_ASSIGNMENT_AGGREGATE_UNCALCULABLE");
    const resourceOverallocated = budget !== null && resourceTotal > budget;
    if (resourceOverallocated) codes.push("UNDERLYING_ASSET_RESOURCE_OVERALLOCATION");
    if (budget !== null && assignmentTotal > budget) codes.push("CAPITAL_ASSIGNMENT_OVERALLOCATION");
    // Already overallocated views have a decisive legacy diagnostic. For bounded views,
    // explicit partitions are additionally mandatory even when amounts fit the asset.
    if (views.some((view) => view.partitionAssignmentIds !== undefined) || views.length > 1 && !resourceOverallocated) {
      const consumed = new Set<string>();
      for (const view of views) {
        if (view.partitionAssignmentIds === undefined && (views.length === 1 || resourceOverallocated)) continue;
        if (!strings(view.partitionAssignmentIds) || view.partitionAssignmentIds.length === 0) { codes.push("DUPLICATE_ECONOMIC_RESOURCE_REQUIRES_PARTITION"); continue; }
        let partitionTotal = 0;
        for (const id of view.partitionAssignmentIds) {
          const assignment = assignmentMap.get(id);
          if (consumed.has(id)) codes.push("RESOURCE_PARTITION_ASSIGNMENT_REUSED");
          consumed.add(id);
          if (!assignment || assignment.assetId !== asset.id || assignment.purpose !== view.purpose) codes.push("RESOURCE_PARTITION_ASSIGNMENT_MISMATCH");
          else partitionTotal=decimalSum([partitionTotal,amount(assignment.amount)??0]);
        }
        if (!Number.isFinite(partitionTotal)) codes.push("RESOURCE_PARTITION_AMOUNT_UNCALCULABLE");
        else if (amount(view.amount) !== partitionTotal) codes.push("RESOURCE_PARTITION_AMOUNT_MISMATCH");
      }
    }
  }
  if (context.allocations !== undefined && context.claims === undefined) codes.push("ALLOCATIONS_REQUIRE_CLAIM_INVENTORY");
  for (const allocation of allocations) {
    if (!nonempty(allocation.resourceId) || !nonempty(allocation.capitalAssignmentId) || !nonempty(allocation.claimId)) {codes.push("INVALID_RESOURCE_ALLOCATION_REFERENCE");continue;}
    const resource = resourceMap.get(allocation.resourceId);
    const assignment = assignmentMap.get(allocation.capitalAssignmentId);
    const claim = claimMap.get(allocation.claimId);
    if (!finiteAmount(allocation.amount)) codes.push("RESOURCE_ALLOCATION_AMOUNT_UNCALCULABLE");
    if (!resource || !assignment || !claim) { codes.push("RESOURCE_ALLOCATION_REFERENCE_NOT_FOUND"); continue; }
    if (assignment.assetId !== resource.underlyingAssetId || assignment.claimId !== claim.id || assignment.purpose !== resource.purpose) codes.push("RESOURCE_ALLOCATION_ASSIGNMENT_MISMATCH");
    if (resource.partitionAssignmentIds !== undefined && (!strings(resource.partitionAssignmentIds) || !resource.partitionAssignmentIds.includes(assignment.id))) codes.push("RESOURCE_ALLOCATION_OUTSIDE_PARTITION");
    codes.push(...validateResourceClaimCompatibility(resource, claim, asOf).codes);
  }
  for (const resource of resourceMap.values()) {
    const allocated = decimalSum(allocations.filter(item=>item.resourceId===resource.id).map(item=>finiteAmount(item.amount)?item.amount:0));
    if (!Number.isFinite(allocated)) codes.push("RESOURCE_ALLOCATION_AMOUNT_UNCALCULABLE");
    const available = amount(resource.amount);
    if (available !== null && allocated > available) codes.push("RESOURCE_ALLOCATION_OVERALLOCATION");
  }
  for (const assignment of assignmentMap.values()) {
    const allocated = decimalSum(allocations.filter(item=>item.capitalAssignmentId===assignment.id).map(item=>finiteAmount(item.amount)?item.amount:0));
    if (!Number.isFinite(allocated)) codes.push("ASSIGNMENT_FUNDING_AGGREGATE_UNCALCULABLE");
    const available = amount(assignment.amount);
    if (available !== null && allocated > available) codes.push("ASSIGNMENT_FUNDING_OVERALLOCATION");
  }
  return result(codes);
}

/** Compatibility uses declared constraints only; it does not invent allocation policy. */
export function validateResourceClaimCompatibility(resource:FinancialResource, claim:FinancialClaim, asOf?:string):ResourceValidationResult {
  const codes:string[] = [];
  if (!record(resource) || !record(claim)) return result(["RESOURCE_CLAIM_REFERENCE_NOT_FOUND"]);
  if (!resourceTypes.has(resource.type) || !ownerships.has(resource.ownership) || !availabilities.has(resource.availability)
    || !liquidities.includes(resource.liquidity) || !purposes.has(resource.purpose)) codes.push("INVALID_RESOURCE_CLASSIFICATION");
  if (!qualityValid(resource)) codes.push("INVALID_RESOURCE_QUALITY_METADATA");
  if (["CURRENT_CASH","SAFETY_CAPITAL","GOAL_CAPITAL","LONG_TERM_CAPITAL"].includes(resource.type) && !nonempty(resource.underlyingAssetId)) codes.push("RESOURCE_REQUIRES_UNDERLYING_ASSET");
  if (resource.partitionAssignmentIds!==undefined && (!strings(resource.partitionAssignmentIds) || resource.partitionAssignmentIds.length===0)) codes.push("INVALID_RESOURCE_PARTITION_REFERENCE");
  if (!strings(resource.reservedForClaimIds)) return result([...codes, "INVALID_RESOURCE_RESERVATIONS"]);
  if (!strings(claim.eligibleResources) || !claimTypes.has(claim.claimType)) return result([...codes, "INVALID_CLAIM_RESOURCE_CONTRACT"]);
  if (!nonempty(claim.id) || !["IMMEDIATE","NEAR_TERM","LATER"].includes(claim.urgency)) codes.push("INVALID_CLAIM_RESOURCE_CONTRACT");
  if (amount(resource.amount) === null) codes.push("RESOURCE_AMOUNT_UNCALCULABLE");
  if (["FUTURE_INCOME", "EXTERNAL_SUPPORT", "CREDIT_AVAILABILITY", "MONTHLY_SURPLUS"].includes(resource.type)) codes.push("NONCURRENT_RESOURCE_CANNOT_FUND_OWNED_CLAIM");
  if (resource.ownership === "EXTERNAL" || resource.ownership === "UNKNOWN") codes.push("RESOURCE_NOT_CONFIRMED_OWNED");
  if (resource.ownership === "JOINT" && (jointFraction(resource) === null || resource.jointOwnership?.allocationConsent !== true)) codes.push("JOINT_RESOURCE_ALLOCATION_NOT_AUTHORIZED");
  if (!["AVAILABLE", "RESERVED", "RESTRICTED"].includes(resource.availability)) codes.push("RESOURCE_NOT_CURRENTLY_AVAILABLE");
  if (resource.availability === "RESERVED" && !resource.reservedForClaimIds?.includes(claim.id)) codes.push("RESOURCE_RESERVED_FOR_ANOTHER_CLAIM");
  if (resource.availability === "AVAILABLE" && resource.reservedForClaimIds?.length > 0) codes.push("AVAILABLE_RESOURCE_HAS_RESERVATIONS");
  if (resource.availability==="AVAILABLE" && resource.restriction!==undefined) codes.push("RESTRICTION_AVAILABILITY_MISMATCH");
  if (resource.availability === "RESTRICTED" || resource.restriction !== undefined) {
    if (!restrictionValid(resource) || !resource.restriction?.allowsCurrentFunding) codes.push("RESOURCE_RESTRICTION_BLOCKS_FUNDING");
    else if ((resource.restriction.allowedClaimIds !== undefined && !resource.restriction.allowedClaimIds.includes(claim.id))
      || (resource.restriction.allowedClaimTypes !== undefined && !resource.restriction.allowedClaimTypes.includes(claim.claimType))) codes.push("RESOURCE_RESTRICTION_CLAIM_MISMATCH");
  }
  if (claim.urgency === "IMMEDIATE" && resource.liquidity !== "IMMEDIATE") codes.push("RESOURCE_NOT_IMMEDIATELY_LIQUID");
  if (claim.lifecycleStatus !== "ACTIVE") codes.push("CLAIM_NOT_ACTIVE_FOR_FUNDING");
  if (!claim.eligibleResources?.includes(resource.id)) codes.push("RESOURCE_NOT_ELIGIBLE_FOR_CLAIM");
  const now = date(asOf);
  const start = availableDate(resource.availableFrom);
  if (now === null || start === null) codes.push("RESOURCE_AVAILABILITY_DATE_UNRESOLVED");
  else if (start > now) codes.push("RESOURCE_AVAILABLE_IN_FUTURE");
  return result(codes);
}

/** A resource classification alone does not certify lineage; call the validator first. */
export function isFreeOwnedCash(resource:FinancialResource, asOf?:string):boolean {
  const now = asOf === undefined ? null : date(asOf);
  const start = availableDate(resource?.availableFrom);
  return record(resource) && resource.type === "CURRENT_CASH" && resource.ownership === "SOLE" && resource.availability === "AVAILABLE"
    && resource.liquidity === "IMMEDIATE" && amount(resource.amount) !== null && nonempty(resource.underlyingAssetId)
    && ["UNASSIGNED", "OPERATING"].includes(resource.purpose)
    && Array.isArray(resource.reservedForClaimIds) && resource.reservedForClaimIds.length === 0 && resource.restriction === undefined
    && qualityValid(resource) && start!==null
    && (asOf === undefined || now !== null && start !== null && start <= now);
}
