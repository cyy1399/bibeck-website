import type { FinancialProfile, DomainValue, NormalizationOptions } from "../../money-model/index.ts";
import { moneyModelV1Bundle } from "../../money-model/index.ts";
import { unknown } from "../../money-model/contracts/domain-value.schema.ts";
import { SOURCE_FIELDS, type SourceFieldDto, type SourceUnit } from "../contracts/source.ts";
import { accepted, rejected, plainRecord, exactKeys, type CodecResult } from "../contracts/errors.ts";
import { ADAPTER_SOURCE_VERSION, PRODUCER_BUNDLE_VERSION, inventoryKeys,
  type AdapterSource, type AdaptedProfile, type InventoryKey, type ProducerLimitation, type DomainCollections } from "../contracts/producer-manifest.ts";
import { boundedJson, parseSourceEnvelope, parseSourceField, toDomainField, toDomainEnvelope } from "./domain-value-codec.ts";
import { producerCatalog } from "./producer-catalog.ts";
import { produceResources } from "./resource-producer.ts";
import { produceClaims } from "./claim-producer.ts";

const id = (value: unknown): value is string => typeof value === "string" && /^[A-Za-z0-9_-]{1,96}$/u.test(value);
const oneOf = (...values: string[]) => (value: unknown) => typeof value === "string" && values.includes(value);
const bool = (value: unknown) => typeof value === "boolean";
const purpose = oneOf("OPERATING", "SAFETY", "GOAL", "LONG_TERM", "BUSINESS", "EXPERIMENTAL", "UNASSIGNED");
type Check = (value: unknown) => boolean;
const schemas: Record<string, { required: Record<string, Check>; optional?: Record<string, Check> }> = {
  income: { required: { type: oneOf("SALARY", "BUSINESS", "FREELANCE", "COMMISSION", "INVESTMENT", "RENTAL", "OTHER"), stability: oneOf("HIGH", "MEDIUM", "LOW", "UNKNOWN"), monthlyBasisConfirmed: bool } },
  assets: { required: { type: oneOf("CASH", "DEPOSIT", "STOCKS", "FUNDS", "BONDS", "CRYPTO", "REAL_ESTATE", "BUSINESS", "OTHER"), liquidity: oneOf("IMMEDIATE", "SHORT", "LIMITED", "ILLIQUID"), purpose,
    ownership: oneOf("SOLE", "JOINT", "EXTERNAL", "UNKNOWN"), availability: oneOf("AVAILABLE", "RESERVED", "RESTRICTED", "LOCKED", "UNSETTLED", "UNKNOWN") }, optional: { availableFrom: plainRecord, restriction: plainRecord } },
  liabilities: { required: { type: oneOf("CREDIT_CARD", "PERSONAL_LOAN", "MORTGAGE", "AUTO_LOAN", "STUDENT_LOAN", "FAMILY_LOAN", "OTHER"), secured: bool, delinquencyStatus: oneOf("CURRENT", "AT_RISK", "DELINQUENT", "DEFAULT", "UNKNOWN") }, optional: { economicPaymentId: id } },
  obligations: { required: { required: bool, recurrence: oneOf("NONE", "MONTHLY", "UNNORMALIZED") }, optional: { economicPaymentId: id, occurrence: plainRecord } },
  goals: { required: { priority: oneOf("HIGH", "MEDIUM", "LOW"), required: bool }, optional: { status: oneOf("ACTIVE", "PAUSED", "ABANDONED", "COMPLETED") } },
  assignments: { required: { assetId: id, purpose }, optional: { claimId: id } },
};
const occurrenceValid = (value: unknown, recordId: string): boolean => plainRecord(value)
  && exactKeys(value, ["templateId", "occurrenceKey"]) && id(value.templateId) && id(value.occurrenceKey) && value.templateId !== recordId;

/** S03 representation validation composes S02's single scalar/JSON codec path. */
function parseAdapterSource(input: unknown): CodecResult<AdapterSource> {
  const guard = boundedJson(input);
  if (!guard.ok) return guard;
  if (!plainRecord(input) || !exactKeys(input, ["adapterSourceVersion", "envelope", "country", "inventories", "facts"], ["expenseComponents", "claimIntents"])) return rejected("INVALID_ADAPTER_SOURCE");
  if (input.adapterSourceVersion !== ADAPTER_SOURCE_VERSION) return rejected("UNSUPPORTED_ADAPTER_SOURCE_VERSION");
  if (typeof input.country !== "string" || !/^[A-Z]{2}$/u.test(input.country) || !plainRecord(input.inventories) || !plainRecord(input.facts)) return rejected("INVALID_SOURCE_FACTS");
  const envelope = parseSourceEnvelope(input.envelope);
  if (!envelope.ok) return envelope;
  const source = JSON.parse(JSON.stringify(input)) as AdapterSource;
  source.envelope = envelope.value;
  const collections = source.envelope.collections;
  for (const [key, inventory] of Object.entries(input.inventories)) {
    if (!inventoryKeys.includes(key as InventoryKey) || !plainRecord(inventory) || !exactKeys(inventory, ["state", "scope"])
      || !oneOf("NOT_CONFIRMED", "PARTIAL", "CONFIRMED")(inventory.state)
      || !(inventory.scope === "ALL" || key === "assets" && inventory.scope === "CASH_ONLY" || key === "obligations" && oneOf("DATED_30D", "DATED_90D", "DATED_365D")(inventory.scope))) return rejected("INVALID_INVENTORY_SCOPE", "inventories");
  }
  const scalar = (field: unknown, unit: SourceUnit, fieldRef: string): CodecResult<SourceFieldDto> => {
    const parsed = parseSourceField(field, { unit });
    if (!parsed.ok) return rejected(parsed.error.safeCode, fieldRef);
    const domain = toDomainField(parsed.value, { unit, primaryCurrency: envelope.value.basis.primaryCurrency });
    if (!domain.ok) return rejected(domain.error.safeCode, fieldRef);
    if (parsed.value.value.status === "KNOWN" && parsed.value.value.data.updatedAt > envelope.value.basis.asOf) return rejected("OBSERVATION_AFTER_AS_OF", fieldRef);
    return parsed;
  };
  for (const [collection, records] of Object.entries(collections)) {
    if (records!.some(record => !id(record.id))) return rejected("INVALID_STABLE_ID", collection);
    if (["expenses", "household"].includes(collection) && records!.length > 1) return rejected("SINGLETON_COLLECTION_REQUIRED", collection);
  }
  if (!exactKeys(input.facts, [], ["expenses", ...Object.keys(schemas)])) return rejected("UNSUPPORTED_SOURCE_FACT");
  for (const [collection, entries] of Object.entries(input.facts)) {
    if (!plainRecord(entries)) return rejected("INVALID_SOURCE_FACTS", "facts");
    if (collection === "expenses") {
      if (!exactKeys(entries, [], ["aggregatesExcludeDebtAndObligations"]) || Object.hasOwn(entries, "aggregatesExcludeDebtAndObligations") && !bool(entries.aggregatesExcludeDebtAndObligations)) return rejected("INVALID_EXPENSE_FACTS");
      continue;
    }
    const schema = schemas[collection];
    for (const [recordId, fact] of Object.entries(entries)) {
      if (!collections[collection as keyof typeof collections]?.some(record => record.id === recordId)
        || !plainRecord(fact) || !exactKeys(fact, Object.keys(schema.required), Object.keys(schema.optional ?? {}))
        || Object.entries(schema.required).some(([key, check]) => !check(fact[key]))
        || Object.entries(schema.optional ?? {}).some(([key, check]) => Object.hasOwn(fact, key) && !check(fact[key]))) return rejected("INVALID_SOURCE_FACTS", `facts.${collection}`);
      if (fact.occurrence !== undefined && !occurrenceValid(fact.occurrence, recordId)) return rejected("INVALID_OCCURRENCE_IDENTITY", `facts.${collection}`);
      if (collection === "obligations" && fact.recurrence === "NONE" && fact.occurrence !== undefined) return rejected("NONRECURRING_TEMPLATE_IDENTITY");
      if (collection === "assets") {
        if (fact.restriction !== undefined && (!plainRecord(fact.restriction) || !exactKeys(fact.restriction, ["reasonCode", "allowsCurrentFunding"])
          || !id(fact.restriction.reasonCode) || fact.restriction.allowsCurrentFunding !== false || fact.availability !== "RESTRICTED")
          || fact.availability === "RESTRICTED" && fact.restriction === undefined) return rejected("INVALID_RESOURCE_RESTRICTION");
        if (fact.availableFrom !== undefined) {
          const parsed = scalar(fact.availableFrom, "DATE", `assets.${recordId}.availableFrom`);
          if (!parsed.ok) return parsed;
          source.facts.assets![recordId].availableFrom = parsed.value;
        }
      }
    }
  }
  if (input.expenseComponents !== undefined) {
    if (!Array.isArray(input.expenseComponents)) return rejected("INVALID_EXPENSE_COMPONENTS");
    const ids = new Set<string>();
    for (const component of source.expenseComponents!) {
      if (!plainRecord(component) || !exactKeys(component, ["id", "economicPaymentId", "category", "timeBasis", "amount"]) || !id(component.id) || ids.has(component.id) || !id(component.economicPaymentId)
        || !oneOf("NECESSARY", "DISCRETIONARY", "OTHER_REQUIRED")(component.category) || !oneOf("MONTHLY", "ONE_TIME", "UNNORMALIZED")(component.timeBasis)) return rejected("INVALID_EXPENSE_COMPONENTS");
      ids.add(component.id);
      const parsed = scalar(component.amount, component.timeBasis === "ONE_TIME" ? "MONEY" : "MONEY_PER_MONTH", `expenseComponents.${component.id}.amount`);
      if (!parsed.ok) return parsed;
      component.amount = parsed.value;
    }
  }
  if (input.claimIntents !== undefined) {
    if (!Array.isArray(input.claimIntents)) return rejected("INVALID_CLAIM_INTENTS");
    const ids = new Set<string>(), occurrences = new Set<string>();
    const claimTypes = oneOf("NECESSARY_LIVING", "DEBT_MINIMUM", "DELINQUENT_DEBT", "IMMEDIATE_OBLIGATION", "SAFETY_BUFFER", "DEBT_ACCELERATION", "GOAL_FUNDING", "HUMAN_CAPITAL", "BUSINESS_CAPITAL", "LONG_TERM_GROWTH", "EXPERIMENTAL", "TRADING_COST_OPTIMIZATION");
    for (const intent of source.claimIntents!) {
      if (!plainRecord(intent) || !exactKeys(intent, ["id", "claimType", "sourceCollection", "sourceId", "lifecycleStatus"], ["occurrence", "occurrenceAmount", "dueDate", "debtPayment"])
        || !id(intent.id) || ids.has(intent.id) || !claimTypes(intent.claimType) || !oneOf("expenses", "liabilities", "obligations", "goals")(intent.sourceCollection)
        || !collections[intent.sourceCollection]?.some(record => record.id === intent.sourceId)
        || !oneOf("CREATED", "ACTIVE", "FULFILLED", "EXPIRED", "CANCELLED")(intent.lifecycleStatus)) return rejected("INVALID_CLAIM_INTENT");
      ids.add(intent.id);
      const allowed = intent.sourceCollection === "expenses" ? ["NECESSARY_LIVING"] : intent.sourceCollection === "liabilities" ? ["DEBT_MINIMUM", "DELINQUENT_DEBT", "DEBT_ACCELERATION"] : intent.sourceCollection === "obligations" ? ["IMMEDIATE_OBLIGATION"] : ["GOAL_FUNDING"];
      if (!allowed.includes(intent.claimType)) return rejected("UNSUPPORTED_CLAIM_ORIGIN_MAPPING");
      for (const [key, unit] of [["occurrenceAmount", "MONEY"], ["dueDate", "DATE"]] as const) if (intent[key] !== undefined) {
        if (!["expenses", "liabilities"].includes(intent.sourceCollection)) return rejected("UNSUPPORTED_OCCURRENCE_OVERRIDE");
        const parsed = scalar(intent[key], unit, `claimIntents.${intent.id}.${key}`);
        if (!parsed.ok) return parsed;
        intent[key] = parsed.value;
      }
      if (intent.occurrence !== undefined) {
        if (!occurrenceValid(intent.occurrence, intent.id)) return rejected("INVALID_OCCURRENCE_IDENTITY");
        const key = JSON.stringify([intent.occurrence.templateId, intent.occurrence.occurrenceKey]);
        if (occurrences.has(key)) return rejected("DUPLICATE_RECURRING_OCCURRENCE");
        occurrences.add(key);
      }
      if (intent.sourceCollection === "obligations") {
        const origin = source.facts.obligations?.[intent.sourceId]?.occurrence;
        if (origin && (origin.templateId !== intent.occurrence?.templateId || origin.occurrenceKey !== intent.occurrence?.occurrenceKey)) return rejected("CLAIM_OCCURRENCE_ORIGIN_MISMATCH");
      }
      if (intent.debtPayment !== undefined) {
        if (intent.sourceCollection !== "liabilities" || !plainRecord(intent.debtPayment) || !exactKeys(intent.debtPayment, ["principal", "interest", "fees"])) return rejected("INVALID_DEBT_BREAKDOWN");
        for (const key of ["principal", "interest", "fees"] as const) {
          const parsed = scalar(intent.debtPayment[key], "MONEY", `claimIntents.${intent.id}.debtPayment.${key}`);
          if (!parsed.ok) return parsed;
          intent.debtPayment[key] = parsed.value;
        }
      }
    }
  }
  for (const fact of Object.values(source.facts.assignments ?? {})) {
    if (!collections.assets?.some(record => record.id === fact.assetId) || fact.claimId && !source.claimIntents?.some(intent => intent.id === fact.claimId)) return rejected("DANGLING_ASSIGNMENT_REFERENCE");
  }
  return accepted(source);
}

/** Source -> frozen inputs only. No evaluation, service, persistence, clock or framework. */
export function adaptSourceProfile(input: unknown, context: { snapshotId: string; producerBundleVersion: string }): CodecResult<AdaptedProfile> {
  const guard = boundedJson(context);
  if (!guard.ok) return guard;
  if (!plainRecord(context) || !exactKeys(context, ["snapshotId", "producerBundleVersion"]) || !id(context.snapshotId)) return rejected("INVALID_ADAPTER_CONTEXT");
  if (context.producerBundleVersion !== PRODUCER_BUNDLE_VERSION) return rejected("UNSUPPORTED_PRODUCER_BUNDLE");
  const parsed = parseAdapterSource(input);
  if (!parsed.ok) return parsed;
  const source = parsed.value, domain = toDomainEnvelope(source.envelope);
  if (!domain.ok) return domain;
  const collections: DomainCollections = domain.value.collections;
  const limitations: ProducerLimitation[] = [];
  const limit = (code: string, ref: string, kind: ProducerLimitation["kind"] = "MISSING_SOURCE") => limitations.push({ code, fieldRefs: [ref], kind });
  const complete: NormalizationOptions["complete"] = {};
  for (const key of inventoryKeys) {
    const inventory = source.inventories[key];
    const present = key === "claims" ? source.claimIntents !== undefined : key === "expenses" ? collections.expenses !== undefined || source.expenseComponents !== undefined : collections[key] !== undefined;
    complete[key] = inventory?.state === "CONFIRMED" && inventory.scope === "ALL" && present;
    if (!complete[key]) limit("INVENTORY_NOT_COMPLETE", `inventories.${key}`);
  }
  const field = <T>(collection: keyof DomainCollections, recordId: string, name: string): DomainValue<T> => {
    const value = collections[collection]?.find(record => record.id === recordId)?.values[name]?.value;
    if (!value) limit("SOURCE_FIELD_UNANSWERED", `${collection}.${recordId}.${name}`);
    return (value ?? unknown("NOT_PROVIDED")) as DomainValue<T>;
  };
  const factRecords = <K extends keyof typeof schemas>(key: K) => (collections[key as keyof DomainCollections] ?? []).filter(record => {
    if (source.facts[key as keyof typeof source.facts] && Object.hasOwn(source.facts[key as keyof typeof source.facts]!, record.id)) return true;
    complete[key as InventoryKey] = false; limit("SOURCE_FACTS_UNANSWERED", `facts.${key}.${record.id}`); return false;
  });
  const profile: FinancialProfile = {
    profile: { primaryCurrency: source.envelope.basis.primaryCurrency, country: source.country },
    income: factRecords("income").map(record => ({ id: record.id, type: source.facts.income![record.id].type, stability: source.facts.income![record.id].stability, averageMonthlyNetIncome: field("income", record.id, "averageMonthlyNetIncome") })),
    expenses: {}, assets: [], liabilities: [], obligations: [], goals: [],
    household: { dependents: field("household", collections.household?.[0]?.id ?? "household", "dependents"), externalSupportAvailable: field("household", collections.household?.[0]?.id ?? "household", "externalSupportAvailable") },
  };
  if (source.expenseComponents !== undefined) {
    profile.expenses.components = source.expenseComponents.map(component => {
      if (component.timeBasis === "UNNORMALIZED") limit("PERIODIZATION_RESEARCH_REQUIRED", `expenseComponents.${component.id}`, "RESEARCH_REQUIRED");
      const domain = toDomainField(component.amount, { unit: component.timeBasis === "ONE_TIME" ? "MONEY" : "MONEY_PER_MONTH", primaryCurrency: profile.profile.primaryCurrency });
      return { ...component, amount: (domain.ok ? domain.value.value : unknown("NOT_PROVIDED")) as DomainValue<number> };
    });
  } else for (const name of ["necessaryMonthly", "discretionaryMonthly", "otherMonthlyRequired"] as const) profile.expenses[name] = field("expenses", collections.expenses?.[0]?.id ?? "expenses", name);
  if (source.facts.expenses?.aggregatesExcludeDebtAndObligations !== undefined) profile.expenses.aggregatesExcludeDebtAndObligations = source.facts.expenses.aggregatesExcludeDebtAndObligations;
  profile.assets = factRecords("assets").map(record => {
    const { type, liquidity, purpose, ownership } = source.facts.assets![record.id];
    return { id: record.id, type, liquidity, purpose, ownership, currentValue: field("assets", record.id, "currentValue"),
      ...(record.values.availableEconomicValue ? { availableEconomicValue: field<number>("assets", record.id, "availableEconomicValue") } : {}) };
  });
  profile.liabilities = factRecords("liabilities").map(record => ({ id: record.id, ...source.facts.liabilities![record.id],
    balance: field("liabilities", record.id, "balance"), minimumMonthlyPayment: field("liabilities", record.id, "minimumMonthlyPayment"),
    apr: field("liabilities", record.id, "apr"), costClassification: unknown("RESEARCH_REQUIRED_DEBT_COST_CLASSIFICATION"),
    ...Object.fromEntries(["nominalRate", "promotionalRate", "remainingTermMonths"].filter(key => record.values[key]).map(key => [key, field("liabilities", record.id, key)])) }));
  profile.obligations = factRecords("obligations").map(record => {
    const fact = source.facts.obligations![record.id], dueDate = record.values.dueDate?.value;
    if (fact.required && (fact.recurrence !== "NONE" || dueDate?.status !== "KNOWN" || !fact.economicPaymentId)) {
      complete.obligations = false; limit("DATED_OBLIGATION_COVERAGE_INCOMPLETE", `obligations.${record.id}`, "UNRESOLVED_SOURCE");
    }
    return { id: record.id, name: record.name?.trim() || record.id, required: fact.required, recurrence: fact.recurrence, ...(fact.economicPaymentId ? { economicPaymentId: fact.economicPaymentId } : {}),
      amount: field("obligations", record.id, "amount"), reservedAmount: field("obligations", record.id, "reservedAmount"), ...(dueDate?.status === "KNOWN" ? { dueDate: dueDate.data.value as string } : {}) };
  });
  profile.goals = factRecords("goals").map(record => {
    const date = record.values.targetDate?.value;
    return { id: record.id, name: record.name?.trim() || record.id, ...source.facts.goals![record.id], targetAmount: field("goals", record.id, "targetAmount"), currentFunding: field("goals", record.id, "currentFunding"), ...(date?.status === "KNOWN" ? { targetDate: date.data.value as string } : {}) };
  });
  const resources = produceResources(source, collections, profile.assets);
  limitations.push(...resources.limitations);
  complete.assignments = !!complete.assignments && (collections.assignments?.length ?? 0) === resources.assignments.filter(item => !item.id.startsWith("remainder:")).length;
  complete.resources = !!complete.assets && !!complete.assignments && resources.coveredAssetIds.length === profile.assets.length && resources.limitations.length === 0;
  const claims = produceClaims(source, profile, resources.assignments, resources.resources, !!complete.assignments && resources.limitations.length === 0);
  limitations.push(...claims.limitations);
  complete.claims = !!complete.claims && claims.complete && !!complete.expenses && !!complete.liabilities && !!complete.obligations && !!complete.goals;
  const basis = source.envelope.basis;
  const options: NormalizationOptions = { snapshotId: context.snapshotId, asOf: basis.asOf, monthlyPeriodId: basis.monthlyPeriodId,
    primaryCurrencyConfirmed: basis.primaryCurrencyConfirmed, netMonthlyBasisConfirmed: basis.netMonthlyBasisConfirmed, stockAsOfConfirmed: basis.stockAsOfConfirmed,
    approvedMonthlyIncomeIds: profile.income.filter(record => source.facts.income![record.id].monthlyBasisConfirmed).map(record => record.id),
    complete, resources: resources.resources, assignments: resources.assignments, ...(source.claimIntents?.length ? {} : { claims: claims.claims }) };
  const answerMetadata: AdaptedProfile["manifest"]["answerMetadata"] = [];
  for (const [collection, names] of Object.entries(SOURCE_FIELDS)) for (const record of collections[collection as keyof DomainCollections] ?? []) for (const name of Object.keys(names)) {
    answerMetadata.push({ fieldRef: `${collection}.${record.id}.${name}`, status: record.values[name]?.value.status ?? "UNANSWERED" });
  }
  for (const component of source.expenseComponents ?? []) answerMetadata.push({ fieldRef: `expenseComponents.${component.id}.amount`, status: component.amount.value.status });
  for (const asset of profile.assets) answerMetadata.push({ fieldRef: `assets.${asset.id}.availableFrom`, status: source.facts.assets![asset.id].availableFrom?.value.status ?? "UNANSWERED" });
  for (const intent of source.claimIntents ?? []) for (const key of ["occurrenceAmount", "dueDate"] as const) answerMetadata.push({ fieldRef: `claimIntents.${intent.id}.${key}`, status: intent[key]?.value.status ?? "UNANSWERED" });
  const adapted: AdaptedProfile = { source, profile, options, claimCandidates: claims.candidates, manifest: {
    adapterSourceVersion: ADAPTER_SOURCE_VERSION, codecVersion: source.envelope.codecVersion, producerBundleVersion: PRODUCER_BUNDLE_VERSION,
    financialModelVersion: moneyModelV1Bundle.manifest.id, snapshotId: context.snapshotId, asOf: basis.asOf, monthlyPeriodId: basis.monthlyPeriodId,
    inventories: source.inventories, answerMetadata, limitations, coverage: [
      ...inventoryKeys.map(key => ({ producerId: `${producerCatalog.profile.id}:${key}`, inventoryState: source.inventories[key]?.state ?? "NOT_CONFIRMED", complete: !!complete[key],
        sourceRefs: [`inventories.${key}`, ...answerMetadata.filter(item => item.fieldRef.startsWith(`${key}.`)).map(item => item.fieldRef)], producedIds: key === "claims" ? claims.claims.map(item => item.id) : key === "assignments" ? resources.assignments.map(item => item.id) : key === "expenses" ? profile.expenses.components?.map(item => item.id) ?? [] : (profile[key as "income" | "assets" | "liabilities" | "obligations" | "goals"] ?? []).map(item => item.id),
        reasonCodes: limitations.filter(item => item.fieldRefs.some(ref => ref.includes(key))).map(item => item.code) })),
      { producerId: producerCatalog.resources.id, inventoryState: source.inventories.assets?.state ?? "NOT_CONFIRMED", complete: !!complete.resources, sourceRefs: ["assets", "assignments"], producedIds: resources.resources.map(item => item.id), reasonCodes: resources.limitations.map(item => item.code) },
      { producerId: producerCatalog.claims.id, inventoryState: source.inventories.claims?.state ?? "NOT_CONFIRMED", complete: !!complete.claims, sourceRefs: ["claimIntents", "liabilities", "obligations", "goals"], producedIds: claims.claims.map(item => item.id), reasonCodes: claims.limitations.map(item => item.code) },
    ],
  } };
  // Independent source/manifest/domain copies: later mutation cannot rewrite another view.
  return accepted(JSON.parse(JSON.stringify(adapted)) as AdaptedProfile);
}
