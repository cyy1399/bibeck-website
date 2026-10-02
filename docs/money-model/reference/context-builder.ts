import { known, unknown, valueRefs, v1AssumptionConfig, type DomainValue, type NormalizedDecisionContext, type Scalar, type ValueRef } from "../schemas/index.ts";
import { assertValidContext } from "./predicate-evaluator.ts";
export function createContext(overrides:Partial<Record<ValueRef,DomainValue<Scalar>>>={}):NormalizedDecisionContext {
  assertValidContext(overrides,true);
  const context = Object.fromEntries(valueRefs.map((ref) => [ref,unknown<Scalar>("NOT_PROVIDED")])) as NormalizedDecisionContext;
  context["config.minimumViableLiquidityMonths"] = known(v1AssumptionConfig.minimumViableLiquidityMonths.value);
  const result=Object.assign(context,overrides);
  assertValidContext(result);
  return result;
}
export const flag = (value:boolean) => known<Scalar>(value);
export const scalar = (value:Scalar) => known<Scalar>(value);
