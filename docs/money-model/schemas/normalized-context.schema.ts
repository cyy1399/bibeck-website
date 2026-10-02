import type { DomainValue } from "./domain-value.schema.ts";
import type { ValueRef } from "./predicate.schema.ts";
export type Scalar = string | number | boolean | null;
export type NormalizedDecisionContext = Record<ValueRef,DomainValue<Scalar>>;
/** Scalar remains fixture-compatible; validateContext enforces each registered field's runtime type/unit/sign. */
export type NormalizedContextOverrides = Partial<NormalizedDecisionContext>;
export interface ModelAssumptionConfig { minimumViableLiquidityMonths:{ value:number; assumptionId:"AS-001"; confidence:"LOW"; status:"RESEARCH_REQUIRED" } }
export const v1AssumptionConfig:ModelAssumptionConfig = { minimumViableLiquidityMonths:{ value:1,assumptionId:"AS-001",confidence:"LOW",status:"RESEARCH_REQUIRED" } };
