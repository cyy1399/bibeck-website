export const currencyCodes = [
  "USDT", "USDC", "BTC", "ETH", "USD", "TWD", "CNY", "HKD", "JPY", "KRW", "EUR", "GBP", "SGD",
] as const;

export type CurrencyCode = (typeof currencyCodes)[number];

export type CurrencyDefinition = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  type: "crypto" | "fiat";
  decimals: number;
  locale: string;
  displayName: string;
  /** Estimated units of this currency per 1 USDT. Never presented as a live quote. */
  unitsPerUsdt: number;
};

export const DEFAULT_CURRENCY: CurrencyCode = "USDT";

export const currencies: readonly CurrencyDefinition[] = [
  { code: "USDT", label: "USDT", symbol: "USDT", type: "crypto", decimals: 2, locale: "en-US", displayName: "Tether", unitsPerUsdt: 1 },
  { code: "USDC", label: "USDC", symbol: "USDC", type: "crypto", decimals: 2, locale: "en-US", displayName: "USD Coin", unitsPerUsdt: 1 },
  { code: "BTC", label: "BTC", symbol: "BTC", type: "crypto", decimals: 8, locale: "en-US", displayName: "Bitcoin", unitsPerUsdt: 0.0000085 },
  { code: "ETH", label: "ETH", symbol: "ETH", type: "crypto", decimals: 8, locale: "en-US", displayName: "Ethereum", unitsPerUsdt: 0.00029 },
  { code: "USD", label: "USD", symbol: "US$", type: "fiat", decimals: 2, locale: "en-US", displayName: "US Dollar", unitsPerUsdt: 1 },
  { code: "TWD", label: "TWD", symbol: "NT$", type: "fiat", decimals: 2, locale: "zh-TW", displayName: "新臺幣", unitsPerUsdt: 32.5 },
  { code: "CNY", label: "CNY", symbol: "CN¥", type: "fiat", decimals: 2, locale: "zh-CN", displayName: "人民幣", unitsPerUsdt: 7.2 },
  { code: "HKD", label: "HKD", symbol: "HK$", type: "fiat", decimals: 2, locale: "zh-HK", displayName: "港幣", unitsPerUsdt: 7.8 },
  { code: "JPY", label: "JPY", symbol: "JP¥", type: "fiat", decimals: 0, locale: "ja-JP", displayName: "日本円", unitsPerUsdt: 154 },
  { code: "KRW", label: "KRW", symbol: "₩", type: "fiat", decimals: 0, locale: "ko-KR", displayName: "대한민국 원", unitsPerUsdt: 1380 },
  { code: "EUR", label: "EUR", symbol: "€", type: "fiat", decimals: 2, locale: "de-DE", displayName: "Euro", unitsPerUsdt: 0.92 },
  { code: "GBP", label: "GBP", symbol: "£", type: "fiat", decimals: 2, locale: "en-GB", displayName: "Pound Sterling", unitsPerUsdt: 0.78 },
  { code: "SGD", label: "SGD", symbol: "S$", type: "fiat", decimals: 2, locale: "en-SG", displayName: "Singapore Dollar", unitsPerUsdt: 1.35 },
] as const;

export const currencyByCode = Object.fromEntries(currencies.map((currency) => [currency.code, currency])) as Record<CurrencyCode, CurrencyDefinition>;

export const exchangeRatePolicy = {
  provider: "bundled_estimate",
  label: "估算匯率（非即時報價）",
  updatedAt: "2026-07-29",
} as const;

export function isCurrencyCode(value: string | null): value is CurrencyCode {
  return value !== null && currencyCodes.includes(value as CurrencyCode);
}
