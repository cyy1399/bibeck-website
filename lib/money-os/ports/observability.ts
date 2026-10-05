import type { AppErrorCategory } from "../contracts/commands.ts";
/** No payload, amounts, owner IDs, digests, raw refs, exception messages or tokens. */
export interface AnalysisEvent {
  event: "money_os.analysis.completed" | "money_os.analysis.failed" | "money_os.identity.denied";
  requestId: string;
  operation: "PREPARE_PROFILE_ANALYSIS";
  category?: AppErrorCategory;
  safeCode?: string;
  bundleVersion?: string;
}
export interface ObservabilityPort { emit(event: AnalysisEvent): void }
