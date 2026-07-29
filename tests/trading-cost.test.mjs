import assert from "node:assert/strict";
import test from "node:test";
import { calculateTradingCost, calculateTradingCostComparison, calculateTierProgress, compareAnnualCosts } from "../lib/trading-cost.ts";
import { estimateBybitVipTier, negotiatedRebateRate, recommendBiBeckTier, resolveBybitVipTier } from "../lib/bybit-tiers.ts";
import { BYBIT_VIP_TIERS } from "../config/bybit-vip-tiers.ts";
import { BIBECK_REBATE_TIERS } from "../config/bibeck-rebate-tiers.ts";
import { formatNumberInput, parseNumberInput } from "../lib/number-input.ts";
import { navigationMenuReducer } from "../lib/navigation-menu.ts";

test("0.055% 會正確換算為 0.00055", () => {
  const result = calculateTradingCost({
    monthlyVolume: 100000,
    feeRate: 0.00055,
    rebateRate: 0.2,
  });

  assert.equal(result.monthlyRawFee, 55);
  assert.equal(result.monthlyRebate, 11);
  assert.equal(result.monthlyActualCost, 44);
  assert.equal(result.annualActualCost, 528);
  assert.equal(result.effectiveFeeRate, 0.00044);
});

test("比較器不會固定偏向 Bybit", () => {
  assert.equal(compareAnnualCosts(100, 80), "bybit");
  assert.equal(compareAnnualCosts(70, 80), "current");
  assert.equal(compareAnnualCosts(80, 80), "equal");
});

test("返傭比例最高限制為 100% 且不產生負成本", () => {
  const result = calculateTradingCost({ monthlyVolume: 10000, feeRate: 0.001, rebateRate: 2 });
  assert.equal(result.monthlyRawFee, 10);
  assert.equal(result.monthlyRebate, 10);
  assert.equal(result.monthlyActualCost, 0);
});

test("三層比較正確計算基準、返傭與年度成本", () => {
  const result = calculateTradingCostComparison({ thirtyDayVolume: 1_000_000, baselineFeeRate: 0.0003, vipFeeRate: 0.0003, rebateRate: 0.2 });
  assert.deepEqual(result, { baselineFee: 300, vipFee: 300, vipSavings: 0, rebate: 60, actualCost: 240, totalSavings: 60, effectiveFeeRate: 0.00024, annualBaselineCost: 3600, annualVipCost: 3600, annualActualCost: 2880, annualTotalSavings: 720 });
});

test("VIP 優惠與返傭會分開計算省下金額", () => {
  const result = calculateTradingCostComparison({ thirtyDayVolume: 100_000, baselineFeeRate: 0.00055, vipFeeRate: 0.0004, rebateRate: 0.2 });
  assert.equal(result.baselineFee, 55); assert.equal(result.vipFee, 40); assert.equal(result.vipSavings, 15); assert.equal(result.rebate, 8); assert.equal(result.actualCost, 32); assert.equal(result.totalSavings, 23); assert.equal(result.effectiveFeeRate, 0.00032); assert.equal(result.annualTotalSavings, 276);
});

test("自動 VIP 推估涵蓋門檻邊界與最高等級", () => {
  assert.equal(estimateBybitVipTier(BYBIT_VIP_TIERS[1].minThirtyDayVolume - 1).id, "vip-0");
  assert.equal(estimateBybitVipTier(BYBIT_VIP_TIERS[1].minThirtyDayVolume).id, "vip-1");
  assert.equal(estimateBybitVipTier(BYBIT_VIP_TIERS[2].minThirtyDayVolume).id, "vip-2");
  assert.equal(estimateBybitVipTier(Number.MAX_SAFE_INTEGER).id, "supreme");
});

test("手動 VIP 不會因交易量變更而被覆蓋", () => {
  assert.equal(resolveBybitVipTier("manual", 0, "vip-3").id, "vip-3");
  assert.equal(resolveBybitVipTier("manual", 900_000_000, "vip-3").id, "vip-3");
});

test("返傭自動建議涵蓋每個參考級距邊界", () => {
  for (const tier of BIBECK_REBATE_TIERS) assert.equal(recommendBiBeckTier(tier.minThirtyDayVolume).id, tier.id);
});

test("零交易量不產生 NaN 或 Infinity", () => {
  const result = calculateTradingCostComparison({ thirtyDayVolume: 0, baselineFeeRate: 0.001, vipFeeRate: 0.0005, rebateRate: 0.35 });
  for (const value of Object.values(result)) assert.equal(value, 0);
});

test("專業協商試算限制在 40% 至 100%", () => {
  assert.equal(negotiatedRebateRate(45, true), 0.45);
  assert.equal(negotiatedRebateRate(20, true), 0.4);
  assert.equal(negotiatedRebateRate(120, true), 1);
  assert.equal(negotiatedRebateRate(45, false), 0);
});

test("級距進度正確處理一般與最高級距", () => {
  assert.deepEqual(calculateTierProgress(15, 10, 20), { percentage: 50, remaining: 5, isHighest: false });
  assert.deepEqual(calculateTierProgress(500, 100, null), { percentage: 100, remaining: 0, isHighest: true });
});

test("交易量輸入顯示千分位且保留純數值", () => {
  assert.equal(formatNumberInput("1000"), "1,000");
  assert.equal(parseNumberInput("1,000"), 1000);
  assert.equal(formatNumberInput("1000000"), "1,000,000");
  assert.equal(parseNumberInput("1,000,000"), 1_000_000);
});

test("交易量輸入支援空格、貼上與不四捨五入的小數", () => {
  assert.equal(formatNumberInput("1 000 000"), "1,000,000");
  assert.equal(formatNumberInput("1000000.5"), "1,000,000.5");
  assert.equal(parseNumberInput("1,000,000.5"), 1_000_000.5);
  assert.equal(formatNumberInput(""), "");
  assert.equal(parseNumberInput(""), 0);
  assert.equal(parseNumberInput("-1,000"), 1000);
  assert.equal(Number.isNaN(parseNumberInput("abc")), false);
});

test("交易所選單狀態只由點擊切換並可統一關閉", () => {
  assert.equal(navigationMenuReducer(false, "toggle"), true);
  assert.equal(navigationMenuReducer(true, "toggle"), false);
  assert.equal(navigationMenuReducer(true, "close"), false);
  assert.equal(navigationMenuReducer(false, "close"), false);
});
