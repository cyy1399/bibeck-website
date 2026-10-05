import { accepted, rejected, plainRecord, exactKeys, type CodecResult } from "../contracts/errors.ts";
import { isCurrencyCode, type SourceBasis } from "../contracts/source.ts";

export function calendarDate(input: unknown): CodecResult<string> {
  if (typeof input !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u.test(input)) return rejected("INVALID_CALENDAR_DATE");
  const [year, month, day] = input.split("-").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1] ? accepted(input) : rejected("INVALID_CALENDAR_DATE");
}
export function monthlyPeriod(input: unknown): CodecResult<string> {
  if (typeof input !== "string" || !/^[0-9]{4}-[0-9]{2}$/u.test(input) || !calendarDate(input + "-01").ok) return rejected("INVALID_MONTHLY_PERIOD");
  return accepted(input);
}
export function calendarZone(input: unknown): CodecResult<string> {
  if (typeof input !== "string" || input.length > 120 || !/^(?:UTC|[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)+)$/u.test(input)) return rejected("INVALID_CALENDAR_ZONE");
  try { new Intl.DateTimeFormat("en-US", { timeZone: input }).resolvedOptions(); return accepted(input); }
  catch { return rejected("INVALID_CALENDAR_ZONE"); }
}
/** UTC audit instant, separate from financial calendar dates; no host clock. */
export function auditInstant(input: unknown): CodecResult<string> {
  return typeof input === "string" && /^[0-9]{4}-[0-9]{2}-[0-9]{2}T(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]{1,9})?Z$/u.test(input)
    && calendarDate(input.slice(0, 10)).ok ? accepted(input) : rejected("INVALID_AUDIT_INSTANT");
}
export function parseBasis(input: unknown): CodecResult<SourceBasis> {
  const keys = ["primaryCurrency", "financialCalendarZone", "asOf", "monthlyPeriodId", "primaryCurrencyConfirmed", "netMonthlyBasisConfirmed", "stockAsOfConfirmed"];
  if (!plainRecord(input) || !exactKeys(input, keys) || !isCurrencyCode(input.primaryCurrency)
    || !calendarZone(input.financialCalendarZone).ok || !calendarDate(input.asOf).ok || !monthlyPeriod(input.monthlyPeriodId).ok
    || ["primaryCurrencyConfirmed", "netMonthlyBasisConfirmed", "stockAsOfConfirmed"].some(key => typeof input[key] !== "boolean")) return rejected("INVALID_ANALYSIS_BASIS", "basis");
  return accepted({ ...input } as unknown as SourceBasis);
}
