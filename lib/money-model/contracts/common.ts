export type DataSource = "USER_REPORTED" | "CALCULATED" | "VERIFIED" | "IMPORTED";
export type Confidence = "HIGH" | "MEDIUM" | "LOW" | "EXPERIMENTAL";
export type Jurisdiction = "GENERAL" | "TW" | "US";
export type Stage = "SURVIVAL" | "STABILITY" | "CONTROL" | "ACCUMULATION" | "GROWTH" | "OPTIONALITY";
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
export type RegistryStatus = "DRAFT" | "REVIEWED" | "APPROVED";

export interface DataPoint<T> {
  value: T;
  source: DataSource;
  updatedAt: string;
}

export interface LocalizedText {
  locale: "zh-TW";
  value: string;
}
