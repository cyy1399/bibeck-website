import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { currentAnalysisVersions, resolveAnalysisBundle } from "../lib/money-os/application/version-dispatcher.ts";
import { canonicalJson, digestJson } from "../lib/money-os/application/fingerprint.ts";
import { checkAnalysisCapability } from "../lib/money-os/application/analyze-profile.ts";
import { analyzeFinancialProfile, moneyModelV1Bundle } from "../lib/money-model/index.ts";
import { sourceGoldenCase, goldenCase } from "./money-os/fixtures/golden-cases.ts";
import { request, reservation, success, failure, command, testService, prepare, baseline, auditTime } from "./money-os/service-fixtures.mjs";

for (const [id, state, main] of [
  ["A", "ACTION_SUPPORTED", "REPAIR_CORE_CASH_FLOW"], ["C", "NEED_MORE_INFORMATION", "CONFIRM_DEBT_COST"],
  ["D", "NO_ACTION_REQUIRED", null], ["E", "NO_ACTION_REQUIRED", null],
]) test("S04 supported source " + id + ": single pipeline, complete frozen output and draft projection", async () => {
  const cmd = command(id), before = structuredClone(cmd), result = success(await prepare(cmd));
  const direct = baseline(cmd.source).result;
  assert.deepEqual(result.candidate.output, direct.output); assert.deepEqual(result.candidate.diagnostics, direct.diagnostics);
  assert.equal(result.candidate.output.mainQuest?.code ?? null, main); assert.equal(result.workspace.state, state);
  assert.equal(result.workspace.metrics.length, direct.output.metrics.length); assert.equal(result.workspace.confidence.level, direct.output.confidenceAssessment.level);
  assert.equal(result.candidate.createdAt, auditTime); assert.equal(result.candidate.kind, "UNPUBLISHED_ANALYSIS_CANDIDATE");
  assert.equal(result.workspace.publication, "UNPUBLISHED"); assert.equal(result.candidate.ownerSubject, "synthetic-owner-a");
  assert.deepEqual(cmd, before); assert.ok(Object.isFrozen(result.candidate.output)); assert.deepEqual(result.workspace.localizationDiagnostics, []);
});
test("S04 B/F: unsupported producer stays visible; no fake policies, claims or goal allocation", async () => {
  for (const id of ["B", "F"]) {
    const r = success(await prepare(command(id)));
    assert.ok(r.workspace.producerLimitations.some(t => t.includes("映射")));
    assert.equal(r.workspace.state, "NEED_MORE_INFORMATION");
    assert.ok(r.candidate.producerManifest.coverage.some(c => c.producerId === "claim-candidates" && !c.complete));
    assert.equal(r.candidate.output.metrics.find(m => m.id === "metrics.sustainableGoalCapital").value.status, "UNKNOWN");
    assert.ok(!r.candidate.output.ruleIds.includes("R-009")); assert.ok(!r.candidate.output.ruleIds.includes("R-005"));
  }
});
test("S04 partial data + independent delinquency: repair and side Discover both survive", async () => {
  const cmd = command("C"); cmd.source.inventories.income.state = "PARTIAL"; cmd.source.facts.liabilities.loan.delinquencyStatus = "DELINQUENT";
  const r = success(await prepare(cmd)); assert.equal(r.candidate.output.mainQuest.code, "RESOLVE_DELINQUENCY");
  assert.equal(r.workspace.state, "ACTION_SUPPORTED"); assert.equal(r.workspace.severity.value, "CRITICAL");
  assert.deepEqual(r.workspace.sideMissions.map(m => m.key), r.candidate.output.sideMissions.map(m => m.id));
  assert.ok(r.workspace.sideMissions.some(m => m.title.includes("債務成本"))); assert.ok(r.workspace.missingInformation.length);
});
test("S04 R008: contradiction is an honest domain result, not an exception or false no-action", async () => {
  const cmd = command(); cmd.source.envelope.collections.assignments = [
    { id: "one", values: { amount: { unit: "MONEY", currency: "TWD", value: { status: "KNOWN", data: { value: "80000", source: "USER_REPORTED", updatedAt: "2026-10-02" } } } } },
    { id: "two", values: { amount: { unit: "MONEY", currency: "TWD", value: { status: "KNOWN", data: { value: "30000", source: "USER_REPORTED", updatedAt: "2026-10-02" } } } } },
  ];
  cmd.source.facts.assignments = { one: { assetId: "cash", purpose: "GOAL" }, two: { assetId: "cash", purpose: "LONG_TERM" } };
  const r = success(await prepare(cmd)); assert.deepEqual(r.candidate.output.ruleIds, ["R-008"]); assert.equal(r.candidate.output.mainQuest, null);
  assert.equal(r.workspace.state, "DATA_CORRECTION_REQUIRED"); assert.ok(r.candidate.diagnostics.categories.includes("CONTRADICTORY_STATE"));
});
test("S04 preserves the frozen partial-expenses failure; never manufactures successful output", async () => {
  const cmd = command(); cmd.source.inventories.expenses.state = "PARTIAL";
  const err = failure(await prepare(cmd), "INVALID_DECISION_OUTPUT", "DOMAIN_INVARIANT_VIOLATION"); assert.deepEqual(err.fieldRefs, ["output"]);
});
test("S04 UNKNOWN != zero and no fake source verification", async () => {
  const cmd = command(); cmd.source.envelope.collections.income[0].values.averageMonthlyNetIncome.value = { status: "UNKNOWN", reasonCode: "NOT_REPORTED" };
  const r = success(await prepare(cmd)); const metric = r.workspace.metrics.find(m => m.key === "metrics.netMonthlyIncome");
  assert.deepEqual(metric.value, { status: "UNKNOWN", text: "尚未確認" });
  const domain = r.candidate.output.metrics.find(m => m.id === "metrics.netMonthlyIncome").value;
  assert.equal(domain.status, "UNKNOWN"); assert.ok(!("data" in domain));
  assert.ok(!JSON.stringify(r.workspace).includes("VERIFIED")); assert.equal(r.workspace.state, "NEED_MORE_INFORMATION");
});
test("S04 command trust boundary rejects owners, derived state, config, output and client versions", async () => {
  for (const extra of [{ ownerSubject: "other" }, { config: {} }, { flags: {} }, { output: {} }, { versions: currentAnalysisVersions }, { sourceDigest: "forged" }])
    failure(await prepare({ ...command(), ...extra }), "INVALID_ANALYSIS_COMMAND", "VALIDATION_ERROR");
});
test("S04 command/basis/money boundaries reuse source codecs", async () => {
  for (const revision of [-1, 0.1, Number.MAX_SAFE_INTEGER + 1]) failure(await prepare({ ...command(), expectedProfileRevision: revision }), "INVALID_ANALYSIS_COMMAND");
  failure(await prepare(command(), {}, request, { ...reservation, inputRevision: 2 }), "INVALID_CANDIDATE_RESERVATION");
  const money = command(); money.source.envelope.collections.assets[0].values.currentValue.value.data.value = "1e6";
  failure(await prepare(money), "INVALID_DECIMAL_LITERAL");
  const currency = command(); currency.source.envelope.collections.assets[0].values.currentValue.currency = "USD"; failure(await prepare(currency), "CURRENCY_MISMATCH");
  const date = command(); date.source.envelope.basis.asOf = "2026-02-30"; failure(await prepare(date), "INVALID_ANALYSIS_BASIS");
  const basis = command(); basis.source.envelope.basis.netMonthlyBasisConfirmed = false;
  const r = await prepare(basis); assert.equal(r.ok, false); assert.ok(["VALIDATION_ERROR", "MISSING_REQUIRED_INFORMATION"].includes(r.error.category));
});
test("S04 unknown versions fail closed without a latest fallback", async () => {
  const variants = [
    [v => { v.bundle.frozenCommit = "other"; }, "MODEL_ARTIFACT_UNAVAILABLE", "UNSUPPORTED_MODEL_VERSION"],
    [v => { v.bundle.artifactDigest = "sha256:other"; }, "MODEL_ARTIFACT_UNAVAILABLE", "UNSUPPORTED_MODEL_VERSION"],
    [v => { v.codecVersion = "2.0.0"; }, "SCHEMA_ARTIFACT_UNAVAILABLE", "UNSUPPORTED_SCHEMA_VERSION"],
    [v => { v.producerBundleVersion = "2.0.0"; }, "PRODUCER_ARTIFACT_UNAVAILABLE", "UNSUPPORTED_CAPABILITY"],
    [v => { delete v.bundle; }, "INVALID_VERSION_SET", "UNSUPPORTED_SCHEMA_VERSION"],
  ];
  for (const [mutate, code, category] of variants) {
    const versions = structuredClone(currentAnalysisVersions); mutate(versions);
    failure(await prepare(command(), { versions }), code, category);
  }
  assert.equal(resolveAnalysisBundle(currentAnalysisVersions, request.requestId).value, moneyModelV1Bundle);
  const cmd = command(); cmd.source.envelope.codecVersion = "99"; failure(await prepare(cmd), "SOURCE_SCHEMA_UNSUPPORTED", "UNSUPPORTED_SCHEMA_VERSION");
});
test("S04 research action gate rejects unapproved policy actions, never edits the complete output", () => {
  const f = goldenCase("B"), result = analyzeFinancialProfile(f.profile, f.options, moneyModelV1Bundle); assert.equal(result.ok, true);
  const before = structuredClone(result.output); failure(checkAnalysisCapability(result.output, request.requestId), "RESEARCH_POLICY_ACTION_NOT_APPROVED", "UNSUPPORTED_CAPABILITY");
  assert.deepEqual(result.output, before);
  const supported = baseline(sourceGoldenCase("A")).result.output; assert.equal(checkAnalysisCapability(supported, request.requestId).ok, true);
});
test("S04 identity required; command cannot supply or override another owner", async () => {
  const denied = { requestId: "denied", identityContext: null }; failure(await prepare(command(), {}, denied), "IDENTITY_REQUIRED", "UNAUTHENTICATED");
  failure(await prepare(command(), { identity: { async resolveSubject() { return "private@example.com"; } } }), "INVALID_SUBJECT");
  failure(await prepare(command(), {}, { ...request, requestId: "../invalid" }), "INVALID_REQUEST_CONTEXT");
  const a = success(await prepare()), b = success(await prepare(command(), {}, { ...request, identityContext: { testSubject: "synthetic-owner-b" } }));
  assert.equal(b.candidate.ownerSubject, "synthetic-owner-b"); assert.notEqual(a.candidate.analysisFingerprint, b.candidate.analysisFingerprint);
  assert.equal(JSON.stringify(a.workspace), JSON.stringify(b.workspace)); assert.ok(!JSON.stringify(a.workspace).includes("synthetic-owner"));
});
test("S04 malformed JSON/getters/cycles fail without evaluating submitted accessors", async () => {
  let reads = 0; const cmd = command(); Object.defineProperty(cmd.source, "secret", { enumerable: true, get() { reads++; return "private"; } });
  failure(await prepare(cmd), "INVALID_ANALYSIS_COMMAND"); assert.equal(reads, 0);
  const cyclic = command(); cyclic.source.loop = cyclic; failure(await prepare(cyclic), "INVALID_ANALYSIS_COMMAND");
  failure(await prepare({ ...command(), idempotencyKey: "s".repeat(97) }), "INVALID_ANALYSIS_COMMAND");
});
test("S04 errors and telemetry never expose private facts or provider exceptions", async () => {
  const { service, events } = testService({ identity: { async resolveSubject() { throw new Error("TOKEN_SECRET 12345 private@example.com"); } } });
  const err = failure(await service.prepareProfileAnalysis(request, command(), reservation), "ANALYSIS_UNAVAILABLE", "INTERNAL_ERROR"); assert.equal(err.retryable, true);
  assert.ok(!JSON.stringify({ err, events }).includes("TOKEN_SECRET")); assert.deepEqual(Object.keys(events[0]).sort(), ["category", "event", "operation", "requestId", "safeCode"]);
  const ordinary = testService(); success(await ordinary.service.prepareProfileAnalysis(request, command("A"), reservation));
  assert.deepEqual(Object.keys(ordinary.events[0]).sort(), ["bundleVersion", "event", "operation", "requestId"]);
  assert.ok(!JSON.stringify(ordinary.events).includes("5000"));
  success(await prepare(command(), { observability: { emit() { throw new Error("secret"); } } }));
});
test("S04 injected audit clock is separate from financial dates", async () => {
  const a = success(await prepare()), b = success(await prepare(command(), { clock: { now() { return "2027-01-01T00:00:00Z"; } } }));
  assert.notEqual(a.candidate.createdAt, b.candidate.createdAt); assert.deepEqual(a.candidate.output, b.candidate.output);
  assert.equal(a.candidate.analysisFingerprint, b.candidate.analysisFingerprint);
  assert.equal(a.workspace.basis.asOf, "2026-10-02"); assert.equal(a.workspace.basis.monthlyPeriodId, "2026-09");
  for (const now of ["invalid", "2026-02-30T00:00:00Z", "2026-10-04T03:00:00+08:00"])
    failure(await prepare(command(), { clock: { now() { return now; } } }), "INVALID_CLOCK_INSTANT", "INTERNAL_ERROR");
});
test("S04 canonical fingerprint is repeatable and independent of locale/execution IDs", async () => {
  const a = success(await prepare()), b = success(await prepare(command(), {}, request, { ...reservation, snapshotId: "new-execution-id" }, "ja-JP"));
  assert.equal(a.candidate.analysisFingerprint, b.candidate.analysisFingerprint); assert.equal(a.candidate.sourceDigest, b.candidate.sourceDigest);
  assert.deepEqual(b.workspace.localizationDiagnostics, ["UNSUPPORTED_LOCALE"]); assert.equal(b.workspace.locale, "zh-TW");
  assert.equal(digestJson(a.candidate.source), "sha256:" + createHash("sha256").update(canonicalJson(a.candidate.source)).digest("hex"));
  const reverse = v => Array.isArray(v) ? v.map(reverse) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).reverse().map(([k, x]) => [k, reverse(x)])) : v;
  const reversed = success(await prepare(reverse(command()))); assert.equal(a.candidate.analysisFingerprint, reversed.candidate.analysisFingerprint);
});
test("S04 financial basis, completeness, source revision and observed facts change fingerprints", async () => {
  const original = success(await prepare()).candidate.analysisFingerprint;
  const mutations = [
    c => { c.source.envelope.basis.asOf = "2026-10-03"; },
    c => { c.source.envelope.basis.monthlyPeriodId = "2026-08"; },
    c => { c.source.envelope.basis.financialCalendarZone = "UTC"; },
    c => { c.source.inventories.assets.state = "PARTIAL"; },
    c => { c.source.envelope.collections.assets[0].values.currentValue.value.data.value = "100001"; },
  ];
  for (const change of mutations) { const cmd = command(); change(cmd); assert.notEqual(success(await prepare(cmd)).candidate.analysisFingerprint, original); }
  const revision = success(await prepare({ ...command(), expectedProfileRevision: 1 }, {}, request, { ...reservation, inputRevision: 2 })); assert.notEqual(revision.candidate.analysisFingerprint, original);
  const key = success(await prepare({ ...command(), idempotencyKey: "different-key" })); assert.equal(key.candidate.analysisFingerprint, original);
});
test("S04 draft/projection detached and immutable: no caller rewrites of financial authority", async () => {
  const cmd = command("A"), r = success(await prepare(cmd)), saved = structuredClone(r.candidate.output);
  assert.throws(() => { r.candidate.output.severity = "NONE"; }, TypeError);
  r.workspace.metrics[0].value.text = "mutated"; cmd.source.envelope.collections.assets[0].values.currentValue.value.data.value = "1";
  assert.deepEqual(r.candidate.output, saved); assert.equal(r.candidate.source.envelope.collections.assets[0].values.currentValue.value.data.value, "60000");
});
test("S04 timezone repeatability preserves output, fingerprint and initial copy", async () => {
  const previous = process.env.TZ; let first;
  try {
    for (const tz of ["UTC", "Asia/Taipei", "Pacific/Honolulu"]) {
      process.env.TZ = tz; const r = success(await prepare(command("A"))); if (first) assert.deepEqual(r, first); else first = r;
    }
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});
