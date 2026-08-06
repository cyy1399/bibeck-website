export const COMPARISON_ROWS = [
  { key: "plan", label: "方案" },
  { key: "vipTier", label: "VIP 等級" },
  { key: "bibeckTier", label: "BiBeck 級距" },
  { key: "feeRate", label: "手續費率" },
  { key: "vipSavings", label: "VIP 節省" },
  { key: "rebateRate", label: "BiBeck 返傭比例" },
  { key: "rebateAmount", label: "30 日返傭金額" },
  { key: "actualCost", label: "30 日實際交易成本" },
  { key: "totalSavings", label: "30 日合計節省" },
  { key: "annualCost", label: "年度預估成本" },
  { key: "annualSavings", label: "年度預估節省" },
  { key: "effectiveRate", label: "實際有效費率" },
  { key: "costReduction", label: "總成本降低比例" },
] as const;

export type ComparisonRowKey = (typeof COMPARISON_ROWS)[number]["key"];
export type ComparisonPlan = "baseline" | "vip" | "bibeck";
export type ComparisonValues = Record<ComparisonRowKey, string>;
