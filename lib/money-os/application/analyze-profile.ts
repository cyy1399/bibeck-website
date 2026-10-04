import { analyzeFinancialProfile } from "../../money-model/index.ts";
import type { DecisionOutput } from "../../money-model/index.ts";
import { validateDecisionOutput } from "../../money-model/runtime/output-validator.ts";
import { boundedJson } from "../adapters/domain-value-codec.ts";
import { adaptSourceProfile } from "../adapters/profile-adapter.ts";
import { auditInstant } from "../adapters/time-codec.ts";
import { plainRecord, exactKeys } from "../contracts/errors.ts";
import { appFailure, type AppResult, type RequestContext, type CandidateReservation, type PreparedAnalysis } from "../contracts/commands.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { ClockPort } from "../ports/clock.ts";
import type { ObservabilityPort } from "../ports/observability.ts";
import { resolveAnalysisBundle, currentAnalysisVersions } from "./version-dispatcher.ts";
import { digestJson, fingerprintAnalysis, immutableCopy } from "./fingerprint.ts";
import { projectWorkspace } from "../presentation/workspace.ts";

export interface AnalysisServiceDependencies { identity: IdentityPort; clock: ClockPort; observability?: ObservabilityPort; versions?: unknown }
const opaqueId = (value: unknown): value is string => typeof value === "string" && /^[A-Za-z0-9_-]{1,96}$/u.test(value);
const policyActions = new Set(["BUILD_MINIMUM_LIQUIDITY", "REDUCE_HIGH_COST_DEBT", "DECIDE_GOAL_PRIORITY"]);
/** Release/capability gate, not a financial rule; never edits the domain output. */
export function checkAnalysisCapability(output: DecisionOutput, requestId: string): AppResult<true> {
  return [...(output.mainQuest ? [output.mainQuest] : []), ...output.sideMissions].some(m => policyActions.has(m.code))
    ? appFailure("UNSUPPORTED_CAPABILITY", "RESEARCH_POLICY_ACTION_NOT_APPROVED", requestId, ["output"]) : { ok: true, value: true };
}
/** Internal application seam only. No HTTP entry, published pointer, or persistence success. */
export function createAnalysisService(dependencies: AnalysisServiceDependencies) {
  async function analyzeCandidate(context: RequestContext, command: unknown, reservation: CandidateReservation, locale?: string): Promise<AppResult<PreparedAnalysis>> {
    const requestId = context.requestId;
    const selected = resolveAnalysisBundle(dependencies.versions ?? currentAnalysisVersions, requestId);
    if (!selected.ok) return selected;
    const ownerSubject = await dependencies.identity.resolveSubject(context);
    if (ownerSubject === null) return appFailure("UNAUTHENTICATED", "IDENTITY_REQUIRED", requestId);
    if (typeof ownerSubject !== "string" || !/^[A-Za-z0-9:_|\-]{1,128}$/u.test(ownerSubject))
      return appFailure("UNAUTHENTICATED", "INVALID_SUBJECT", requestId);
    if (!boundedJson(command).ok || !plainRecord(command) || !exactKeys(command, ["source", "expectedProfileRevision", "idempotencyKey"])
      || !Number.isSafeInteger(command.expectedProfileRevision) || (command.expectedProfileRevision as number) < 0 || !opaqueId(command.idempotencyKey))
      return appFailure("VALIDATION_ERROR", "INVALID_ANALYSIS_COMMAND", requestId, ["command"]);
    if (!plainRecord(reservation) || !exactKeys(reservation, ["profileId", "snapshotId", "inputRevision"])
      || !opaqueId(reservation.profileId) || !opaqueId(reservation.snapshotId) || !Number.isSafeInteger(reservation.inputRevision)
      || reservation.inputRevision !== (command.expectedProfileRevision as number) + 1)
      return appFailure("VALIDATION_ERROR", "INVALID_CANDIDATE_RESERVATION", requestId, ["candidate"]);
    if (!plainRecord(command.source) || command.source.adapterSourceVersion !== currentAnalysisVersions.adapterSourceVersion
      || !plainRecord(command.source.envelope) || command.source.envelope.profileEnvelopeVersion !== currentAnalysisVersions.profileEnvelopeVersion
      || command.source.envelope.codecVersion !== currentAnalysisVersions.codecVersion)
      return appFailure("UNSUPPORTED_SCHEMA_VERSION", "SOURCE_SCHEMA_UNSUPPORTED", requestId, ["source"]);
    const adapted = adaptSourceProfile(command.source, { snapshotId: reservation.snapshotId, producerBundleVersion: currentAnalysisVersions.producerBundleVersion });
    if (!adapted.ok) return appFailure("VALIDATION_ERROR", adapted.error.safeCode, requestId, ["source"]);
    // Capture canonical detached source before any await. The producer precedes the
    // single domain facade; no metrics/flags/completeness are overwritten afterward.
    const a = adapted.value, bundle = selected.value;
    const result = analyzeFinancialProfile(a.profile, a.options, bundle);
    if (!result.ok) {
      const category = result.error.category === "CONTRADICTORY_STATE" ? "DOMAIN_INVARIANT_VIOLATION"
        : result.error.category === "MISSING_REQUIRED_INFORMATION" ? "MISSING_REQUIRED_INFORMATION" : result.error.category;
      return appFailure(category, result.error.safeCode, requestId, ["output"]);
    }
    if (!validateDecisionOutput(result.output, bundle).valid || result.output.evaluation.snapshotId !== reservation.snapshotId
      || a.manifest.financialModelVersion !== bundle.manifest.id)
      return appFailure("DOMAIN_INVARIANT_VIOLATION", "INVALID_DECISION_OUTPUT", requestId, ["output"]);
    const capability = checkAnalysisCapability(result.output, requestId);
    if (!capability.ok) return capability;
    const now = auditInstant(dependencies.clock.now());
    if (!now.ok) return appFailure("INTERNAL_ERROR", "INVALID_CLOCK_INSTANT", requestId, ["clock"]);
    const projected = projectWorkspace(result.output, { versions: currentAnalysisVersions, manifest: a.manifest,
      basis: a.source.envelope.basis, snapshotId: reservation.snapshotId, inputRevision: reservation.inputRevision, ...(locale === undefined ? {} : { locale }) }, requestId);
    if (!projected.ok) return projected;
    return { ok: true, value: {
      candidate: immutableCopy({ kind: "UNPUBLISHED_ANALYSIS_CANDIDATE" as const, ownerSubject, ...reservation, createdAt: now.value,
        versions: currentAnalysisVersions, source: a.source, producerManifest: a.manifest,
        sourceDigest: digestJson(a.source), analysisFingerprint: fingerprintAnalysis(ownerSubject, reservation.profileId, reservation.inputRevision, a, currentAnalysisVersions, result.output),
        output: result.output, diagnostics: result.diagnostics }),
      workspace: projected.value,
    } };
  }
  return {
    async prepareProfileAnalysis(context: RequestContext, command: unknown, reservation: CandidateReservation, locale?: string): Promise<AppResult<PreparedAnalysis>> {
      const requestId = plainRecord(context) && opaqueId(context.requestId) ? context.requestId : "INVALID_REQUEST";
      let result: AppResult<PreparedAnalysis>;
      try {
        result = requestId === "INVALID_REQUEST" ? appFailure("VALIDATION_ERROR", "INVALID_REQUEST_CONTEXT", requestId)
          : await analyzeCandidate(context, command, reservation, locale);
      } catch { result = appFailure("INTERNAL_ERROR", "ANALYSIS_UNAVAILABLE", requestId, [], true); }
      // Telemetry failure never changes finance or returns provider exception text.
      try { dependencies.observability?.emit({ event: result.ok ? "money_os.analysis.completed" : result.error.category === "UNAUTHENTICATED" ? "money_os.identity.denied" : "money_os.analysis.failed",
        requestId, operation: "PREPARE_PROFILE_ANALYSIS", ...(result.ok ? { bundleVersion: result.value.candidate.versions.bundle.runtimeVersion } : { category: result.error.category, safeCode: result.error.safeCode }) }); }
      catch { /* Optional allowlisted telemetry is non-authoritative. */ }
      return result;
    },
  };
}
