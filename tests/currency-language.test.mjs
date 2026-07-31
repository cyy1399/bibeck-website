import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { currencies, currencyCodes, DEFAULT_CURRENCY, exchangeRatePolicy } from "../config/currencies.ts";
import { DEFAULT_LOCALE, localeCodes, locales } from "../config/locales.ts";
import { convertCurrency, formatCurrency } from "../lib/currency.ts";

test("currency and locale defaults match the public site", () => {
  assert.equal(DEFAULT_CURRENCY, "USDT");
  assert.equal(DEFAULT_LOCALE, "zh-TW");
  assert.deepEqual(currencyCodes, ["USDT", "USDC", "USD", "TWD", "CNY", "HKD", "JPY", "KRW", "EUR", "GBP", "SGD"]);
  assert.deepEqual(localeCodes, ["zh-TW"]);
  assert.equal(currencies.length, 11);
  assert.equal(locales.length, 1);
});

test("網站維持單一繁體中文路由，設定選單不含語言切換", async () => {
  const proxy = await readFile(new URL("../proxy.ts", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  const settings = await readFile(new URL("../components/SettingsMenu.tsx", import.meta.url), "utf8");
  assert.match(proxy, /308/);
  assert.doesNotMatch(sitemap, /localizedAlternates|hreflang/);
  assert.doesNotMatch(settings, /語言|shortLabel|setLocale/);
});

test("currency conversion is reversible and formatting is unambiguous", () => {
  const twd = convertCurrency(1_000, "USDT", "TWD");
  assert.equal(twd, 32_500);
  assert.equal(convertCurrency(twd, "TWD", "USDT"), 1_000);
  assert.equal(formatCurrency(1_000, "USDT"), "1,000 USDT");
  assert.match(formatCurrency(32_500, "TWD"), /^NT\$/);
  assert.equal(formatCurrency(150_000, "JPY"), "¥150,000");
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
