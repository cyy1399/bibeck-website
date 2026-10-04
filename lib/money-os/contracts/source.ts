import type { DomainValue } from "../../money-model/contracts/domain-value.schema.ts";

export const SOURCE_ENVELOPE_VERSION = "1.0.0";
export const SOURCE_CODEC_VERSION = "1.0.0";
/** Representation identifier only; not an FX/currency-policy support catalog. */
export const isCurrencyCode = (value: unknown): value is string => typeof value === "string" && /^[A-Z][A-Z0-9]{2,7}$/u.test(value);
/** Representation/resource limits, not financial thresholds. */
export const SOURCE_LIMITS = Object.freeze({
  numericTokenCharacters: 64, integerDigits: 48, decimalScale: 18,
  payloadBytes: 256 * 1024, collectionRecords: 100, nameCodePoints: 120,
  textCodePoints: 500, nestingDepth: 12, nodes: 20000,
});
export type SourceUnit = "MONEY" | "MONEY_PER_MONTH" | "APR_PERCENT" | "RATIO" | "COUNT" | "BOOLEAN" | "DATE";
export type TaggedSourceValue =
  | { status: "KNOWN"; data: { value: string | boolean; source: "USER_REPORTED"; updatedAt: string } }
  | { status: "UNKNOWN"; reasonCode: string }
  | { status: "NOT_APPLICABLE"; reasonCode: string };
export interface SourceFieldDto { unit: SourceUnit; currency?: string; value: TaggedSourceValue }
export interface DomainFieldValue { unit: SourceUnit; currency?: string; value: DomainValue<number | string | boolean> }
export interface ValueCodecContract {
  unit: SourceUnit;
  primaryCurrency?: string;
  /** Trusted caller's reviewed field contract, NEVER accepted from body. */
  allowNotApplicable?: boolean;
}
export interface SourceBasis {
  primaryCurrency: string;
  financialCalendarZone: string;
  asOf: string;
  monthlyPeriodId: string;
  primaryCurrencyConfirmed: boolean;
  netMonthlyBasisConfirmed: boolean;
  stockAsOfConfirmed: boolean;
}
/** Minimal scalar envelope, not a full profile or inventory/producer contract (S03). */
export const SOURCE_FIELDS = Object.freeze({
  income: Object.freeze({ averageMonthlyNetIncome: "MONEY_PER_MONTH" }),
  expenses: Object.freeze({ necessaryMonthly: "MONEY_PER_MONTH", discretionaryMonthly: "MONEY_PER_MONTH", otherMonthlyRequired: "MONEY_PER_MONTH" }),
  assets: Object.freeze({ currentValue: "MONEY", availableEconomicValue: "MONEY" }),
  liabilities: Object.freeze({ balance: "MONEY", minimumMonthlyPayment: "MONEY_PER_MONTH", apr: "APR_PERCENT", nominalRate: "APR_PERCENT", promotionalRate: "APR_PERCENT", remainingTermMonths: "COUNT" }),
  obligations: Object.freeze({ amount: "MONEY", reservedAmount: "MONEY", dueDate: "DATE" }),
  goals: Object.freeze({ targetAmount: "MONEY", currentFunding: "MONEY", targetDate: "DATE" }),
  household: Object.freeze({ dependents: "COUNT", externalSupportAvailable: "BOOLEAN" }),
  assignments: Object.freeze({ amount: "MONEY" }),
} as const);
export type SourceCollection = keyof typeof SOURCE_FIELDS;
export interface SourceRecordDto { id: string; name?: string; note?: string; values: Record<string, SourceFieldDto> }
export interface SourceEnvelope {
  profileEnvelopeVersion: typeof SOURCE_ENVELOPE_VERSION;
  codecVersion: typeof SOURCE_CODEC_VERSION;
  basis: SourceBasis;
  /** Omission stays omitted: not zero, delete or confirmed completeness. */
  collections: Partial<Record<SourceCollection, SourceRecordDto[]>>;
}
export interface DomainSourceEnvelope {
  profileEnvelopeVersion: typeof SOURCE_ENVELOPE_VERSION;
  codecVersion: typeof SOURCE_CODEC_VERSION;
  basis: SourceBasis;
  collections: Partial<Record<SourceCollection, { id: string; name?: string; note?: string; values: Record<string, DomainFieldValue> }[]>>;
}
