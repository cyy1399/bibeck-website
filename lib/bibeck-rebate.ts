export const BIBECK_STANDARD_REBATE_RATE = 0.35;

export function getStandardBibeckRebateRate(): number {
  return BIBECK_STANDARD_REBATE_RATE;
}

export function formatBibeckRebateRate(rate = BIBECK_STANDARD_REBATE_RATE): string {
  return `${Number((rate * 100).toFixed(4))}%`;
}

export function calculateRebateFromEligibleFee(eligibleFee: number): number {
  if (!Number.isFinite(eligibleFee) || eligibleFee <= 0) return 0;
  return Number((eligibleFee * BIBECK_STANDARD_REBATE_RATE).toFixed(8));
}

export const BIBECK_REBATE_ELIGIBILITY_NOTICE =
  "BiBeck 標準返傭比例為 35%，返傭依成功開通並符合返傭條件的 BiBeck Bybit 帳戶實際產生的符合資格交易手續費計算。";

