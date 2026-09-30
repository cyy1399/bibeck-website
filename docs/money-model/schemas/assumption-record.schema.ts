import type { Confidence } from "./common.ts";
export type AssumptionType = "FINANCIAL_MODEL" | "PRODUCT" | "UX" | "EXPERIMENTAL";
export type AssumptionStatus = "WORKING" | "RESEARCH_REQUIRED" | "REVIEWED" | "RETIRED";
export interface AssumptionRecord { id: string; name: string; statement: string; type: AssumptionType; confidence: Confidence; status: AssumptionStatus; limitations: string[]; tests: string[] }
