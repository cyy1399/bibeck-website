import type { AnalysisCandidate } from "../contracts/analysis.ts";
import type { AdapterSource } from "../contracts/producer-manifest.ts";

export interface OwnedProfileRevision { ownerSubject: string; profileId: string; revision: number; source: AdapterSource }
export interface PublishedSnapshot { publication: "COMMITTED"; candidate: AnalysisCandidate }
/** S06 must implement one owner-scoped CAS transaction with its command receipt. */
export interface ProfileRepositoryPort {
  loadCurrent(ownerSubject: string): Promise<{ profile: OwnedProfileRevision; snapshot: PublishedSnapshot | null } | null>;
  loadSnapshot(ownerSubject: string, snapshotId: string): Promise<PublishedSnapshot | null>;
  commitAnalysis(ownerSubject: string, input: { expectedRevision: number; candidate: AnalysisCandidate; commandKey: string; commandDigest: string }):
    Promise<{ outcome: "COMMITTED" | "REUSED"; snapshot: PublishedSnapshot } | { outcome: "REVISION_CONFLICT" | "IDEMPOTENCY_CONFLICT" }>;
}
