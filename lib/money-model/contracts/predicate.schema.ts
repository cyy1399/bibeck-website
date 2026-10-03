import { registeredValueRefs, type RegisteredValueRef } from "../registries/value-refs.ts";
export const valueRefs = registeredValueRefs;
export type ValueRef = RegisteredValueRef;
export type LiteralValue = string | number | boolean | null;
export type ComparisonOperator = "EQ" | "NE" | "GT" | "GTE" | "LT" | "LTE";
export type Condition =
  | { kind:"comparison"; left:ValueRef; operator:ComparisonOperator; right:{ kind:"literal"; value:LiteralValue } | { kind:"ref"; ref:ValueRef } }
  | { kind:"logical"; operator:"AND" | "OR"; conditions:Condition[] }
  | { kind:"not"; condition:Condition }
  | { kind:"exists"; ref:ValueRef }
  | { kind:"missing"; ref:ValueRef };
export type TruthValue = "TRUE" | "FALSE" | "UNKNOWN";
export interface PredicateValidationIssue { code:string; path:string; message:string }
export interface PredicateValidationResult { valid:boolean; errors:PredicateValidationIssue[] }
