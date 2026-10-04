import type { AnalysisCandidate } from "./analysis.ts";
import type { WorkspaceDto, WhyDto } from "./read-dto.ts";
import type { AdapterSource } from "./producer-manifest.ts";

export type AppErrorCategory = "VALIDATION_ERROR" | "MISSING_REQUIRED_INFORMATION" | "DOMAIN_INVARIANT_VIOLATION"
  | "UNSUPPORTED_MODEL_VERSION" | "UNSUPPORTED_SCHEMA_VERSION" | "UNSUPPORTED_CAPABILITY"
  | "REVISION_CONFLICT" | "STALE_MISSION" | "IDEMPOTENCY_CONFLICT" | "UNAUTHENTICATED"
  | "NOT_FOUND" | "UNAVAILABLE" | "INTERNAL_ERROR";
export interface AppError { category: AppErrorCategory; safeCode: string; fieldRefs: string[]; requestId: string; retryable: boolean }
export type AppResult<T> = { ok: true; value: T } | { ok: false; error: AppError };
/** Server-created transport context. Never read identity from the command body. */
export interface RequestContext { requestId: string; identityContext: unknown }
export interface SaveProfileCommand { source: AdapterSource; expectedProfileRevision: number; idempotencyKey: string }
/** Server reservations only. S04 does not claim that a revision was persisted. */
export interface CandidateReservation { profileId: string; snapshotId: string; inputRevision: number }
export interface PreparedAnalysis { candidate: AnalysisCandidate; workspace: WorkspaceDto }
export interface CommittedAnalysis { profileRevision: number; decisionSnapshotId: string; workspace: WorkspaceDto }
export interface RevisionCommand { expectedProfileRevision: number; idempotencyKey: string }
export interface MissionReportCommand extends RevisionCommand {
  sourceSnapshotId: string; missionId: string; expectedReportRevision: number; status: "IN_PROGRESS" | "USER_REPORTED_DONE";
}
/** Future persistence services: signatures only, no no-op/fake writer in S04. */
export interface MoneyOsServiceContract {
  getWorkspace(context: RequestContext, locale?: string): Promise<AppResult<WorkspaceDto | { state: "NEW_USER" }>>;
  saveProfileAndAnalyze(context: RequestContext, command: SaveProfileCommand): Promise<AppResult<CommittedAnalysis>>;
  reviewCurrentState(context: RequestContext, command: RevisionCommand & { asOf: string; monthlyPeriodId: string; cause: "UNCHANGED" | "REQUEST_REVIEW" }): Promise<AppResult<CommittedAnalysis>>;
  getDecisionDetails(context: RequestContext, snapshotId: string, conclusionId?: string): Promise<AppResult<WhyDto>>;
  reportMissionProgress(context: RequestContext, command: MissionReportCommand): Promise<AppResult<{ sourceSnapshotId: string; missionId: string; status: MissionReportCommand["status"] }>>;
  confirmFinancialState(context: RequestContext, command: SaveProfileCommand & { mode: "OBSERVED_STATE" }): Promise<AppResult<CommittedAnalysis>>;
}
export const appFailure = (category: AppErrorCategory, safeCode: string, requestId: string, fieldRefs: string[] = [], retryable = false): AppResult<never> =>
  ({ ok: false, error: { category, safeCode, requestId, fieldRefs, retryable } });
