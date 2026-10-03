import type { Confidence, Jurisdiction } from "./common.ts";
export type ModelStatus = "DRAFT" | "WORKING" | "VALIDATED" | "RETIRED";
export interface ModelRecord { id: string; name: string; version: string; purpose: string; requiredInputs: string[]; optionalInputs: string[]; dependencies: string[]; calculations: string[]; rules: string[]; outputs: string[]; assumptions: string[]; evidence: string[]; jurisdiction: Jurisdiction[]; confidence: Confidence; status: ModelStatus; active: boolean; lastReviewed: string }
