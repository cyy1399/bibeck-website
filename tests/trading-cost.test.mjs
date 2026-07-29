import assert from "node:assert/strict";
import test from "node:test";
import { calculateTradingCost, compareAnnualCosts } from "../lib/trading-cost.ts";

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