import { known, unknown, valueRefs, type ModelAssumptionConfig, type NormalizedDecisionContext, type Scalar } from "../contracts/index.ts";

/** No fixture overrides: only the selected registered assumption enters the seed. */
export function createContext(config:ModelAssumptionConfig):NormalizedDecisionContext {
  const context = Object.fromEntries(valueRefs.map(ref => [ref, unknown<Scalar>("NOT_PROVIDED")])) as NormalizedDecisionContext;
  context["config.minimumViableLiquidityMonths"] = known(config.minimumViableLiquidityMonths.value);
  return context;
}
