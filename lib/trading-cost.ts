export type TradingCostInput = {
  monthlyVolume: number;
  feeRate: number;
  rebateRate: number;
};

export type TradingCostResult = {
  monthlyRawFee: number;
  monthlyRebate: number;
  monthlyActualCost: number;
  annualActualCost: number;
  effectiveFeeRate: number;
};

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function calculateTradingCost(input: TradingCostInput): TradingCostResult {
  const monthlyVolume = nonNegative(input.monthlyVolume);
  const feeRate = nonNegative(input.feeRate);
  const rebateRate = Math.min(1, nonNegative(input.rebateRate));
  const monthlyRawFee = monthlyVolume * feeRate;
  const monthlyRebate = monthlyRawFee * rebateRate;
  const monthlyActualCost = Math.max(0, monthlyRawFee - monthlyRebate);

  return {
    monthlyRawFee,
    monthlyRebate,
    monthlyActualCost,
    annualActualCost: monthlyActualCost * 12,
    effectiveFeeRate: monthlyVolume > 0 ? monthlyActualCost / monthlyVolume : 0,
  };
}

export type ComparisonOutcome = "current" | "bybit" | "equal";

export function compareAnnualCosts(currentAnnualCost: number, bybitAnnualCost: number): ComparisonOutcome {
  const epsilon = 0.005;
  if (bybitAnnualCost + epsilon < currentAnnualCost) return "bybit";
  if (currentAnnualCost + epsilon < bybitAnnualCost) return "current";
  return "equal";
}