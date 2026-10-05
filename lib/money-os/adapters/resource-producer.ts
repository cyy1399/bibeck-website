import type { Asset } from "../../money-model/contracts/financial-profile.schema.ts";
import type { DomainValue, CapitalAssignment, FinancialResource } from "../../money-model/index.ts";
import { decimalSum } from "../../money-model/arithmetic/decimal-arithmetic.ts";
import { unknown } from "../../money-model/contracts/domain-value.schema.ts";
import { validateResourceLineage } from "../../money-model/runtime/resource-validator.ts";
import { toDomainField } from "./domain-value-codec.ts";
import { fromDomainNumber, toDomainNumber } from "./money-codec.ts";
import type { AdapterSource, DomainCollections, ResourceProduction } from "../contracts/producer-manifest.ts";

/** Deterministic economic views; no realization haircut, consent guess or allocation policy. */
export function produceResources(source: AdapterSource, collections: DomainCollections, assets: Asset[]): ResourceProduction {
  const result: ResourceProduction = { resources: [], assignments: [], limitations: [], coveredAssetIds: [] };
  const limit = (code: string, fieldRef: string) => result.limitations.push({ code, fieldRefs: [fieldRef], kind: "UNRESOLVED_SOURCE" });
  for (const record of collections.assignments ?? []) {
    const fact = source.facts.assignments?.[record.id];
    if (!fact) { limit("ASSIGNMENT_FACTS_MISSING", `assignments.${record.id}`); continue; }
    result.assignments.push({ id: record.id, ...fact, amount: (record.values.amount?.value ?? unknown("NOT_PROVIDED")) as DomainValue<number> });
  }
  for (const asset of assets) {
    const fact = source.facts.assets![asset.id];
    if (fact.availability === "UNKNOWN") limit("RESOURCE_AVAILABILITY_UNKNOWN", `assets.${asset.id}.availability`);
    if (asset.ownership !== "SOLE" || !["CASH", "DEPOSIT"].includes(asset.type) || asset.liquidity !== "IMMEDIATE") {
      limit("RESOURCE_REALIZATION_OR_OWNERSHIP_UNSUPPORTED", `assets.${asset.id}`); continue;
    }
    const value = asset.availableEconomicValue ?? asset.currentValue as DomainValue<number>;
    const uses = result.assignments.filter(item => item.assetId === asset.id);
    if (value.status !== "KNOWN" || uses.some(item => item.amount.status !== "KNOWN")) {
      limit("RESOURCE_VALUE_OR_PARTITION_UNKNOWN", `assets.${asset.id}`); continue;
    }
    const used = decimalSum(uses.map(item => item.amount.status === "KNOWN" ? item.amount.data.value : 0));
    const residual = decimalSum([value.data.value, -used]);
    const canonical = fromDomainNumber(residual);
    const representable = canonical.ok ? toDomainNumber(canonical.value) : canonical;
    if (!representable.ok || residual < 0 || !Number.isFinite(used)) {
      limit("RESOURCE_PARTITION_OVERALLOCATION", `assets.${asset.id}`); continue;
    }
    const partitions: CapitalAssignment[] = [...uses];
    // Explicit remainder view shares one asset; it is NOT a new economic asset.
    if (uses.length && residual > 0) {
      const remainder: CapitalAssignment = { id: `remainder:${asset.id}`, assetId: asset.id, purpose: asset.purpose,
        amount: { status: "KNOWN", data: { value: residual, source: "CALCULATED", updatedAt: source.envelope.basis.asOf } } };
      result.assignments.push(remainder); partitions.push(remainder);
    }
    const date = fact.availableFrom ? toDomainField(fact.availableFrom, { unit: "DATE" }) : undefined;
    const availableFrom = (date?.ok ? date.value.value : unknown("NOT_PROVIDED")) as DomainValue<string>;
    const views = partitions.length ? partitions : [{ id: `whole:${asset.id}`, assetId: asset.id, purpose: asset.purpose, amount: value }];
    for (const view of views) {
      const resource: FinancialResource = {
        id: `resource:${view.id}`, type: "CURRENT_CASH", underlyingAssetId: asset.id,
        amount: view.amount, ownership: "SOLE", availability: fact.availability, liquidity: asset.liquidity,
        valuationStatus: "KNOWN", purpose: view.purpose, availableFrom, reservedForClaimIds: [],
        source: "USER_REPORTED", certainty: "LOW",
        ...(partitions.length ? { partitionAssignmentIds: [view.id] } : {}),
        ...(fact.restriction ? { restriction: fact.restriction, restrictionReason: fact.restriction.reasonCode } : {}),
      };
      if ("claimId" in view && view.claimId) {
        resource.reservedForClaimIds = [view.claimId];
        if (resource.availability === "AVAILABLE") resource.availability = "RESERVED";
      }
      result.resources.push(resource);
    }
    result.coveredAssetIds.push(asset.id);
  }
  // Unknowns/unsupported mappings stay limitations, not a forged conservation certificate.
  const validation = validateResourceLineage(assets, result.resources, result.assignments, { asOf: source.envelope.basis.asOf });
  for (const code of validation.codes) limit(code, "resources");
  return result;
}
