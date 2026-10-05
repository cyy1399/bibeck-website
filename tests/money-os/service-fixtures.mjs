import assert from "node:assert/strict";
import { createAnalysisService } from "../../lib/money-os/application/analyze-profile.ts";
import { currentAnalysisVersions } from "../../lib/money-os/application/version-dispatcher.ts";
import { adaptSourceProfile } from "../../lib/money-os/adapters/profile-adapter.ts";
import { analyzeFinancialProfile, moneyModelV1Bundle } from "../../lib/money-model/index.ts";
import { sourceGoldenCase } from "./fixtures/golden-cases.ts";
export const request = { requestId: "s04-test-request", identityContext: { testSubject: "synthetic-owner-a" } };
export const reservation = { profileId: "test-profile", snapshotId: "s04-test-snapshot", inputRevision: 1 };
export const auditTime = "2026-10-04T03:00:00.000Z";
export const success = result => { assert.equal(result.ok, true, JSON.stringify(result)); return result.value; };
export const failure = (result, code, category) => {
  assert.equal(result.ok, false); assert.equal(result.error.safeCode, code);
  if (category) assert.equal(result.error.category, category); assert.ok(!("value" in result)); return result.error;
};
/** Test-only adapters, never exported from production modules. */
export function testService(overrides = {}) {
  const events = [];
  const service = createAnalysisService({ identity: { async resolveSubject(context) { return context.identityContext?.testSubject ?? null; } },
    clock: { now() { return auditTime; } }, observability: { emit(event) { events.push(structuredClone(event)); } }, ...overrides });
  return { service, events };
}
export const command = (id = "D") => ({ source: sourceGoldenCase(id), expectedProfileRevision: 0, idempotencyKey: "test-command" });
export const prepare = (cmd = command(), overrides = {}, ctx = request, reserved = reservation, locale = "zh-TW") =>
  testService(overrides).service.prepareProfileAnalysis(ctx, cmd, reserved, locale);
export function baseline(source, snapshotId = reservation.snapshotId) {
  const a = success(adaptSourceProfile(source, { snapshotId, producerBundleVersion: "1.0.0" }));
  const result = analyzeFinancialProfile(a.profile, a.options, moneyModelV1Bundle);
  assert.equal(result.ok, true, JSON.stringify(result)); return { adapted: a, result };
}
export function projectionContext(source = sourceGoldenCase("D"), snapshotId = reservation.snapshotId) {
  const a = success(adaptSourceProfile(source, { snapshotId, producerBundleVersion: "1.0.0" }));
  return { versions: currentAnalysisVersions, manifest: a.manifest, basis: a.source.envelope.basis, snapshotId, inputRevision: 1 };
}
