import type { DataSource } from "./common.ts";
import type { CapitalPurpose, Liquidity } from "./financial-profile.schema.ts";
export type ResourceType = "CURRENT_CASH" | "MONTHLY_SURPLUS" | "SAFETY_CAPITAL" | "GOAL_CAPITAL" | "LONG_TERM_CAPITAL" | "FUTURE_INCOME" | "EXTERNAL_SUPPORT";
export interface FinancialResource { id: string; type: ResourceType; amount: number; liquidity: Liquidity; restricted: boolean; purpose: CapitalPurpose; availableFrom: string; source: DataSource }
export interface ResourceAllocation { resourceId: string; claimId: string; amount: number; capitalAssignmentId: string }
