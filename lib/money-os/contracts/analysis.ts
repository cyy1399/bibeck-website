import type { DecisionOutput, RuntimeDiagnostics } from "../../money-model/index.ts";
import type { RuntimeBundle } from "../../money-model/registries/runtime-bundle.ts";
import type { AdapterSource, ProducerManifest } from "./producer-manifest.ts";

/** Application versions are independent of frozen financial contracts. */
export interface AnalysisVersions {
  bundle: RuntimeBundle["manifest"];
  profileEnvelopeVersion: string;
  adapterSourceVersion: string;
  codecVersion: string;
  producerBundleVersion: string;
  snapshotVersion: string;
}
export interface AnalysisCandidate {
  kind: "UNPUBLISHED_ANALYSIS_CANDIDATE";
  ownerSubject: string;
  profileId: string;
  snapshotId: string;
  inputRevision: number;
  createdAt: string;
  versions: AnalysisVersions;
  source: AdapterSource;
  producerManifest: ProducerManifest;
  sourceDigest: string;
  analysisFingerprint: string;
  /** Complete financial authority, including every side conclusion and lineage. */
  output: DecisionOutput;
  diagnostics: RuntimeDiagnostics;
}
