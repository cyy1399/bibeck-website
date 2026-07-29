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

export type TradingCostComparisonInput = {
  thirtyDayVolume: number;
  baselineFeeRate: number;
  vipFeeRate: number;
  rebateRate: number;
};

export type TradingCostComparison = {
  baselineFee: number;
  vipFee: number;
  vipSavings: number;
  rebate: number;
  actualCost: number;
  totalSavings: number;
  effectiveFeeRate: number;
  annualBaselineCost: number;
  annualVipCost: number;
  annualActualCost: number;
  annualTotalSavings: number;
};

export function calculateTradingCostComparison(input: TradingCostComparisonInput): TradingCostComparison {
  const volume = nonNegative(input.thirtyDayVolume);
  const baselineRate = nonNegative(input.baselineFeeRate);
  const vipRate = nonNegative(input.vipFeeRate);
  const rebateRate = Math.min(1, nonNegative(input.rebateRate));
  const baselineFee = volume * baselineRate;
  const vipFee = volume * vipRate;
  const vipSavings = Math.max(0, baselineFee - vipFee);
  const rebate = vipFee * rebateRate;
  const actualCost = Math.max(0, vipFee - rebate);
  const totalSavings = Math.max(0, baselineFee - actualCost);

  return {
    baselineFee,
    vipFee,
    vipSavings,
    rebate,
    actualCost,
    totalSavings,
    effectiveFeeRate: volume === 0 ? 0 : actualCost / volume,
    annualBaselineCost: baselineFee * 12,
    annualVipCost: vipFee * 12,
    annualActualCost: actualCost * 12,
    annualTotalSavings: totalSavings * 12,
  };
}

export type TierProgress = { percentage: number; remaining: number; isHighest: boolean };

export function calculateTierProgress(volume: number, currentMin: number, nextMin: number | null): TierProgress {
  const safeVolume = nonNegative(volume);
  if (nextMin === null) return { percentage: 100, remaining: 0, isHighest: true };
  const span = Math.max(1, nextMin - currentMin);
  return {
    percentage: Math.min(100, Math.max(0, ((safeVolume - currentMin) / span) * 100)),
    remaining: Math.max(0, nextMin - safeVolume),
    isHighest: false,
  };
}
