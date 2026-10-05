import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { adaptSourceProfile } from "../lib/money-os/adapters/profile-adapter.ts";
import { producerCatalog } from "../lib/money-os/adapters/producer-catalog.ts";
import { analyzeFinancialProfile, moneyModelV1Bundle } from "../lib/money-model/index.ts";
import { normalizeProfile } from "../lib/money-model/runtime/profile-normalizer.ts";
import { sourceGoldenCase, goldenCase, goldenExpected, asOf } from "./money-os/fixtures/golden-cases.ts";

const ctx = { snapshotId: "source-review", producerBundleVersion: "1.0.0" };
const ok = result => { assert.equal(result.ok, true, JSON.stringify(result)); return result.value; };
const adapt = source => ok(adaptSourceProfile(source, ctx));
const analyze = adapted => { const result = analyzeFinancialProfile(adapted.profile, adapted.options, moneyModelV1Bundle); assert.equal(result.ok, true, JSON.stringify(result)); return result; };
const normalized = adapted => normalizeProfile(adapted.profile, adapted.options).context;
const known = (context, ref, value) => { assert.equal(context[ref].status, "KNOWN", ref); assert.equal(context[ref].data.value, value, ref); };
const unknown = (context, ref) => assert.equal(context[ref].status, "UNKNOWN", ref);
const field = (value, unit = "MONEY") => ({ unit, ...(unit.startsWith("MONEY") ? { currency: "TWD" } : {}), value: { status: "KNOWN", data: { value, source: "USER_REPORTED", updatedAt: asOf } } });
const missing = (unit = "MONEY") => ({ unit, ...(unit.startsWith("MONEY") ? { currency: "TWD" } : {}), value: { status: "UNKNOWN", reasonCode: "NOT_REPORTED" } });
const rejected = (source, code) => { const result = adaptSourceProfile(source, ctx); assert.equal(result.ok, false); if (code) assert.equal(result.error.safeCode, code); assert.equal(result.error.retryable, false); return result; };
const addObligation = (source, id, date, amount = "100") => {
  source.envelope.collections.obligations.push({ id, name: id, values: { amount: field(amount), reservedAmount: field("0"), dueDate: field(date, "DATE") } });
  source.facts.obligations ??= {};
  source.facts.obligations[id] = { required: true, recurrence: "NONE", economicPaymentId: "payment-" + id };
};

test("S03 manifest: pinned versions, inventories, answer metadata, detached deterministic inputs", () => {
  const source = sourceGoldenCase("D"), before = structuredClone(source), a = adapt(source), b = adapt(source);
  assert.deepEqual(a, b); assert.deepEqual(source, before);
  assert.equal(a.manifest.producerBundleVersion, "1.0.0"); assert.equal(a.manifest.financialModelVersion, moneyModelV1Bundle.manifest.id);
  assert.equal(a.manifest.asOf, asOf); assert.equal(a.manifest.monthlyPeriodId, "2026-09");
  assert.ok(a.manifest.answerMetadata.some(item => item.fieldRef === "assets.cash.availableEconomicValue" && item.status === "UNANSWERED"));
  source.envelope.collections.assets[0].values.currentValue = field("1");
  assert.equal(a.profile.assets[0].currentValue.data.value, 100000);
  assert.equal(adaptSourceProfile(before, { ...ctx, producerBundleVersion: "unknown" }).error.safeCode, "UNSUPPORTED_PRODUCER_BUNDLE");
});

test("S03 inventories: confirmed empty != unasked/partial/omitted, no empty-claims completeness shortcut", () => {
  const complete = adapt(sourceGoldenCase("D")); assert.equal(complete.options.complete.claims, true);
  for (const key of ["income", "expenses", "assets", "liabilities", "obligations", "goals", "assignments", "claims"]) {
    for (const state of ["NOT_CONFIRMED", "PARTIAL", undefined]) {
      const source = sourceGoldenCase("D"); if (state) source.inventories[key].state = state; else delete source.inventories[key];
      const a = adapt(source); assert.equal(a.options.complete[key], false, key);
      if (["expenses", "liabilities", "obligations", "goals", "claims"].includes(key)) assert.equal(a.options.complete.claims, false, key);
      if (key === "expenses") {
        // Existing frozen lineage limitation: adapter must not repair/drop provenance.
        const baseline = goldenCase("D"); baseline.options.complete.expenses = false;
        assert.deepEqual(analyzeFinancialProfile(a.profile, a.options, moneyModelV1Bundle), analyzeFinancialProfile(baseline.profile, baseline.options, moneyModelV1Bundle));
      } else analyze(a);
    }
  }
  const omitted = sourceGoldenCase("D"); delete omitted.claimIntents; assert.equal(adapt(omitted).options.complete.claims, false);
  delete omitted.envelope.collections.liabilities; assert.equal(adapt(omitted).options.complete.liabilities, false);
  const cashOnly = sourceGoldenCase("D"); cashOnly.inventories.assets.scope = "CASH_ONLY";
  unknown(normalized(adapt(cashOnly)), "metrics.netWorth"); unknown(normalized(adapt(cashOnly)), "metrics.availableSafetyLiquidity30d");
});

test("S03 UNKNOWN/missing are preserved; false is known, N/A has no new policy", () => {
  const source = sourceGoldenCase("D"); source.envelope.collections.income[0].values.averageMonthlyNetIncome = missing("MONEY_PER_MONTH");
  source.envelope.collections.household = [{ id: "home", values: { externalSupportAvailable: field(false, "BOOLEAN") } }];
  const a = adapt(source); unknown(normalized(a), "metrics.netMonthlyIncome"); assert.equal(a.profile.household.externalSupportAvailable.data.value, false);
  assert.equal(a.profile.household.dependents.status, "UNKNOWN");
  assert.ok(a.manifest.answerMetadata.some(item => item.fieldRef === "income.salary.averageMonthlyNetIncome" && item.status === "UNKNOWN"));
  delete source.envelope.collections.income[0].values.averageMonthlyNetIncome;
  assert.ok(adapt(source).manifest.answerMetadata.some(item => item.fieldRef === "income.salary.averageMonthlyNetIncome" && item.status === "UNANSWERED"));
  source.envelope.collections.household[0].values.externalSupportAvailable.value = { status: "NOT_APPLICABLE", reasonCode: "NO_NEW_POLICY" }; rejected(source, "NOT_APPLICABLE_NOT_SUPPORTED");
});

test("S03 A: negative cash-flow repair survives unsupported claims; complete update needs explicit reconfirmation", () => {
  const source = sourceGoldenCase("A"), a = adapt(source), result = analyze(a);
  known(normalized(a), "metrics.coreCashFlow", -5000); assert.equal(result.output.mainQuest.code, goldenExpected.A.main);
  assert.equal(result.output.currentStage, "SURVIVAL"); assert.equal(a.options.complete.claims, false); assert.equal(a.claimCandidates.length, 1);
  source.envelope.collections.income[0].values.averageMonthlyNetIncome = field("38000", "MONEY_PER_MONTH");
  assert.equal(adapt(source).options.complete.claims, false);
  source.claimIntents = []; const after = adapt(source); known(normalized(after), "metrics.coreCashFlow", 3000);
  assert.ok(analyze(after).diagnostics.matchedRuleIds.includes("R-014"));
  source.inventories.income.state = "PARTIAL"; source.envelope.collections.liabilities = [{ id: "debt", values: { balance: missing(), minimumMonthlyPayment: missing("MONEY_PER_MONTH") } }];
  source.facts.liabilities = { debt: { type: "PERSONAL_LOAN", secured: false, delinquencyStatus: "DELINQUENT" } };
  const partial = analyze(adapt(source)); assert.ok(partial.diagnostics.matchedRuleIds.includes("R-002")); assert.equal(partial.output.mainQuest.code, "RESOLVE_DELINQUENCY");
});

test("S03 C: APR alone cannot install cost policy; unknown facts cannot certify completeness", () => {
  const source = sourceGoldenCase("C"), a = adapt(source);
  known(normalized(a), "metrics.coreCashFlow", 39000); assert.equal(analyze(a).output.mainQuest.code, "CONFIRM_DEBT_COST");
  assert.equal(a.options.complete.claims, false);
  source.envelope.collections.liabilities[0].values.apr = field("5", "APR_PERCENT");
  const cost = adapt(source); unknown(normalized(cost), "flags.hasHighCostDebt"); assert.equal(cost.profile.liabilities[0].costClassification.status, "UNKNOWN");
  delete source.facts.liabilities.loan; const absent = adapt(source); assert.equal(absent.options.complete.liabilities, false); assert.equal(absent.options.complete.claims, false);
  assert.ok(analyze(absent).output.missingInformation.length > 0);
});

test("S03 D/E: supported no-mission results, no forced allocation and no fake saved cash", () => {
  for (const name of ["D", "E"]) {
    const a = adapt(sourceGoldenCase(name)), c = normalized(a), result = analyze(a);
    known(c, "metrics.coreCashFlow", goldenExpected[name].core); known(c, "metrics.netWorth", goldenExpected[name].netWorth);
    known(c, "metrics.monthlySurplus", goldenExpected[name].surplus); assert.equal(result.output.mainQuest, null);
    assert.deepEqual(result.diagnostics.matchedRuleIds, ["R-014"]); assert.equal(result.output.currentStage, null);
    if (name === "D") known(c, "metrics.financialRunwayMonths", 5);
  }
  const source = sourceGoldenCase("E"); source.envelope.collections.expenses[0].values.discretionaryMonthly = field("100000", "MONEY_PER_MONTH");
  const changed = adapt(source); known(normalized(changed), "metrics.monthlySurplus", 20000); known(normalized(changed), "metrics.netWorth", 300000);
  assert.equal(analyze(changed).output.mainQuest, null);
});

test("S03 F: goal target is not reserved cash; missing claim mapping stays incomplete across dates", () => {
  const source = sourceGoldenCase("F");
  for (const date of ["2028-10-02", "2029-10-02"]) {
    source.envelope.collections.goals[0].values.targetDate = field(date, "DATE"); const a = adapt(source), c = normalized(a);
    assert.equal(a.options.complete.claims, false); assert.equal(a.claimCandidates[0].amount.data.value, 2000000);
    known(c, "metrics.availableSafetyLiquidity30d", 1000000); known(c, "metrics.netWorth", 1000000);
    unknown(c, "metrics.sustainableGoalCapital"); unknown(c, "flags.hasGoalConflict");
    assert.ok(!analyze(a).diagnostics.matchedRuleIds.includes("R-009"));
  }
});

test("S03 B remains research-only; protected hand-authored A–F fixtures do not change", () => {
  const a = adapt(sourceGoldenCase("B")), c = normalized(a); unknown(c, "flags.hasHighCostDebt");
  assert.equal(a.options.complete.claims, false); assert.equal(a.claimCandidates.some(item => item.claimType === "SAFETY_BUFFER"), false);
  assert.equal(producerCatalog.claims.policyApproval, "NOT_APPROVED"); assert.ok(Object.isFrozen(producerCatalog.research));
  for (const id of ["A", "B", "C", "D", "E", "F"]) { const f = goldenCase(id); const result = analyzeFinancialProfile(f.profile, f.options, moneyModelV1Bundle); assert.equal(result.ok, true); assert.equal(result.output.mainQuest?.code ?? null, goldenExpected[id].main); }
});

test("S03 payment identity: components replace aggregates; debt/obligation overlap deduplicates, contradictions stay unknown", () => {
  const source = sourceGoldenCase("C");
  source.expenseComponents = [{ id: "living", economicPaymentId: "living", category: "NECESSARY", timeBasis: "MONTHLY", amount: field("20000", "MONEY_PER_MONTH") }, { id: "loan-copy", economicPaymentId: "loan-payment", category: "OTHER_REQUIRED", timeBasis: "MONTHLY", amount: field("1000", "MONEY_PER_MONTH") }, { id: "fun", economicPaymentId: "fun", category: "DISCRETIONARY", timeBasis: "MONTHLY", amount: field("10000", "MONEY_PER_MONTH") }];
  const a = adapt(source); known(normalized(a), "metrics.coreMonthlyOutflow", 21000);
  source.expenseComponents[1].amount = field("1001", "MONEY_PER_MONTH"); unknown(normalized(adapt(source)), "metrics.coreMonthlyOutflow");
  source.expenseComponents[1].amount = field("1000", "MONEY_PER_MONTH"); source.expenseComponents[2].economicPaymentId = "loan-payment";
  unknown(normalized(adapt(source)), "metrics.monthlySurplus");
  source.expenseComponents = undefined; delete source.expenseComponents; source.facts.expenses.aggregatesExcludeDebtAndObligations = false;
  unknown(normalized(adapt(source)), "metrics.coreMonthlyOutflow");
});

test("S03 asset partitions: disjoint assignments plus remainder, purpose never creates net worth", () => {
  const source = sourceGoldenCase("D"); source.envelope.collections.assignments = [{ id: "goal-part", values: { amount: field("20000") } }, { id: "long-part", values: { amount: field("30000") } }];
  source.facts.assignments = { "goal-part": { assetId: "cash", purpose: "GOAL" }, "long-part": { assetId: "cash", purpose: "LONG_TERM" } };
  const a = adapt(source), c = normalized(a); assert.equal(a.options.resources.length, 3);
  assert.deepEqual(a.options.resources.map(item => item.partitionAssignmentIds), [["goal-part"], ["long-part"], ["remainder:cash"]]);
  known(c, "metrics.netWorth", 100000); known(c, "metrics.availableSafetyLiquidity30d", 50000); assert.equal(a.options.complete.resources, true);
  source.envelope.collections.assignments[0].values.amount = field("80000");
  const over = adapt(source); assert.equal(over.options.complete.resources, false); assert.ok(analyze(over).diagnostics.matchedRuleIds.includes("R-008"));
  known(normalized(over), "metrics.netWorth", 100000);
});

test("S03 unknown ownership/value/date and non-cash realization are not current owned liquidity", () => {
  for (const ownership of ["JOINT", "UNKNOWN", "EXTERNAL"]) {
    const source = sourceGoldenCase("D"); source.facts.assets.cash.ownership = ownership; const a = adapt(source); assert.equal(a.options.complete.resources, false);
    unknown(normalized(a), "metrics.availableSafetyLiquidity30d"); if (ownership !== "EXTERNAL") unknown(normalized(a), "metrics.netWorth"); analyze(a);
  }
  const source = sourceGoldenCase("D"); source.envelope.collections.assets[0].values.currentValue = missing(); const a = adapt(source); unknown(normalized(a), "metrics.netWorth"); analyze(a);
  const date = sourceGoldenCase("D"); delete date.facts.assets.cash.availableFrom; unknown(normalized(adapt(date)), "metrics.availableSafetyLiquidity30d");
  const future = sourceGoldenCase("D"); future.facts.assets.cash.availableFrom = field("2026-10-03", "DATE"); const f = adapt(future); assert.equal(f.options.complete.resources, false);
  const locked = sourceGoldenCase("D"); locked.facts.assets.cash.availability = "LOCKED"; unknown(normalized(adapt(locked)), "metrics.availableSafetyLiquidity30d");
  const stock = sourceGoldenCase("D"); stock.facts.assets.cash.type = "STOCKS"; assert.equal(adapt(stock).options.resources.length, 0);
});

test("S03 dated horizons: one full occurrence inventory covers 30/90/365; a subset cannot certify any horizon", () => {
  const source = sourceGoldenCase("D"); addObligation(source, "soon", "2026-10-20"); addObligation(source, "quarter", "2026-12-01"); addObligation(source, "year", "2027-09-01");
  const a = adapt(source), c = normalized(a); known(c, "metrics.availableSafetyLiquidity30d", 99900); known(c, "metrics.availableSafetyLiquidity90d", 99800); known(c, "metrics.availableSafetyLiquidity365d", 99700);
  assert.equal(a.options.complete.claims, false); assert.equal(a.options.complete.obligations, true);
  for (const scope of ["DATED_30D", "DATED_90D", "DATED_365D"]) { source.inventories.obligations.scope = scope; const n = normalized(adapt(source)); for (const days of [30, 90, 365]) unknown(n, `metrics.availableSafetyLiquidity${days}d`); }
  source.inventories.obligations.scope = "ALL"; source.envelope.collections.obligations[0].values.dueDate = missing("DATE"); assert.equal(adapt(source).options.complete.obligations, false);
});

test("S03 recurrence: templates never auto-expand; explicit source occurrence identity is stable", () => {
  const source = sourceGoldenCase("D"); addObligation(source, "rent", "2026-10-20", "1000");
  source.facts.obligations.rent.recurrence = "MONTHLY"; source.facts.obligations.rent.occurrence = { templateId: "rent-template", occurrenceKey: "2026-10" };
  const a = adapt(source); assert.equal(a.profile.obligations.length, 1); assert.equal(a.options.complete.obligations, false);
  for (const days of [30, 90, 365]) unknown(normalized(a), `metrics.availableSafetyLiquidity${days}d`);
  source.claimIntents = [{ id: "rent-claim", claimType: "IMMEDIATE_OBLIGATION", sourceCollection: "obligations", sourceId: "rent", lifecycleStatus: "CANCELLED", occurrence: { templateId: "rent-template", occurrenceKey: "2026-10" } }];
  const candidate = adapt(source).claimCandidates[0]; assert.equal(candidate.lifecycleStatus, "CANCELLED"); assert.equal(candidate.occurrence.occurrenceKey, "2026-10");
  source.claimIntents.push({ ...source.claimIntents[0], id: "duplicate", occurrence: { occurrenceKey: "2026-10", templateId: "rent-template" } }); rejected(source, "DUPLICATE_RECURRING_OCCURRENCE");
  source.claimIntents.pop(); source.claimIntents[0].occurrence.occurrenceKey = "2026-11"; rejected(source, "CLAIM_OCCURRENCE_ORIGIN_MISMATCH");
});

test("S03 funding/lifecycle: assignment-derived, UNKNOWN != zero, terminal intents are not reopened", () => {
  const source = sourceGoldenCase("F"), a = adapt(source); assert.equal(a.claimCandidates[0].fundingStatus, "UNFUNDED");
  source.inventories.assignments.state = "PARTIAL"; assert.equal(adapt(source).claimCandidates[0].fundingStatus, "UNKNOWN");
  source.inventories.assignments.state = "CONFIRMED";
  source.envelope.collections.assignments = [{ id: "house-cash", values: { amount: field("20000") } }]; source.facts.assignments = { "house-cash": { assetId: "cash", purpose: "GOAL", claimId: "house-goal" } };
  const funded = adapt(source); assert.equal(funded.claimCandidates[0].fundingStatus, "PARTIALLY_FUNDED"); assert.equal(funded.claimCandidates[0].fundedAmount.data.source, "CALCULATED");
  for (const availability of ["LOCKED", "UNSETTLED", "UNKNOWN"]) { source.facts.assets.cash.availability = availability; assert.equal(adapt(source).claimCandidates[0].fundingStatus, "UNKNOWN"); }
  source.facts.assets.cash.availability = "RESTRICTED"; source.facts.assets.cash.restriction = { reasonCode: "NO_CURRENT_USE", allowsCurrentFunding: false }; assert.equal(adapt(source).claimCandidates[0].fundingStatus, "UNKNOWN");
  source.facts.assets.cash.availability = "AVAILABLE"; delete source.facts.assets.cash.restriction;
  source.envelope.collections.assignments[0].values.amount = missing(); assert.equal(adapt(source).claimCandidates[0].fundingStatus, "UNKNOWN");
  source.envelope.collections.assignments = []; source.facts.assignments = {};
  for (const lifecycleStatus of ["CANCELLED", "EXPIRED", "FULFILLED"]) { source.claimIntents[0].lifecycleStatus = lifecycleStatus; const c = adapt(source); assert.equal(c.claimCandidates[0].lifecycleStatus, lifecycleStatus); assert.equal(c.options.claims, undefined); assert.equal(c.options.complete.claims, false); }
  assert.ok(adapt(source).manifest.limitations.some(item => item.code === "FULFILLMENT_NOT_CERTIFIED"));
});

test("S03 debt breakdown: missing principal is never inferred; fact/intent reconciliation prevents empty success", () => {
  const source = sourceGoldenCase("C"); source.claimIntents = [{ id: "loan-occurrence", claimType: "DEBT_MINIMUM", sourceCollection: "liabilities", sourceId: "loan", lifecycleStatus: "FULFILLED", occurrenceAmount: field("1000"), dueDate: field("2026-10-02", "DATE"), debtPayment: { principal: missing(), interest: field("50"), fees: field("0") } }];
  const a = adapt(source); assert.equal(a.claimCandidates[0].debtPayment.principal.status, "UNKNOWN"); assert.equal(a.options.complete.claims, false);
  assert.ok(a.manifest.limitations.some(item => item.code === "DEBT_PAYMENT_BREAKDOWN_UNKNOWN")); assert.equal(a.profile.liabilities[0].balance.data.value, 50000);
  source.claimIntents[0].debtPayment.principal = field("1000"); assert.ok(adapt(source).manifest.limitations.some(item => item.code === "DEBT_PAYMENT_COMPONENT_SUM_MISMATCH"));
  delete source.claimIntents[0].occurrenceAmount; assert.equal(adapt(source).claimCandidates[0].amount.status, "UNKNOWN");
  source.claimIntents[0].claimType = "DEBT_ACCELERATION"; assert.equal(adapt(source).claimCandidates[0].amount.status, "UNKNOWN");
  source.claimIntents = []; assert.equal(adapt(source).options.complete.claims, false);
  const obligation = sourceGoldenCase("D"); addObligation(obligation, "bill", "2026-10-20"); assert.equal(adapt(obligation).options.complete.claims, false);
});

test("S03 security/bounds: closed facts, no client flags/policy/logs, codecs reject unsafe scalar/time/currency", () => {
  for (const extra of [{ flags: {} }, { complete: true }, { ownerId: "owner" }, { producerBundleVersion: "fake" }, { DecisionOutput: {} }]) rejected({ ...sourceGoldenCase("D"), ...extra }, "INVALID_ADAPTER_SOURCE");
  const source = sourceGoldenCase("C"); source.facts.liabilities.loan.costClassification = "HIGH_COST"; rejected(source, "INVALID_SOURCE_FACTS");
  const money = sourceGoldenCase("D"); money.envelope.collections.assets[0].values.currentValue = field("9007199254740993"); rejected(money, "NUMBER_PRECISION_LOSS");
  money.envelope.collections.assets[0].values.currentValue = field("1e3"); rejected(money, "INVALID_DECIMAL_LITERAL");
  const date = sourceGoldenCase("D"); date.facts.assets.cash.availableFrom = field("2026-02-30", "DATE"); rejected(date);
  date.facts.assets.cash.availableFrom = field("2026-10-02T00:00:00Z", "DATE"); rejected(date);
  const fx = sourceGoldenCase("D"); fx.facts.assets.cash.availableFrom = field("2026-10-02", "DATE"); fx.envelope.collections.assets[0].values.currentValue.currency = "USD"; rejected(fx, "CURRENCY_MISMATCH");
  const ref = sourceGoldenCase("D"); ref.envelope.collections.assignments = [{ id: "dangling", values: { amount: field("1") } }]; ref.facts.assignments = { dangling: { assetId: "other", purpose: "GOAL" } }; rejected(ref, "DANGLING_ASSIGNMENT_REFERENCE");
  let calls = 0; const getter = sourceGoldenCase("D"); Object.defineProperty(getter.facts, "secret", { enumerable: true, get() { calls++; return "private"; } }); rejected(getter); assert.equal(calls, 0);
  const cyclic = sourceGoldenCase("D"); cyclic.facts.self = cyclic; rejected(cyclic);
  const invalid = sourceGoldenCase("D"); invalid.claimIntents = new Array(101); rejected(invalid);
});

test("S03 output/provenance stays S01-owned: USER_REPORTED not VERIFIED, repeatable across device zones", () => {
  const previous = process.env.TZ;
  try {
    let baseline;
    for (const zone of ["UTC", "Asia/Taipei", "Pacific/Honolulu"]) {
      process.env.TZ = zone; const a = adapt(sourceGoldenCase("D")), result = analyze(a);
      assert.equal(a.profile.assets[0].currentValue.data.source, "USER_REPORTED"); assert.equal(a.options.resources[0].source, "USER_REPORTED");
      assert.ok(result.output.provenance); assert.ok(result.diagnostics.normalizationTraces.some(trace => trace.inputSources.includes("USER_REPORTED")));
      if (baseline) assert.deepEqual(result, baseline); else baseline = result;
    }
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});

test("S03 pure dependency boundary: no evaluator/IO/UI/service/clock or alternate money parser", () => {
  for (const name of ["profile-adapter", "resource-producer", "claim-producer", "producer-catalog"]) {
    const file = new URL(`../lib/money-os/adapters/${name}.ts`, import.meta.url), content = readFileSync(file, "utf8"), ast = ts.createSourceFile(file.pathname, content, ts.ScriptTarget.ES2022, true);
    const visit = node => {
      if (ts.isImportDeclaration(node)) { assert.ok(node.moduleSpecifier.text.startsWith(".")); assert.ok(!/application|server|docs|presentation|react|next|database/.test(node.moduleSpecifier.text)); }
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) assert.notEqual(node.expression.text, "Number");
      if (ts.isIdentifier(node)) assert.ok(!["parseFloat", "Date", "fetch", "process", "console", "window", "document", "analyzeFinancialProfile", "evaluateReference"].includes(node.text), `${name}:${node.text}`);
      ts.forEachChild(node, visit);
    }; visit(ast);
  }
});
