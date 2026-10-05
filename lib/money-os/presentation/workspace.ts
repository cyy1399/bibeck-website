import { validateDecisionOutput } from "../../money-model/runtime/output-validator.ts";
import type { DecisionOutput } from "../../money-model/index.ts";
import type { AnalysisVersions } from "../contracts/analysis.ts";
import type { ProducerManifest } from "../contracts/producer-manifest.ts";
import type { SourceBasis } from "../contracts/source.ts";
import type { WorkspaceDto, WorkspaceState, MetricDto } from "../contracts/read-dto.ts";
import { appFailure, type AppResult } from "../contracts/commands.ts";
import { plainRecord } from "../contracts/errors.ts";
import { parseBasis } from "../adapters/time-codec.ts";
import { resolveAnalysisBundle } from "../application/version-dispatcher.ts";
import { createLocalizer, catalogVersion } from "../../../messages/money-os/index.ts";
import type { MessageKey } from "../../../messages/money-os/keys.ts";
import { displayValue, projectConfidence } from "./values.ts";
import { projectWhy } from "./why.ts";

export interface ProjectionContext {
  versions: AnalysisVersions; manifest: ProducerManifest; basis: SourceBasis;
  snapshotId: string; inputRevision: number; locale?: string;
}
/** Output lineage arrays can exceed SOURCE's 100-record collection bound.
 * Guard inert JSON before the frozen validator; use its 50k nodes/64 levels.
 * Never invoke a getter/toJSON, and never truncate a valid provenance chain. */
function safeProjectionJson(value: unknown): boolean {
  const ancestors = new Set<object>(); let nodes = 0, characters = 0;
  const visit = (item: unknown, depth: number): boolean => {
    if (++nodes > 50000 || depth > 64) return false;
    if (typeof item === "string") { characters += item.length; return characters <= 2 * 1024 * 1024; }
    if (item === null || typeof item === "boolean" || typeof item === "number" && Number.isFinite(item)) return true;
    if (typeof item !== "object" || ancestors.has(item)) return false;
    if (Array.isArray(item)) {
      if (Object.getPrototypeOf(item) !== Array.prototype || Reflect.ownKeys(item).length !== item.length + 1 || item.length > 50000) return false;
      for (let i = 0; i < item.length; i++) if (!Object.hasOwn(Object.getOwnPropertyDescriptor(item, String(i)) ?? {}, "value")) return false;
    } else if (!plainRecord(item)) return false;
    ancestors.add(item);
    const valid = Object.entries(item).every(([key, child]) => { characters += key.length; return characters <= 2 * 1024 * 1024 && visit(child, depth + 1); });
    ancestors.delete(item); return valid;
  };
  return visit(value, 0);
}
/** Render a supplied snapshot, never recalculate it or substitute a historical artifact. */
export function projectWorkspace(input: unknown, context: ProjectionContext, requestId: string): AppResult<WorkspaceDto> {
  try {
    if (!safeProjectionJson(context)) return appFailure("DOMAIN_INVARIANT_VIOLATION", "INVALID_PROJECTION_CONTEXT", requestId, ["output"]);
    const selected = resolveAnalysisBundle(context.versions, requestId);
    if (!selected.ok) return selected;
    const bundle = selected.value;
    if (!safeProjectionJson(input) || !validateDecisionOutput(input, bundle).valid)
      return appFailure("DOMAIN_INVARIANT_VIOLATION", "INVALID_DECISION_OUTPUT", requestId, ["output"]);
    const output = input as DecisionOutput;
    if (!parseBasis(context.basis).ok || !Number.isSafeInteger(context.inputRevision) || context.inputRevision < 1
      || output.evaluation.snapshotId !== context.snapshotId || output.evaluation.source !== "PROFILE_NORMALIZATION"
      || output.evaluation.schemaVersion !== bundle.manifest.schemaVersion
      || output.evaluation.evaluatedAt.slice(0, 10) !== context.basis.asOf
      || context.manifest.snapshotId !== context.snapshotId || context.manifest.asOf !== context.basis.asOf
      || context.manifest.monthlyPeriodId !== context.basis.monthlyPeriodId || context.manifest.financialModelVersion !== bundle.manifest.id
      || context.manifest.producerBundleVersion !== context.versions.producerBundleVersion
      || context.manifest.adapterSourceVersion !== context.versions.adapterSourceVersion || context.manifest.codecVersion !== context.versions.codecVersion
      || output.evaluation.inputRecords?.["profile.primaryCurrency"]?.value !== context.basis.primaryCurrency
      || output.evaluation.inputRecords?.["basis.monthlyPeriodId"]?.value !== context.basis.monthlyPeriodId)
      return appFailure("DOMAIN_INVARIANT_VIOLATION", "SNAPSHOT_BUNDLE_MISMATCH", requestId, ["output"]);
    const l = createLocalizer(context.locale ?? "zh-TW");
    const metrics: MetricDto[] = output.metrics.map(metric => ({
      key: metric.id, label: l.semantic(metric.labelCode), value: displayValue(metric.value, l),
      unit: l.text(("moneyOs.input.unit." + metric.unit) as MessageKey),
      timeBasis: l.text(("moneyOs.input.basis." + metric.timeBasis) as MessageKey),
      currency: metric.currency === "NOT_APPLICABLE" ? null : metric.currency, confidence: projectConfidence(metric.confidence, l),
    }));
    const why = (p: DecisionOutput["provenance"], confidence: DecisionOutput["confidenceAssessment"]) =>
      projectWhy(output, p, confidence, metrics, context.basis, bundle, l);
    const mission = (item: NonNullable<DecisionOutput["mainQuest"]>) => ({
      key: item.id, type: item.type, title: l.semantic(item.code, item.params),
      why: l.semantic(item.whyCode, item.params), action: l.semantic(item.actionCode, item.params), impact: l.semantic(item.impactCode, item.params),
      progress: l.text("moneyOs.progress.TODO"), verification: item.verification.requirementCodes.map(code => l.semantic(code)),
      confidence: projectConfidence(item.confidence, l), details: why(item.provenance, item.confidence),
    });
    // Presentation classes only, selected from explicit validated semantic output.
    // A null mission does not imply R014, health, or OPTIONALITY.
    const state: WorkspaceState = output.findings.some(f => f.code === "CAPITAL_ASSIGNMENT_CONFLICT") ? "DATA_CORRECTION_REQUIRED"
      : output.mainQuest ? output.mainQuest.type === "DISCOVER" ? "NEED_MORE_INFORMATION" : "ACTION_SUPPORTED"
        : output.sideMissions.some(m => m.type === "DISCOVER") ? "NEED_MORE_INFORMATION"
          : output.findings.some(f => f.code === "NO_UNRESOLVED_PRIORITY_CLAIM") && output.sideMissions.length === 0 ? "NO_ACTION_REQUIRED"
          : output.missingInformation.length || context.manifest.coverage.some(c => !c.complete) ? "NEED_MORE_INFORMATION" : "OBSERVATION_ONLY";
    const summaryKeys: Record<WorkspaceState, MessageKey> = {
      ACTION_SUPPORTED: "moneyOs.entry.active", NEED_MORE_INFORMATION: "moneyOs.entry.needInformation",
      DATA_CORRECTION_REQUIRED: "moneyOs.entry.correction", NO_ACTION_REQUIRED: "moneyOs.entry.noAction", OBSERVATION_ONLY: "moneyOs.entry.observation",
    };
    const dto: WorkspaceDto = {
      dtoVersion: "1.0.0", presenterVersion: "1.0.0", catalogVersion, locale: l.locale,
      publication: "UNPUBLISHED", snapshotId: context.snapshotId, inputRevision: context.inputRevision, basis: { ...context.basis },
      state, summary: l.text(summaryKeys[state]), publicationNotice: l.text("moneyOs.entry.draft"),
      stage: { value: output.currentStage, label: l.text(("moneyOs.stage." + (output.currentStage ?? "none")) as MessageKey) },
      severity: { value: output.severity, label: l.text(("moneyOs.severity." + output.severity) as MessageKey) },
      confidence: projectConfidence(output.confidenceAssessment, l),
      bottleneck: output.primaryBottleneck ? { text: l.semantic(output.primaryBottleneck.code, output.primaryBottleneck.params),
        details: why(output.primaryBottleneck.provenance, output.confidenceAssessment) } : null,
      metrics, mainQuest: output.mainQuest ? mission(output.mainQuest) : null, sideMissions: output.sideMissions.map(mission),
      findings: output.findings.map(f => ({ key: f.id, text: l.semantic(f.code, f.params), confidence: projectConfidence(f.confidence, l), details: why(f.provenance, f.confidence) })),
      options: output.options.map(o => ({ key: o.id, text: l.semantic(o.code, o.params), consequence: l.semantic(o.consequenceCode, o.consequenceParams) })),
      explanations: output.explanationRefs.map(ref => l.semantic(ref.code, ref.params)),
      missingInformation: output.missingInformation.map(ref => l.semantic(ref.code, ref.params)),
      producerLimitations: [...new Set(context.manifest.limitations.map(limit => l.text(
        limit.kind === "UNSUPPORTED_MAPPING" ? "moneyOs.limits.producer" : limit.kind === "RESEARCH_REQUIRED" ? "moneyOs.limits.periodization" : "moneyOs.limits.source")))],
      details: why(output.provenance, output.confidenceAssessment), localizationDiagnostics: l.diagnostics,
    };
    return { ok: true, value: JSON.parse(JSON.stringify(dto)) as WorkspaceDto };
  } catch {
    return appFailure("DOMAIN_INVARIANT_VIOLATION", "INVALID_PROJECTION_INPUT", requestId, ["output"]);
  }
}
