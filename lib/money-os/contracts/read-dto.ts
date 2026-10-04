import type { Confidence, Severity, Stage } from "../../money-model/contracts/common.ts";
import type { SourceBasis } from "./source.ts";
import type { LocalizationDiagnostic } from "../../../messages/money-os/keys.ts";
/** Terminal display values. Derived canonical strings are never accepted as source edits. */
export type DisplayValue =
  | { status: "KNOWN"; canonical: string | boolean | null; text: string; source: string; updatedAt: string }
  | { status: "UNKNOWN" | "NOT_APPLICABLE"; text: string };
export interface ConfidenceDto { level: Confidence; label: string; reasons: string[] }
export interface MetricDto { key: string; label: string; value: DisplayValue; unit: string; timeBasis: string; currency: string | null; confidence: ConfidenceDto }
export interface SourceDatumDto { key: string; label: string; value: DisplayValue; unit: string; timeBasis: string; currency: string | null }
export interface WhyDto {
  sources: { title: string; items: SourceDatumDto[] };
  metrics: { title: string; items: MetricDto[]; emptyText: string | null };
  mechanism: { title: string; items: string[] };
  assumptions: { title: string; items: { text: string; status: string; revision: number }[]; emptyText: string | null };
  missing: { title: string; items: { key: string; label: string; status: "UNKNOWN" | "NOT_APPLICABLE" }[]; emptyText: string | null };
  limits: { title: string; confidence: ConfidenceDto; changeConditions: string; text: string };
  /** Opaque conclusion links and counts; raw rule/assumption/source paths stay in the owned snapshot. */
  support: { findingKeys: string[]; rules: number; models: number; evidence: number; assumptions: number };
}
export interface MissionDto { key: string; type: string; title: string; why: string; action: string; impact: string; progress: string; verification: string[]; confidence: ConfidenceDto; details: WhyDto }
export interface FindingDto { key: string; text: string; confidence: ConfidenceDto; details: WhyDto }
export type WorkspaceState = "ACTION_SUPPORTED" | "NEED_MORE_INFORMATION" | "DATA_CORRECTION_REQUIRED" | "NO_ACTION_REQUIRED" | "OBSERVATION_ONLY";
export interface WorkspaceDto {
  dtoVersion: "1.0.0"; presenterVersion: "1.0.0"; catalogVersion: string; locale: "zh-TW";
  publication: "UNPUBLISHED"; snapshotId: string; inputRevision: number;
  basis: SourceBasis;
  state: WorkspaceState; summary: string; publicationNotice: string;
  stage: { value: Stage | null; label: string }; severity: { value: Severity; label: string };
  confidence: ConfidenceDto; bottleneck: { text: string; details: WhyDto } | null;
  metrics: MetricDto[]; mainQuest: MissionDto | null; sideMissions: MissionDto[]; findings: FindingDto[];
  options: { key: string; text: string; consequence: string }[];
  explanations: string[]; missingInformation: string[]; producerLimitations: string[];
  details: WhyDto; localizationDiagnostics: LocalizationDiagnostic[];
}
