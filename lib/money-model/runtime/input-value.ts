import type { DataPoint } from "../contracts/common.ts";
import { unknown, type DomainValue } from "../contracts/domain-value.schema.ts";
export type FinancialInput<T> = DataPoint<T> | DomainValue<T>;
/** Calendar-valid ISO dates/timestamps only; Date.parse alone normalizes impossible dates. */
export const validInputDate = (value:unknown):value is string => typeof value === "string"
  && /^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$/u.test(value)
  && Number.isFinite(Date.parse(value))
  && new Date(Date.parse(value.slice(0,10))).toISOString().slice(0,10) === value.slice(0,10);
export function readInput<T>(input:FinancialInput<T>|undefined):DomainValue<T> {
  if (!input) return unknown("NOT_REPORTED");
  if (typeof input !== "object" || Array.isArray(input)) return unknown("INVALID_INPUT_SHAPE");
  const tagged="status" in input?input:{status:"KNOWN" as const,data:input};
  if (tagged.status === "UNKNOWN" || tagged.status === "NOT_APPLICABLE") {
    if (Object.keys(tagged).some((key) => key !== "status" && key !== "reasonCode")) return unknown("INVALID_INPUT_SHAPE");
    return typeof tagged.reasonCode === "string" && tagged.reasonCode.trim()?tagged:unknown("INVALID_INPUT_REASON");
  }
  if (tagged.status !== "KNOWN" || Object.keys(tagged).some((key) => key !== "status" && key !== "data") || !tagged.data || typeof tagged.data !== "object" || Array.isArray(tagged.data) || Object.keys(tagged.data).some((key) => !["value","source","updatedAt"].includes(key)) || !Object.hasOwn(tagged.data,"value") || !["USER_REPORTED","CALCULATED","VERIFIED","IMPORTED"].includes(tagged.data.source) || !validInputDate(tagged.data.updatedAt)) return unknown("INVALID_INPUT_METADATA");
  if (tagged.data.value === undefined || typeof tagged.data.value === "number" && !Number.isFinite(tagged.data.value)) return unknown("INVALID_INPUT_VALUE");
  return tagged;
}
export const isFiniteAmount = (value:unknown):value is number => typeof value==="number"&&Number.isFinite(value)&&value>=0;
export function amountOf(input:FinancialInput<number>|undefined):number|null {
  const value=readInput(input);
  return value.status==="KNOWN"&&isFiniteAmount(value.data.value)?value.data.value:null;
}
export function scalarNumber(input:FinancialInput<number>|undefined):DomainValue<number> {
  const value=readInput(input);
  return value.status!=="KNOWN"||typeof value.data.value==="number"&&Number.isFinite(value.data.value)?value:unknown("INVALID_FINITE_NUMBER");
}
