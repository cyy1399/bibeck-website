import assert from "node:assert/strict";
import test from "node:test";
import { buildTradingCostChartPoints, calculateTradingCost, calculateTradingCostComparison, calculateTierProgress, compareAnnualCosts } from "../lib/trading-cost.ts";
import { estimateBybitVipTier, negotiatedRebateRate, recommendBiBeckTier, resolveBybitVipTier } from "../lib/bybit-tiers.ts";
import { BYBIT_VIP_TIERS } from "../config/bybit-vip-tiers.ts";
import { BIBECK_REBATE_TIERS, formatRebateVolumeRange, formatVolume } from "../config/bibeck-rebate-tiers.ts";
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
  assert.deepEqual(result, { baselineFee: 300, vipFee: 300, vipSavings: 0, rebateAmount: 60, netTradingCost: 240, totalSavings: 60, effectiveFeeRate: 0.00024, totalSavingsPercent: 0.2, annualBaselineCost: 3600, annualVipCost: 3600, annualVipSavings: 0, annualRebateAmount: 720, annualNetCost: 2880, annualTotalSavings: 720 });
});

test("小數交易量與費率使用固定精度運算，不累積浮點誤差", () => {
  const result = calculateTradingCostComparison({ thirtyDayVolume: 1_000_000.5, baselineFeeRate: 0.00055, vipFeeRate: 0.0004, rebateRate: 0.25 });
  assert.equal(result.vipFee, 400.0002);
  assert.equal(result.rebateAmount, 100.00005);
  assert.equal(result.netTradingCost, 300.00015);
  assert.equal(Number.isFinite(result.annualNetCost), true);
});

test("VIP 優惠與返傭會分開計算省下金額", () => {
  const result = calculateTradingCostComparison({ thirtyDayVolume: 100_000, baselineFeeRate: 0.00055, vipFeeRate: 0.0004, rebateRate: 0.2 });
  assert.equal(result.baselineFee, 55); assert.equal(result.vipFee, 40); assert.equal(result.vipSavings, 15); assert.equal(result.rebateAmount, 8); assert.equal(result.netTradingCost, 32); assert.equal(result.totalSavings, 23); assert.equal(result.effectiveFeeRate, 0.00032); assert.equal(result.annualTotalSavings, 276);
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

test("返傭自動建議使用明確且不重疊的交易量邊界", () => {
  const cases = [
    [0, "standard", 0.2], [1, "standard", 0.2], [9_999_999.99, "standard", 0.2],
    [10_000_000, "active", 0.25], [49_999_999.99, "active", 0.25],
    [50_000_000, "elite", 0.3], [100_000_000, "elite", 0.3], [199_999_999.99, "elite", 0.3],
    [200_000_000, "core", 0.35], [499_999_999.99, "core", 0.35],
    [500_000_000, "strategic", 0.4], [1_000_000_000, "strategic", 0.4],
  ];

  for (const [volume, id, rebateRate] of cases) {
    const tier = recommendBiBeckTier(volume);
    assert.equal(tier.id, id);
    assert.equal(tier.rebateRate, rebateRate);
  }
});

test("返傭級距顯示千分位交易量標準", () => {
  assert.deepEqual(BIBECK_REBATE_TIERS.map(formatRebateVolumeRange), [
    "未滿 10M USDT", "10M～49.99M USDT", "50M～199.99M USDT", "200M～499.99M USDT", "500M USDT 以上", "不依交易量自動取得",
  ]);
});

test("特殊合作不會由交易量自動取得且 M/B 格式正確", () => { assert.equal(recommendBiBeckTier(Number.MAX_SAFE_INTEGER).id, "strategic"); assert.equal(BIBECK_REBATE_TIERS.at(-1).isSpecial, true); assert.equal(formatVolume(49_990_000), "49.99M"); assert.equal(formatVolume(200_000_000), "200M"); assert.equal(formatVolume(1_000_000_000), "1B"); });

test("零交易量不產生 NaN 或 Infinity", () => {
  const result = calculateTradingCostComparison({ thirtyDayVolume: 0, baselineFeeRate: 0.001, vipFeeRate: 0.0005, rebateRate: 0.35 });
  for (const value of Object.values(result)) assert.equal(value, 0);
});

test("自訂情境比例限制在 0% 至 100%", () => {
  assert.equal(negotiatedRebateRate(45, true), 0.45);
  assert.equal(negotiatedRebateRate(20, true), 0.2);
  assert.equal(negotiatedRebateRate(120, true), 1);
  assert.equal(negotiatedRebateRate(45, false), 0);
});

test("級距進度正確處理一般與最高級距", () => {
  assert.deepEqual(calculateTierProgress(15, 10, 20), { percentage: 50, remaining: 5, isHighest: false });
  assert.deepEqual(calculateTierProgress(500, 100, null), { percentage: 100, remaining: 0, isHighest: true });
});

test("公開級距下一級距離符合各門檻", () => {
  const cases = [[1_000_000, 9_000_000], [10_000_000, 40_000_000], [50_000_000, 150_000_000], [100_000_000, 100_000_000], [200_000_000, 300_000_000]];
  for (const [volume, remaining] of cases) {
    const tier = recommendBiBeckTier(volume);
    const next = BIBECK_REBATE_TIERS.find((candidate) => !candidate.isSpecial && candidate.order === tier.order + 1);
    assert.equal(calculateTierProgress(volume, tier.minVolume ?? 0, next?.minVolume ?? null).remaining, remaining);
  }
  const highest = recommendBiBeckTier(500_000_000);
  assert.equal(calculateTierProgress(500_000_000, highest.minVolume ?? 0, null).isHighest, true);
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
  assert.equal(parseNumberInput("-1,000"), 0);
  assert.equal(Number.isNaN(parseNumberInput("abc")), false);
  assert.equal(parseNumberInput("10M"), 10_000_000);
  assert.equal(parseNumberInput("１０Ｍ"), 10_000_000);
  assert.equal(parseNumberInput("1B"), 1_000_000_000);
  assert.equal(parseNumberInput("１Ｂ"), 1_000_000_000);
});

test("成本圖包含目前交易量與全部公開級距門檻", () => {
  const points = buildTradingCostChartPoints({ currentVolume: 75_000_000, baselineFeeRate: .00055, vipFeeRate: .0004, resolveTier: recommendBiBeckTier });
  for (const volume of [0, 10_000_000, 50_000_000, 75_000_000, 200_000_000, 500_000_000]) assert.ok(points.some((point) => point.volume === volume));
  assert.equal(points.find((point) => point.volume === 10_000_000)?.rebateRate, .25);
  assert.equal(points.find((point) => point.volume === 500_000_000)?.rebateRate, .4);
  assert.equal(points.find((point) => point.isCurrent)?.tierId, "elite");
});

test("成本圖自訂模式固定使用同一返傭比例", () => {
  const points = buildTradingCostChartPoints({ currentVolume: 20_000_000, baselineFeeRate: .00055, vipFeeRate: .0004, customRebateRate: .33, resolveTier: recommendBiBeckTier });
  assert.ok(points.every((point) => point.rebateRate === .33));
});

test("交易所選單狀態只由點擊切換並可統一關閉", () => {
  assert.equal(navigationMenuReducer(false, "toggle"), true);
  assert.equal(navigationMenuReducer(true, "toggle"), false);
  assert.equal(navigationMenuReducer(true, "close"), false);
  assert.equal(navigationMenuReducer(false, "close"), false);
});
