import { createHash } from "node:crypto";
import type { AdaptedProfile } from "../contracts/producer-manifest.ts";
import type { AnalysisVersions } from "../contracts/analysis.ts";
import type { DecisionOutput } from "../../money-model/index.ts";

/** Validated JSON only. Array order is retained; no undocumented financial equivalence. */
export function canonicalJson(value: unknown): string {
  const visit = (item: unknown): unknown => Array.isArray(item) ? item.map(visit)
    : item !== null && typeof item === "object" ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, child]) => [key, visit(child)])) : item;
  return JSON.stringify(visit(value));
}
export const digestJson = (value: unknown): string => "sha256:" + createHash("sha256").update(canonicalJson(value), "utf8").digest("hex");
export function fingerprintAnalysis(ownerSubject: string, profileId: string, inputRevision: number, adapted: AdaptedProfile, versions: AnalysisVersions, output: DecisionOutput): string {
  const { snapshotId: _snapshotId, ...manifest } = adapted.manifest;
  void _snapshotId;
  return digestJson({ ownerSubject, profileId, inputRevision, source: adapted.source, manifest,
    resources: adapted.options.resources, assignments: adapted.options.assignments, claims: adapted.options.claims ?? null,
    claimCandidates: adapted.claimCandidates, complete: adapted.options.complete, versions,
    policyValues: output.evaluation.configValues, policyRevisions: output.assumptions,
    asOf: adapted.manifest.asOf, monthlyPeriodId: adapted.manifest.monthlyPeriodId });
}
/** Caller mutation cannot alter an internal successful draft or another projection. */
export function immutableCopy<T>(value: T): T {
  const copy: T = JSON.parse(JSON.stringify(value));
  const freeze = (item: unknown): void => { if (item && typeof item === "object") { Object.values(item).forEach(freeze); Object.freeze(item); } };
  freeze(copy); return copy;
}
