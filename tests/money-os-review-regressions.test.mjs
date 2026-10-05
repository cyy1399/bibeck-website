import test from "node:test";
import assert from "node:assert/strict";
import { normalizeProfile } from "../lib/money-model/runtime/profile-normalizer.ts";
import { projectWhy } from "../lib/money-os/presentation/why.ts";
import { createLocalizer } from "../messages/money-os/index.ts";
import { moneyModelV1Bundle } from "../lib/money-model/index.ts";
import { validateAnalysisInput } from "../lib/money-model/runtime/input-validation.ts";
import { asOf } from "./money-os/fixtures/golden-cases.ts";
import { baseline, command, prepare, success } from "./money-os/service-fixtures.mjs";

const field = (value, unit = "MONEY") => ({ unit, ...(unit.startsWith("MONEY") ? { currency: "TWD" } : {}), value: { status: "KNOWN", data: { value, source: "USER_REPORTED", updatedAt: asOf } } });
function reserve(source, claimId, amount, purpose = "UNASSIGNED") {
  source.envelope.collections.assignments.push({ id: "reservation", values: { amount: field(amount) } });
  source.facts.assignments.reservation = { assetId: "cash", purpose, claimId };
}
function bill(source, amount = "30000", reservedAmount = "0") {
  source.envelope.collections.obligations.push({ id: "bill-source", values: { amount: field(amount), reservedAmount: field(reservedAmount), dueDate: field("2026-10-20", "DATE") } });
  source.facts.obligations = { "bill-source": { required: true, recurrence: "NONE", economicPaymentId: "bill-payment" } };
}
const known = (context, key, value) => { assert.equal(context[key].status, "KNOWN", key); assert.equal(context[key].data.value, value, key); };

test("PR23 P1: UNASSIGNED claim-reserved cash is not available; funding gap reaches S04", async () => {
  const cmd = command("F");
  cmd.source.envelope.collections.assets[0].values.currentValue = field("100000");
  reserve(cmd.source, "house-goal", "80000");
  const beforeBill = baseline(cmd.source).adapted;
  for (const days of [30, 90, 365]) known(normalizeProfile(beforeBill.profile, beforeBill.options).context, `metrics.availableSafetyLiquidity${days}d`, 20000);
  bill(cmd.source);
  const { adapted } = baseline(cmd.source), context = normalizeProfile(adapted.profile, adapted.options).context;
  known(context, "metrics.availableSafetyLiquidity30d", -10000);
  known(context, "flags.hasReservedCapital", true); known(context, "flags.hasImmediateFundingGap", true);
  const result = success(await prepare(cmd));
  assert.equal(result.candidate.output.evaluation.inputStates["flags.hasImmediateFundingGap"].value, true);
  assert.ok(result.candidate.output.provenance.ruleRefs.some(ref => ref.id === "R-004"));
  assert.equal(adapted.options.complete.claims, false); // No unsupported claim-policy certification.
});

test("PR23 P2: intent ID differs from obligation ID; reservation reconciles all horizons exactly once", async () => {
  const cmd = command(); bill(cmd.source, "30000", "20000");
  cmd.source.claimIntents = [{ id: "bill-intent", claimType: "IMMEDIATE_OBLIGATION", sourceCollection: "obligations", sourceId: "bill-source", lifecycleStatus: "ACTIVE" }];
  reserve(cmd.source, "bill-intent", "20000", "GOAL");
  const { adapted } = baseline(cmd.source), context = normalizeProfile(adapted.profile, adapted.options).context;
  known(context, "metrics.requiredObligations30d", 30000);
  for (const days of [30, 90, 365]) known(context, `metrics.availableSafetyLiquidity${days}d`, 70000);
  assert.equal(adapted.options.assignments[0].claimId, "bill-intent");
  assert.equal(adapted.claimCandidates[0].sourceId, "bill-source");
  assert.equal(adapted.options.claims, undefined); assert.equal(adapted.options.complete.claims, false);
  success(await prepare(cmd));
  cmd.source.envelope.collections.obligations[0].values.reservedAmount = field("19000");
  const mismatch = baseline(cmd.source).adapted;
  for (const days of [30, 90, 365]) assert.equal(normalizeProfile(mismatch.profile, mismatch.options).context[`metrics.availableSafetyLiquidity${days}d`].status, "UNKNOWN");
});

test("PR23 P2: monthly expense Why preserves recorded time basis without mutating calculation", async () => {
  const cmd = command("A");
  cmd.source.expenseComponents = [{ id: "rent", economicPaymentId: "rent-payment", category: "NECESSARY", timeBasis: "MONTHLY", amount: field("35000", "MONEY_PER_MONTH") }];
  const result = success(await prepare(cmd)), output = result.candidate.output, before = structuredClone(output), l = createLocalizer();
  const why = projectWhy(output, output.provenance, output.confidenceAssessment, result.workspace.metrics, cmd.source.envelope.basis, moneyModelV1Bundle, l);
  const amount = why.sources.items.find(item => item.value.canonical === "35000");
  assert.equal(amount.unit, l.text("moneyOs.input.unit.MONEY_PER_MONTH"));
  assert.equal(amount.timeBasis, l.text("moneyOs.input.basis.MONTHLY"));
  assert.deepEqual(output, before);
  assert.equal(output.metrics.find(m => m.id === "metrics.coreMonthlyOutflow").value.data.value, 35000);
});

test("PR23 P1/P2: unclaimed cash stays available; goal ID collision does not fund an obligation", () => {
  const cmd = command("F"); cmd.source.envelope.collections.assets[0].values.currentValue = field("100000");
  const unclaimed = baseline(cmd.source).adapted;
  known(normalizeProfile(unclaimed.profile, unclaimed.options).context, "metrics.availableSafetyLiquidity30d", 100000);
  cmd.source.claimIntents[0].id = "bill-source";
  reserve(cmd.source, "bill-source", "80000"); bill(cmd.source);
  const { adapted } = baseline(cmd.source), c = normalizeProfile(adapted.profile, adapted.options).context;
  known(c, "metrics.availableSafetyLiquidity30d", -10000);
  known(c, "metrics.requiredObligations30d", 30000);
  assert.equal(adapted.options.complete.claims, false);
});

test("PR23 P2: source identity contract rejects duplicates, unsupported fields and dangling obligations", () => {
  const { adapted } = baseline(command().source);
  for (const claimOrigins of [null, [{ claimId: "x", sourceCollection: "obligations", sourceId: "missing" }], [{ claimId: "x", sourceCollection: "expenses", sourceId: "monthly", certified: true }], [{ claimId: "x", sourceCollection: "expenses", sourceId: "monthly" }, { claimId: "x", sourceCollection: "goals", sourceId: "house" }]]) {
    assert.ok(validateAnalysisInput(adapted.profile, { ...adapted.options, claimOrigins }).includes("INVALID_CLAIM_ORIGINS"));
  }
});
