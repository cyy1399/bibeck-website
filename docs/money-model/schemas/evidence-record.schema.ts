import type { Jurisdiction } from "./common.ts";
export type EvidenceType = "DEFINITION" | "MATHEMATICAL_DERIVATION" | "EXTERNAL_GUIDANCE" | "EMPIRICAL_EVIDENCE" | "BIBECK_MODEL_ASSUMPTION" | "USER_CHOICE";
export type EvidenceStrength = "STRONG" | "MODERATE" | "LIMITED" | "EXPERIMENTAL";
export interface EvidenceRecord { id: string; revision: number; topic: string; claim: string; evidenceType: EvidenceType; sourceName?: string; sourceUrl?: string; sourceJurisdiction?: Jurisdiction; population?: string; publishedAt?: string; lastReviewedAt?: string; evidenceStrength: EvidenceStrength; supports: string[]; doesNotSupport: string[]; limitations: string[]; requiresVerification: boolean; notes: string }
