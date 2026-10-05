import { v1AssumptionConfig, type ModelAssumptionConfig } from "../contracts/index.ts";
import { executableRules } from "./executable-rules.ts";
import { models } from "./models.ts";
import { evidence } from "./evidence.ts";
import { assumptions } from "./assumptions.ts";
import { valueRefRegistry } from "./value-refs.ts";
import { baselineManifest } from "./baseline-manifest.ts";

type Immutable<T> = T extends object ? { readonly [K in keyof T]: Immutable<T[K]> } : T;
export interface RuntimeBundle {
  readonly manifest: Immutable<typeof baselineManifest>;
  readonly config: Immutable<ModelAssumptionConfig>;
  readonly rules: readonly (typeof executableRules)[number][];
  readonly models: readonly (typeof models)[number][];
  readonly evidence: readonly (typeof evidence)[number][];
  readonly assumptions: readonly (typeof assumptions)[number][];
  readonly valueRefs: typeof valueRefRegistry;
}

/** Module-owned data only. No caller data or ambient global state is mutated. */
function freeze<T>(value:T):T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

/** The sole registered artifact in S01; baseline 1 is a LOW research assumption. */
export const moneyModelV1Bundle:RuntimeBundle = freeze({
  manifest:baselineManifest, config:v1AssumptionConfig, rules:executableRules,
  models,
  // Legacy revision probes remain mutable; they cannot alter the production artifact.
  evidence:JSON.parse(JSON.stringify(evidence)) as typeof evidence,
  assumptions:JSON.parse(JSON.stringify(assumptions)) as typeof assumptions,
  valueRefs:valueRefRegistry,
});

export class UnsupportedRuntimeBundleError extends Error {
  constructor() { super("UNREGISTERED_RUNTIME_BUNDLE"); this.name="UnsupportedRuntimeBundleError"; }
}
/** Refuse fabricated manifests, policy edits and implicit latest-version fallback. */
export function assertRegisteredBundle(bundle:RuntimeBundle):void {
  if (bundle !== moneyModelV1Bundle) throw new UnsupportedRuntimeBundleError();
}
