import test from "node:test";
import assert from "node:assert/strict";
import { projectWorkspace } from "../lib/money-os/presentation/workspace.ts";
import { displayValue } from "../lib/money-os/presentation/values.ts";
import { createLocalizer } from "../messages/money-os/index.ts";
import { requiredMessageKeys } from "../messages/money-os/keys.ts";
import { zhTW } from "../messages/money-os/zh-TW.ts";
import { analyzeFinancialProfile, moneyModelV1Bundle } from "../lib/money-model/index.ts";
import { goldenCase, point, sourceGoldenCase } from "./money-os/fixtures/golden-cases.ts";
import { request, reservation, success, failure, command, prepare, baseline, projectionContext } from "./money-os/service-fixtures.mjs";

test("S04 required catalog keys are complete, nonempty, closed and deterministic", () => {
  assert.equal(new Set(requiredMessageKeys).size, requiredMessageKeys.length);
  assert.deepEqual(Object.keys(zhTW).sort(), [...requiredMessageKeys].sort());
  for (const key of requiredMessageKeys) { assert.match(key, /^moneyOs\.(entry|input|metric|stage|severity|mission|finding|missing|why|error|progress|limits)\./u); assert.ok(zhTW[key].trim()); }
  assert.ok(Object.isFrozen(zhTW)); assert.equal(createLocalizer().locale, "zh-TW");
});
test("S04 missing locale/code/key uses literal zh-TW fallback, never raw text or AI", () => {
  for (const locale of ["en-US", "ja-JP", "unknown", null]) {
    const l = createLocalizer(locale); assert.equal(l.locale, "zh-TW"); assert.deepEqual(l.diagnostics, ["UNSUPPORTED_LOCALE"]);
    assert.equal(l.semantic("PRIVATE_123_<script>", { ref: "private" }), "這項說明暫時無法顯示");
    assert.equal(l.semantic("IMPACT_PRIVATE_TOKEN"), "這項說明暫時無法顯示");
    assert.equal(l.text("missing-key"), "這項說明暫時無法顯示");
    assert.ok(!JSON.stringify(l.diagnostics).includes("PRIVATE")); assert.ok(l.diagnostics.includes("UNKNOWN_SEMANTIC_CODE"));
  }
  const l = createLocalizer(); assert.ok(!l.semantic("MISSING_VALUE_REF", { ref: "metrics.netMonthlyIncome" }).includes("metrics."));
  assert.equal(l.semantic("MISSING_VALUE_REF", { ref: "flags.private" }), "這項說明暫時無法顯示");
});
test("S04 all six Why parts retain every raw-source linkage without exposing raw rule/assumption IDs", async () => {
  const r = success(await prepare(command("A"))), out = r.candidate.output, p = out.mainQuest.provenance, why = r.workspace.mainQuest.details;
  for (const key of ["sources", "metrics", "mechanism", "assumptions", "missing", "limits"]) assert.ok(why[key].title);
  assert.equal(why.sources.items.length, p.sourceInputRefs.length);
  assert.deepEqual(why.metrics.items.map(m => m.key), out.metrics.filter(m => p.metricRefs.includes(m.id)).map(m => m.id));
  assert.deepEqual(why.support.findingKeys, p.findingIds);
  assert.equal(why.support.rules, p.ruleRefs.length); assert.equal(why.support.evidence, p.evidenceRefs.length);
  assert.equal(why.support.models, p.modelRefs.length); assert.equal(why.support.assumptions, p.assumptionRefs.length);
  assert.ok(why.sources.items.some(s => s.label === "每月實拿收入" && s.value.canonical === "30000"));
  assert.equal(why.limits.confidence.level, out.mainQuest.confidence.level);
  assert.ok(why.limits.confidence.reasons.some(t => t.includes("工作版本")));
  const text = JSON.stringify(r.workspace);
  assert.ok(!/R-\d{3}|AS-\d{3}|EV-\d{3}|income\.salary|resources\.resource/u.test(text));
  assert.ok(!text.includes("bottleneck_v1")); assert.equal(r.workspace.confidence.level, out.confidenceAssessment.level);
});
test("S04 every finding, bottleneck and side mission has its own supported Why and confidence", async () => {
  const cmd = command("C"); cmd.source.facts.liabilities.loan.delinquencyStatus = "DELINQUENT";
  const r = success(await prepare(cmd)), out = r.candidate.output;
  assert.equal(r.workspace.findings.length, out.findings.length); assert.equal(r.workspace.sideMissions.length, out.sideMissions.length);
  for (const finding of out.findings) {
    const dto = r.workspace.findings.find(f => f.key === finding.id); assert.equal(dto.confidence.level, finding.confidence.level);
    assert.equal(dto.details.sources.items.length, finding.provenance.sourceInputRefs.length);
    assert.equal(dto.details.assumptions.items.length, finding.provenance.assumptionRefs.length);
  }
  for (const side of out.sideMissions) { const dto = r.workspace.sideMissions.find(m => m.key === side.id); assert.equal(dto.details.sources.items.length, side.provenance.sourceInputRefs.length); }
  assert.ok(r.workspace.bottleneck.details.mechanism.items.length);
  assert.ok(!JSON.stringify(r.workspace).includes("AS-002"));
});
test("S04 R015 projection preserves scoped reconciliation AND independent delinquency/Discover", () => {
  const f = goldenCase("C"); f.options.snapshotId = reservation.snapshotId; f.profile.reportedMonthlySavings = point(50000);
  f.profile.liabilities[0].delinquencyStatus = "DELINQUENT";
  const result = analyzeFinancialProfile(f.profile, f.options, moneyModelV1Bundle); assert.equal(result.ok, true, JSON.stringify(result));
  assert.ok(result.output.ruleIds.includes("R-015")); assert.ok(result.output.ruleIds.includes("R-002")); const before = structuredClone(result.output);
  const dto = success(projectWorkspace(result.output, projectionContext(sourceGoldenCase("C")), request.requestId));
  assert.equal(dto.state, "ACTION_SUPPORTED"); assert.equal(result.output.mainQuest.code, "RESOLVE_DELINQUENCY");
  assert.ok(dto.sideMissions.some(m => m.title.includes("核對")));
  assert.deepEqual(dto.sideMissions.map(m => m.key), result.output.sideMissions.map(m => m.id));
  assert.ok(dto.findings.some(finding => finding.text.includes("儲蓄"))); assert.deepEqual(result.output, before);
});
test("S04 R015-only is information/correction, never healthy or Optionality", () => {
  const f = goldenCase("D"); f.options.snapshotId = reservation.snapshotId; f.profile.reportedMonthlySavings = point(50000);
  const result = analyzeFinancialProfile(f.profile, f.options, moneyModelV1Bundle); assert.equal(result.ok, true);
  const dto = success(projectWorkspace(result.output, projectionContext(), request.requestId));
  assert.equal(dto.state, "NEED_MORE_INFORMATION"); assert.ok(dto.mainQuest.title.includes("核對")); assert.notEqual(dto.stage.value, "OPTIONALITY");
});
test("S04 null mainQuest is not enough for no-action; R014 and supported data must be explicit", async () => {
  const d = success(await prepare()), c = command(); c.source.facts.assets.cash.ownership = "UNKNOWN";
  const partial = success(await prepare(c)); assert.equal(d.workspace.mainQuest, null); assert.equal(d.workspace.state, "NO_ACTION_REQUIRED");
  assert.equal(d.workspace.stage.value, null); assert.ok(d.workspace.summary.includes("依目前可支持的資料"));
  assert.notEqual(partial.workspace.state, "NO_ACTION_REQUIRED"); assert.notEqual(partial.workspace.stage.value, "OPTIONALITY");
  assert.ok(!/健康|財務自由|已完成所有/u.test(d.workspace.summary));
});
test("S04 invalid/tampered/incomplete output never becomes success DTO", () => {
  const { result } = baseline(sourceGoldenCase("A")), original = structuredClone(result.output);
  for (const mutate of [
    o => { delete o.confidenceAssessment; }, o => { delete o.evaluation.inputRecords; }, o => { o.metrics[0].value.data.value = 999999; },
    o => { o.sideMissions.push({}); }, o => { o.mainQuest.provenance.sourceInputRefs = []; },
    o => { o.currentStage = "OPTIONALITY"; }, o => { o.metrics[0].value = { status: "UNKNOWN", reasonCode: "MISSING", data: { value: 0 } }; },
  ]) { const output = structuredClone(original); mutate(output); failure(projectWorkspace(output, projectionContext(sourceGoldenCase("A")), request.requestId), "INVALID_DECISION_OUTPUT", "DOMAIN_INVARIANT_VIOLATION"); }
  assert.deepEqual(result.output, original);
});
test("S04 historical/snapshot/basis/producer mismatches fail; output is never validated against latest", () => {
  const { result } = baseline(sourceGoldenCase("D"));
  const variants = [
    c => { c.snapshotId = "different"; }, c => { c.basis.asOf = "2026-10-03"; }, c => { c.manifest.financialModelVersion = "other"; },
    c => { c.manifest.producerBundleVersion = "2"; }, c => { c.basis.monthlyPeriodId = "2026-08"; }, c => { c.basis.primaryCurrency = "USD"; },
  ];
  for (const mutate of variants) { const c = structuredClone(projectionContext()); mutate(c); failure(projectWorkspace(result.output, c, request.requestId), "SNAPSHOT_BUNDLE_MISMATCH"); }
  const c = structuredClone(projectionContext()); c.versions.bundle.artifactDigest = "different";
  failure(projectWorkspace(result.output, c, request.requestId), "MODEL_ARTIFACT_UNAVAILABLE");
});
test("S04 hostile output JSON/getters/cycles are inert, bounded and not echoed", () => {
  const { result } = baseline(sourceGoldenCase("D")); let reads = 0;
  const output = structuredClone(result.output); Object.defineProperty(output, "secret", { enumerable: true, get() { reads++; return "PRIVATE"; } });
  failure(projectWorkspace(output, projectionContext(), request.requestId), "INVALID_DECISION_OUTPUT"); assert.equal(reads, 0);
  const cyclic = structuredClone(result.output); cyclic.loop = cyclic; failure(projectWorkspace(cyclic, projectionContext(), request.requestId), "INVALID_DECISION_OUTPUT");
  const context = projectionContext(); Object.defineProperty(context, "versions", { enumerable: true, get() { reads++; return null; } });
  failure(projectWorkspace(result.output, context, request.requestId), "INVALID_PROJECTION_CONTEXT"); assert.equal(reads, 0);
});
test("S04 display preserves signed, tiny, ratio, zero and N/A values; no hidden rounding/FX", () => {
  const l = createLocalizer(), known = number => displayValue({ status: "KNOWN", data: { value: number, source: "CALCULATED", updatedAt: "2026-10-02" } }, l);
  assert.equal(known(-5000).canonical, "-5000"); assert.equal(known(-5000).text, "-5,000"); assert.equal(known(0).canonical, "0");
  assert.equal(known(1e-18).canonical, "0.000000000000000001"); assert.ok(!/^0$/u.test(known(1e-18).text));
  assert.equal(known(1e-30).canonical, "1e-30"); assert.equal(known(1e-30).text, "1e-30");
  assert.equal(known(0.25).canonical, "0.25"); assert.equal(known(0.25).text, "0.25");
  assert.deepEqual(displayValue({ status: "NOT_APPLICABLE", reasonCode: "SUPPORTED" }, l), { status: "NOT_APPLICABLE", text: "此項不適用（依受支持的合約）" });
});
test("S04 financial locale fallback changes only render metadata, not financial output", async () => {
  const r = success(await prepare(command("C"))), before = structuredClone(r.candidate.output);
  const c = { ...projectionContext(sourceGoldenCase("C")), locale: "en-US" }, dto = success(projectWorkspace(r.candidate.output, c, request.requestId));
  assert.deepEqual(dto.metrics, r.workspace.metrics); assert.deepEqual(dto.mainQuest, r.workspace.mainQuest); assert.deepEqual(r.candidate.output, before);
  assert.deepEqual(dto.localizationDiagnostics, ["UNSUPPORTED_LOCALE"]); assert.equal(dto.locale, "zh-TW");
});
test("S04 large valid source: lineage >100 refs is retained, not source-bound/truncated", async () => {
  const cmd = command(), income = cmd.source.envelope.collections.income[0];
  cmd.source.envelope.collections.income = Array.from({ length: 100 }, (_, i) => ({ ...structuredClone(income), id: "salary-" + i }));
  for (const record of cmd.source.envelope.collections.income) record.values.averageMonthlyNetIncome.value.data.value = "600";
  cmd.source.facts.income = Object.fromEntries(cmd.source.envelope.collections.income.map(record => [record.id, { type: "SALARY", stability: "HIGH", monthlyBasisConfirmed: true }]));
  const r = success(await prepare(cmd)); const out = r.candidate.output;
  const metric = out.metrics.find(m => m.id === "metrics.netMonthlyIncome"); assert.equal(metric.value.data.value, 60000);
  assert.ok(out.provenance.sourceInputRefs.length > 100); assert.equal(r.workspace.details.sources.items.length, out.provenance.sourceInputRefs.length);
  assert.deepEqual(r.workspace.localizationDiagnostics, []);
});
