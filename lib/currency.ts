import { bundledEstimateRateProvider, currencyByCode, type CurrencyCode, type ExchangeRateProvider } from "../config/currencies.ts";

export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode, provider: ExchangeRateProvider = bundledEstimateRateProvider): number | null {
  if (!Number.isFinite(amount)) return null;
  if (from === to) return amount;
  const fromRate = provider.getUnitsPerUsdt(from);
  const toRate = provider.getUnitsPerUsdt(to);
  if (fromRate === null || toRate === null) return null;
  return (amount / fromRate) * toRate;
}

export function formatCurrency(amount: number, code: CurrencyCode): string {
  const currency = currencyByCode[code];
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const absolute = Math.abs(safeAmount);
  const maximumFractionDigits = currency.decimals;
  const formatted = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(safeAmount);

  if (currency.type === "crypto") return `${formatted} ${currency.code}`;
  if (absolute > 0 && maximumFractionDigits > 0 && absolute < 10 ** -maximumFractionDigits) {
    return `< ${currency.symbol}${(10 ** -maximumFractionDigits).toFixed(maximumFractionDigits)}`;
  }
  return `${currency.symbol}${formatted}`;
}

export function formatConvertedCurrency(amountInUsdt: number, code: CurrencyCode): string {
  const converted = convertCurrency(amountInUsdt, "USDT", code);
  return converted === null ? "匯率暫時無法取得" : formatCurrency(converted, code);
}
