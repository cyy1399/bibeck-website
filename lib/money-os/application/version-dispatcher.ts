import { moneyModelV1Bundle } from "../../money-model/index.ts";
import { ADAPTER_SOURCE_VERSION, PRODUCER_BUNDLE_VERSION } from "../contracts/producer-manifest.ts";
import { SOURCE_CODEC_VERSION, SOURCE_ENVELOPE_VERSION } from "../contracts/source.ts";
import { plainRecord, exactKeys } from "../contracts/errors.ts";
import { appFailure, type AppResult } from "../contracts/commands.ts";
import type { AnalysisVersions } from "../contracts/analysis.ts";
import type { RuntimeBundle } from "../../money-model/registries/runtime-bundle.ts";

export const currentAnalysisVersions: AnalysisVersions = Object.freeze({
  bundle: moneyModelV1Bundle.manifest, profileEnvelopeVersion: SOURCE_ENVELOPE_VERSION,
  adapterSourceVersion: ADAPTER_SOURCE_VERSION, codecVersion: SOURCE_CODEC_VERSION,
  producerBundleVersion: PRODUCER_BUNDLE_VERSION, snapshotVersion: "1.0.0",
});
/** No 'latest' fallback for historical versions; only the registered immutable artifact. */
export function resolveAnalysisBundle(input: unknown, requestId: string): AppResult<RuntimeBundle> {
  if (!plainRecord(input) || !exactKeys(input, Object.keys(currentAnalysisVersions)) || !plainRecord(input.bundle))
    return appFailure("UNSUPPORTED_SCHEMA_VERSION", "INVALID_VERSION_SET", requestId, ["versions"]);
  const expected = moneyModelV1Bundle.manifest;
  if (!exactKeys(input.bundle, Object.keys(expected)) || Object.entries(expected).some(([key, value]) => input.bundle && (input.bundle as Record<string, unknown>)[key] !== value))
    return appFailure("UNSUPPORTED_MODEL_VERSION", "MODEL_ARTIFACT_UNAVAILABLE", requestId, ["versions.bundle"]);
  for (const key of ["profileEnvelopeVersion", "adapterSourceVersion", "codecVersion", "snapshotVersion"] as const)
    if (input[key] !== currentAnalysisVersions[key]) return appFailure("UNSUPPORTED_SCHEMA_VERSION", "SCHEMA_ARTIFACT_UNAVAILABLE", requestId, ["versions"]);
  if (input.producerBundleVersion !== PRODUCER_BUNDLE_VERSION)
    return appFailure("UNSUPPORTED_CAPABILITY", "PRODUCER_ARTIFACT_UNAVAILABLE", requestId, ["versions"]);
  return { ok: true, value: moneyModelV1Bundle };
}
