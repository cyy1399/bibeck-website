import { zhTW } from "./zh-TW.ts";
import type { MessageKey, MessageParams, LocalizationDiagnostic } from "./keys.ts";
export const catalogVersion = "1.0.0";
export interface Localizer {
  locale: "zh-TW";
  diagnostics: LocalizationDiagnostic[];
  text(key: MessageKey): string;
  semantic(code: string, params?: MessageParams): string;
}
/** Only closed code/field names select copy; posted arbitrary params never become prose. */
export function createLocalizer(requestedLocale: unknown = "zh-TW"): Localizer {
  const diagnostics: LocalizationDiagnostic[] = requestedLocale === "zh-TW" ? [] : ["UNSUPPORTED_LOCALE"];
  const note = (code: LocalizationDiagnostic) => { if (!diagnostics.includes(code)) diagnostics.push(code); };
  const text = (key: MessageKey): string => {
    if (Object.hasOwn(zhTW, key)) return zhTW[key];
    note("UNKNOWN_MESSAGE_KEY"); return zhTW["moneyOs.entry.fallback"];
  };
  const semantic = (code: string, params: MessageParams = {}): string => {
    if (code === "MISSING_VALUE_REF") return refLabel(params.ref ?? "");
    const base = code.startsWith("WHY_") ? code.slice(4) : code.startsWith("IMPACT_") ? code.slice(7) : code;
    if (code === "VERIFIED_SOURCE_OR_STATE_RECALCULATION") return text("moneyOs.mission.verification");
    if (code.startsWith("IMPACT_") && Object.hasOwn(zhTW, "moneyOs.mission." + base)) return text("moneyOs.mission.verification");
    for (const namespace of ["metric", "mission", "finding", "missing"] as const) {
      const key = ("moneyOs." + namespace + "." + (base.startsWith("metrics.") ? base.slice(8) : base)) as MessageKey;
      if (Object.hasOwn(zhTW, key)) return text(key);
    }
    note("UNKNOWN_SEMANTIC_CODE"); return text("moneyOs.entry.fallback");
  };
  const refLabel = (ref: string): string => {
    if (ref.startsWith("metrics.")) return semantic(ref);
    const flags: Record<string, string> = {
      hasMissingCriticalData: "MISSING_CRITICAL_DATA", hasDelinquentDebt: "DELINQUENT_DEBT",
      hasImmediateFundingGap: "IMMEDIATE_FUNDING_GAP", hasNegativeCoreCashFlow: "NEGATIVE_CORE_CASH_FLOW",
      hasUnknownDebtCost: "NEED_MORE_INFORMATION", hasHighCostDebt: "HIGH_COST_DEBT",
      hasMinimumViableLiquidityGap: "MINIMUM_LIQUIDITY_GAP", hasCapitalAssignmentConflict: "CAPITAL_ASSIGNMENT_CONFLICT",
      hasReservedCapital: "RESERVED_CAPITAL_EXCLUDED", hasGoalConflict: "GOAL_FUNDING_CONFLICT",
      hasGoalFundingClaim: "GOAL_FUNDING_REDUCES_INVESTABLE_CAPITAL", hasAllocationConflict: "ALLOCATION_CONFLICT",
      hasNegativeNetWorth: "NEGATIVE_NET_WORTH_CONTEXT", hasZeroIncome: "ZERO_INCOME_REQUIRES_RESOURCE_COVERAGE",
      hasCashFlowContradiction: "CASH_FLOW_CONTRADICTION", hasUnresolvedPriorityClaim: "PRIORITY_CLAIM_COUNT_RECONCILIATION",
    };
    const flag = flags[ref.slice(6)];
    if (ref.startsWith("flags.") && flag) return semantic(flag);
    if (ref.startsWith("counts.")) return text("moneyOs.input.coverage");
    if (ref === "config.minimumViableLiquidityMonths") return text("moneyOs.input.minimumViableLiquidityMonths");
    note("UNKNOWN_SEMANTIC_CODE"); return text("moneyOs.entry.fallback");
  };
  return { locale: "zh-TW", diagnostics, text, semantic };
}
