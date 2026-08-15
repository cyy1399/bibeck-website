export const BIBECK_STANDARD_REBATE_RATE = 0.4;

export function getStandardBibeckRebateRate(): number {
  return BIBECK_STANDARD_REBATE_RATE;
}

export function formatBibeckRebateRate(rate = BIBECK_STANDARD_REBATE_RATE): string {
  return `${Number((rate * 100).toFixed(4))}%`;
}

export const BIBECK_REBATE_ELIGIBILITY_NOTICE =
  "BiBeck 標準返傭比例為 40%，返傭依成功開通並符合返傭條件的 BiBeck Bybit 帳戶實際產生的符合條件交易手續費計算。";

