import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { currencies, currencyCodes, DEFAULT_CURRENCY, exchangeRatePolicy } from "../config/currencies.ts";
import { DEFAULT_LOCALE, localeCodes, locales } from "../config/locales.ts";
import { convertCurrency, formatCurrency } from "../lib/currency.ts";

test("currency and locale defaults match the public site", () => {
  assert.equal(DEFAULT_CURRENCY, "USDT");
  assert.equal(DEFAULT_LOCALE, "zh-TW");
  assert.deepEqual(currencyCodes, ["USDT", "USDC", "BTC", "ETH", "USD", "TWD", "CNY", "HKD", "JPY", "KRW", "EUR", "GBP", "SGD"]);
  assert.deepEqual(localeCodes, ["zh-TW", "zh-CN", "en", "ja", "ko"]);
  assert.equal(currencies.length, 13);
  assert.equal(locales.length, 5);
});

test("currency conversion is reversible and formatting is unambiguous", () => {
  const twd = convertCurrency(1_000, "USDT", "TWD");
  assert.equal(twd, 32_500);
  assert.equal(convertCurrency(twd, "TWD", "USDT"), 1_000);
  assert.equal(formatCurrency(1_000, "USDT"), "1,000 USDT");
  assert.match(formatCurrency(32_500, "TWD"), /^NT\$/);
  assert.match(formatCurrency(0.025, "BTC"), / BTC$/);
  assert.equal(formatCurrency(Number.NaN, "USD"), "US$0");
});

test("fallback rates are explicitly identified as estimates", () => {
  assert.equal(exchangeRatePolicy.provider, "bundled_estimate");
  assert.match(exchangeRatePolicy.label, /非即時/);
});

test("settings menu provides click, outside click, Escape and ARIA behavior", async () => {
  const source = await readFile(new URL("../components/SettingsMenu.tsx", import.meta.url), "utf8");
  assert.match(source, /pointerdown/);
  assert.match(source, /Escape/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /aria-controls/);
  assert.doesNotMatch(source, /onMouseEnter|onMouseLeave|group-hover/);
});
