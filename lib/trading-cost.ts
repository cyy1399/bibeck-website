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

const DECIMAL_SCALE = BigInt("1000000000000");

function decimal(value: number): bigint {
  return BigInt(Math.round(nonNegative(value) * Number(DECIMAL_SCALE)));
}

function multiply(left: number, right: number): number {
  return Number((decimal(left) * decimal(right)) / DECIMAL_SCALE) / Number(DECIMAL_SCALE);
}

function subtract(left: number, right: number): number {
  return Number(decimal(left) - decimal(right)) / Number(DECIMAL_SCALE);
}

export function calculateTradingCost(input: TradingCostInput): TradingCostResult {
  const monthlyVolume = nonNegative(input.monthlyVolume);
  const feeRate = nonNegative(input.feeRate);
  const rebateRate = Math.min(1, nonNegative(input.rebateRate));
  const monthlyRawFee = multiply(monthlyVolume, feeRate);
  const monthlyRebate = multiply(monthlyRawFee, rebateRate);
  const monthlyActualCost = Math.max(0, subtract(monthlyRawFee, monthlyRebate));

  return {
    monthlyRawFee,
    monthlyRebate,
    monthlyActualCost,
    annualActualCost: multiply(monthlyActualCost, 12),
    effectiveFeeRate: monthlyVolume > 0 ? multiply(monthlyActualCost, 1 / monthlyVolume) : 0,
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
  rebateAmount: number;
  netTradingCost: number;
  totalSavings: number;
  effectiveFeeRate: number;
  totalSavingsPercent: number;
  annualBaselineCost: number;
  annualVipCost: number;
  annualVipSavings: number;
  annualRebateAmount: number;
  annualNetCost: number;
  annualTotalSavings: number;
};

export function calculateTradingCostComparison(input: TradingCostComparisonInput): TradingCostComparison {
  const volume = nonNegative(input.thirtyDayVolume);
  const baselineRate = nonNegative(input.baselineFeeRate);
  const vipRate = nonNegative(input.vipFeeRate);
  const rebateRate = Math.min(1, nonNegative(input.rebateRate));
  const baselineFee = multiply(volume, baselineRate);
  const vipFee = multiply(volume, vipRate);
  const vipSavings = Math.max(0, subtract(baselineFee, vipFee));
  const rebateAmount = multiply(vipFee, rebateRate);
  const netTradingCost = Math.max(0, subtract(vipFee, rebateAmount));
  const totalSavings = Math.max(0, subtract(baselineFee, netTradingCost));

  return {
    baselineFee,
    vipFee,
    vipSavings,
    rebateAmount,
    netTradingCost,
    totalSavings,
    effectiveFeeRate: volume === 0 ? 0 : multiply(netTradingCost, 1 / volume),
    totalSavingsPercent: baselineFee === 0 ? 0 : totalSavings / baselineFee,
    annualBaselineCost: multiply(baselineFee, 12),
    annualVipCost: multiply(vipFee, 12),
    annualVipSavings: multiply(vipSavings, 12),
    annualRebateAmount: multiply(rebateAmount, 12),
    annualNetCost: multiply(netTradingCost, 12),
    annualTotalSavings: multiply(totalSavings, 12),
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

export type CostComparisonBar = { id: "baseline" | "vip" | "bibeck"; widthPercent: number; reductionPercent: number; cost: number };

export function calculateCostComparisonBars(comparison: Pick<TradingCostComparison, "baselineFee" | "vipFee" | "netTradingCost">): CostComparisonBar[] {
  const baseline = nonNegative(comparison.baselineFee);
  const values = [
    { id: "baseline" as const, cost: baseline },
    { id: "vip" as const, cost: nonNegative(comparison.vipFee) },
    { id: "bibeck" as const, cost: nonNegative(comparison.netTradingCost) },
  ];
  return values.map(({ id, cost }) => {
    const ratio = baseline === 0 ? 0 : Math.min(1, Math.max(0, cost / baseline));
    return { id, cost, widthPercent: ratio * 100, reductionPercent: baseline === 0 ? 0 : (1 - ratio) * 100 };
  });
}
