import assert from "node:assert/strict";
import test from "node:test";
import { calculateCostComparisonBars, calculateTradingCost, calculateTradingCostComparison, calculateTierProgress, compareAnnualCosts } from "../lib/trading-cost.ts";
import { estimateBybitVipTier, negotiatedRebateRate, resolveBybitVipTier } from "../lib/bybit-tiers.ts";
import { BYBIT_VIP_TIERS } from "../config/bybit-vip-tiers.ts";
import { BIBECK_STANDARD_REBATE_RATE, getStandardBibeckRebateRate } from "../lib/bibeck-rebate.ts";
import { BIBECK_TRADER_STATUSES, getEstimatedTraderStatus, getTraderStatusProgress } from "../lib/bibeck-trader-status.ts";
import { formatVolume } from "../lib/volume.ts";
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

test("任何交易量的 BiBeck 標準返傭都固定為 40%", () => {
  assert.equal(BIBECK_STANDARD_REBATE_RATE, 0.4);
  for (const volume of [0, 1, 1_000_000, 10_000_000, 50_000_000, 100_000_000, 200_000_000, 500_000_000, 1_000_000_000]) {
    assert.equal(getStandardBibeckRebateRate(volume), 0.4);
  }
});

test("Trader Status 邊界與 40% 標準返傭完全分離", () => {
  const cases = [[0,"member"],[49_999_999.99,"member"],[50_000_000,"pro"],[199_999_999.99,"pro"],[200_000_000,"black"],[500_000_000,"black"],[1_000_000_000,"black"]];
  for (const [volume,id] of cases) assert.equal(getEstimatedTraderStatus(volume).id,id);
  assert.deepEqual(BIBECK_TRADER_STATUSES.slice(0,3).map((status)=>status.rebateRate),[0.4,0.4,0.4]);
  assert.equal(BIBECK_TRADER_STATUSES.at(-1).id,"partner");
  assert.equal(BIBECK_TRADER_STATUSES.at(-1).rebateRate,null);
});

test("交易量 M/B 格式一致", () => { assert.equal(formatVolume(49_990_000), "49.99M"); assert.equal(formatVolume(200_000_000), "200M"); assert.equal(formatVolume(1_000_000_000), "1B"); });

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

test("Trader Status 進度符合 Member、Pro、Black 里程碑", () => {
  const cases = [[0,0],[25_000_000,50],[50_000_000,0],[125_000_000,50],[200_000_000,100],[500_000_000,100]];
  for (const [volume,percentage] of cases) assert.equal(getTraderStatusProgress(volume).percentage,percentage);
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

test("水平成本比較條以一般狀況為 100% 並共用計算結果", () => {
  const result = calculateTradingCostComparison({ thirtyDayVolume: 1_000_000, baselineFeeRate: .00055, vipFeeRate: .0004, rebateRate: .25 });
  const bars = calculateCostComparisonBars(result);
  assert.deepEqual(bars.map((bar) => bar.id), ["baseline","vip","bibeck"]);
  assert.equal(bars[0].widthPercent, 100);
  assert.equal(bars[1].widthPercent, result.vipFee / result.baselineFee * 100);
  assert.equal(bars[2].widthPercent, result.netTradingCost / result.baselineFee * 100);
  assert.equal(bars[2].cost, result.netTradingCost);
});

test("零交易量的水平成本比較條不產生 NaN 或 Infinity", () => {
  const bars = calculateCostComparisonBars({baselineFee:0,vipFee:0,netTradingCost:0});
  assert.ok(bars.every((bar) => bar.widthPercent === 0 && bar.reductionPercent === 0 && Number.isFinite(bar.cost)));
});

test("40% 返傭以 VIP 後費用為基礎", () => {
  const result=calculateTradingCostComparison({thirtyDayVolume:1_000_000,baselineFeeRate:.001,vipFeeRate:.0005,rebateRate:.4});
  assert.equal(result.vipFee,500); assert.equal(result.rebateAmount,200); assert.equal(result.netTradingCost,300);
});

test("交易所選單狀態只由點擊切換並可統一關閉", () => {
  assert.equal(navigationMenuReducer(false, "toggle"), true);
  assert.equal(navigationMenuReducer(true, "toggle"), false);
  assert.equal(navigationMenuReducer(true, "close"), false);
  assert.equal(navigationMenuReducer(false, "close"), false);
});
