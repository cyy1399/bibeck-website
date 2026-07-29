import { currencyByCode, type CurrencyCode } from "../config/currencies.ts";

export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (!Number.isFinite(amount)) return 0;
  if (from === to) return amount;
  const inUsdt = amount / currencyByCode[from].unitsPerUsdt;
  return inUsdt * currencyByCode[to].unitsPerUsdt;
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
  return formatCurrency(convertCurrency(amountInUsdt, "USDT", code), code);
}
