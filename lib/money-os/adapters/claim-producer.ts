import type { FinancialProfile, DomainValue, CapitalAssignment, FinancialResource } from "../../money-model/index.ts";
import { readInput } from "../../money-model/runtime/input-value.ts";
import { deriveFundingStatus } from "../../money-model/runtime/claim-validator.ts";
import { decimalSum } from "../../money-model/arithmetic/decimal-arithmetic.ts";
import { unknown } from "../../money-model/contracts/domain-value.schema.ts";
import { toDomainField } from "./domain-value-codec.ts";
import { fromDomainNumber, toDomainNumber } from "./money-codec.ts";
import type { AdapterSource, ClaimProduction } from "../contracts/producer-manifest.ts";

/** Missing reviewed priority/urgency/effect mappings MUST NOT become enum defaults. */
export function produceClaims(source: AdapterSource, profile: FinancialProfile, assignments: CapitalAssignment[], resources: FinancialResource[], assignmentsComplete: boolean): ClaimProduction {
  const result: ClaimProduction = { claims: [], candidates: [], limitations: [], complete: false };
  const limit = (code: string, fieldRefs: string[], kind: "MISSING_SOURCE" | "UNSUPPORTED_MAPPING" | "UNRESOLVED_SOURCE" = "UNSUPPORTED_MAPPING") => result.limitations.push({ code, fieldRefs, kind });
  for (const intent of source.claimIntents ?? []) {
    const origin = intent.sourceCollection === "obligations" ? profile.obligations.find(item => item.id === intent.sourceId)?.amount
      : intent.sourceCollection === "goals" ? profile.goals.find(item => item.id === intent.sourceId)?.targetAmount
      : undefined;
    const occurrenceAmount = intent.occurrenceAmount ? toDomainField(intent.occurrenceAmount, { unit: "MONEY", primaryCurrency: source.envelope.basis.primaryCurrency }) : undefined;
    const amount: DomainValue<number> = occurrenceAmount?.ok ? occurrenceAmount.value.value as DomainValue<number> : readInput(origin);
    const sourceDate = intent.dueDate ?? source.envelope.collections[intent.sourceCollection]?.find(item => item.id === intent.sourceId)?.values[intent.sourceCollection === "goals" ? "targetDate" : "dueDate"];
    const date = sourceDate ? toDomainField(sourceDate, { unit: "DATE" }) : undefined;
    const dueDate = (date?.ok ? date.value.value : unknown("NOT_PROVIDED")) as DomainValue<string>;
    const uses = assignments.filter(item => item.claimId === intent.id);
    let fundedAmount: DomainValue<number> = unknown("ASSIGNMENT_DISCOVERY_INCOMPLETE");
    if (assignmentsComplete) {
      const usable = uses.every(item => resources.some(resource => resource.underlyingAssetId === item.assetId && resource.ownership === "SOLE"
        && ["AVAILABLE", "RESERVED"].includes(resource.availability) && resource.restriction === undefined
        && resource.availableFrom.status === "KNOWN" && resource.availableFrom.data.value <= source.envelope.basis.asOf
        && resource.partitionAssignmentIds?.includes(item.id) && resource.reservedForClaimIds.includes(intent.id)));
      if (uses.every(item => item.amount.status === "KNOWN") && usable) {
        const sum = decimalSum(uses.map(item => item.amount.status === "KNOWN" ? item.amount.data.value : 0));
        const canonical = fromDomainNumber(sum), bridge = canonical.ok ? toDomainNumber(canonical.value) : canonical;
        if (bridge.ok) fundedAmount = { status: "KNOWN", data: { value: bridge.value, source: "CALCULATED", updatedAt: source.envelope.basis.asOf } };
      } else fundedAmount = unknown(usable ? "FUNDING_AMOUNT_UNKNOWN" : "FUNDING_RESOURCE_NOT_AVAILABLE");
    }
    const fundingStatus = deriveFundingStatus({ amount, fundedAmount });
    const debtPayment = intent.debtPayment ? Object.fromEntries(Object.entries(intent.debtPayment).map(([key, field]) => {
      const parsed = toDomainField(field, { unit: "MONEY", primaryCurrency: source.envelope.basis.primaryCurrency });
      return [key, parsed.ok ? parsed.value.value : unknown("NOT_PROVIDED")];
    })) as { principal: DomainValue<number>; interest: DomainValue<number>; fees: DomainValue<number> } : undefined;
    result.candidates.push({ id: intent.id, claimType: intent.claimType, sourceCollection: intent.sourceCollection, sourceId: intent.sourceId,
      lifecycleStatus: intent.lifecycleStatus, ...(intent.occurrence ? { occurrence: intent.occurrence } : {}), amount, dueDate, fundedAmount, fundingStatus, ...(debtPayment ? { debtPayment } : {}), mappingStatus: "UNSUPPORTED" });
    limit("CLAIM_MAPPING_REVIEW_REQUIRED", [`claimIntents.${intent.id}`]);
    if (intent.lifecycleStatus === "FULFILLED" && fundingStatus !== "FUNDED") limit("FULFILLMENT_NOT_CERTIFIED", [`claimIntents.${intent.id}`], "UNRESOLVED_SOURCE");
    if (intent.sourceCollection === "liabilities" && (!debtPayment || Object.values(debtPayment).some(value => value.status !== "KNOWN"))) {
      limit("DEBT_PAYMENT_BREAKDOWN_UNKNOWN", [`claimIntents.${intent.id}.debtPayment`], "UNRESOLVED_SOURCE");
    }
    if (debtPayment && amount.status === "KNOWN" && Object.values(debtPayment).every(value => value.status === "KNOWN")
      && decimalSum(Object.values(debtPayment).map(value => value.status === "KNOWN" ? value.data.value : 0)) !== amount.data.value) limit("DEBT_PAYMENT_COMPONENT_SUM_MISMATCH", [`claimIntents.${intent.id}.debtPayment`], "UNRESOLVED_SOURCE");
  }
  // Reconcile facts even if the caller supplied an empty claim array.
  for (const debt of profile.liabilities) {
    const balance = readInput(debt.balance), payment = readInput(debt.minimumMonthlyPayment);
    if (balance.status !== "KNOWN" || payment.status !== "KNOWN" || balance.data.value > 0 || payment.data.value > 0) limit("DEBT_CLAIM_COVERAGE_UNSUPPORTED", [`liabilities.${debt.id}`]);
  }
  for (const obligation of profile.obligations) if (obligation.required) limit("OBLIGATION_CLAIM_COVERAGE_UNSUPPORTED", [`obligations.${obligation.id}`]);
  for (const goal of profile.goals) if (goal.status === undefined || goal.status === "ACTIVE") limit("GOAL_CLAIM_COVERAGE_UNSUPPORTED", [`goals.${goal.id}`]);
  const confirmed = ["claims", "liabilities", "obligations", "goals"] as const;
  if (confirmed.some(key => source.inventories[key]?.state !== "CONFIRMED" || source.inventories[key]?.scope !== "ALL") || source.claimIntents === undefined) {
    limit("CLAIM_DISCOVERY_NOT_CONFIRMED", confirmed.map(key => `inventories.${key}`), "MISSING_SOURCE");
  }
  result.complete = result.limitations.length === 0;
  return result;
}
