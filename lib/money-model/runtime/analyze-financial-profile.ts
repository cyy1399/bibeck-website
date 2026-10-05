import type { DecisionOutput, FinancialProfile, ReferenceDecisionOutput } from "../contracts/index.ts";
import { assertRegisteredBundle, UnsupportedRuntimeBundleError, type RuntimeBundle } from "../registries/runtime-bundle.ts";
import { normalizeProfile, type NormalizationOptions, type NormalizationTrace } from "./profile-normalizer.ts";
import { evaluateReference } from "./reference-evaluator.ts";
import { validateDecisionOutput } from "./output-validator.ts";
import { validateClaims } from "./claim-validator.ts";
import { validateAnalysisInput } from "./input-validation.ts";
import { PredicateContractError } from "./predicate-evaluator.ts";

export type DomainErrorCategory="VALIDATION_ERROR"|"MISSING_REQUIRED_INFORMATION"|"CONTRADICTORY_STATE"|"DOMAIN_INVARIANT_VIOLATION"|"UNSUPPORTED_MODEL_VERSION"|"INTERNAL_ERROR";
export interface DomainError { category:DomainErrorCategory; safeCode:string; fieldRefs:string[]; retryable:false }
export interface RuntimeDiagnostics {
  bundle:RuntimeBundle["manifest"];
  categories:DomainErrorCategory[];
  normalizationTraces:NormalizationTrace[];
  flags:ReferenceDecisionOutput["flags"];
  blockers:ReferenceDecisionOutput["blockers"];
  matchedRuleIds:string[];
  halted:boolean;
  /** Compatibility diagnostic, never the authoritative confidence assessment. */
  legacyModelConfidence:ReferenceDecisionOutput["modelConfidence"];
}
export type AnalysisResult={ok:true;output:DecisionOutput;diagnostics:RuntimeDiagnostics}|{ok:false;error:DomainError};
const failure=(category:DomainErrorCategory,safeCode:string,fieldRefs:string[]=[]):AnalysisResult=>({ok:false,error:{category,safeCode,fieldRefs,retryable:false}});

/** Pure production boundary: IDs/time/basis and the registered bundle are explicit. */
export function analyzeFinancialProfile(profile:FinancialProfile,options:NormalizationOptions,bundle:RuntimeBundle):AnalysisResult {
  try {
    assertRegisteredBundle(bundle);
    const inputCodes=validateAnalysisInput(profile,options);
    if (inputCodes.length) return failure("VALIDATION_ERROR","INVALID_DOMAIN_INPUT",inputCodes);
    const basis=["primaryCurrencyConfirmed","netMonthlyBasisConfirmed","stockAsOfConfirmed"] as const;
    const missingBasis=basis.filter(key=>!options[key]);
    if (missingBasis.length) return failure("MISSING_REQUIRED_INFORMATION","ANALYSIS_BASIS_NOT_CONFIRMED",missingBasis.map(key=>"basis."+key));
    const claims=validateClaims(options.claims??[]);
    if (!claims.valid) return failure("DOMAIN_INVARIANT_VIOLATION","INVALID_CLAIM_STATE",claims.codes);
    // Metrics/flags and raw lineage deliberately remain integrated in the frozen normalizer.
    const normalized=normalizeProfile(profile,options,bundle);
    const evaluated=evaluateReference(normalized.context,bundle.rules,normalized.metadata,bundle);
    const validation=validateDecisionOutput(evaluated,bundle);
    if (!validation.valid) return failure("DOMAIN_INVARIANT_VIOLATION","INVALID_DECISION_OUTPUT",validation.codes);
    const {flags,blockers,matchedRuleIds,modelConfidence,halted,...output}=evaluated;
    const categories:DomainErrorCategory[]=[];
    if (matchedRuleIds.includes("R-008") || matchedRuleIds.includes("R-015")) categories.push("CONTRADICTORY_STATE");
    if (output.missingInformation.length || output.mainQuest?.type==="DISCOVER" || output.sideMissions.some(m=>m.type==="DISCOVER")) categories.push("MISSING_REQUIRED_INFORMATION");
    // Valid correction projections remain decisions; a halt is not a system exception.
    // Detach caller-owned DataPoints and frozen registry arrays at the output boundary.
    const portableOutput:DecisionOutput=JSON.parse(JSON.stringify(output));
    return {ok:true,output:portableOutput,diagnostics:{bundle:bundle.manifest,categories,normalizationTraces:normalized.traces,flags,blockers,matchedRuleIds,halted,legacyModelConfidence:modelConfidence}};
  } catch (error) {
    if (error instanceof UnsupportedRuntimeBundleError) return failure("UNSUPPORTED_MODEL_VERSION","UNREGISTERED_RUNTIME_BUNDLE");
    if (error instanceof PredicateContractError) return failure("DOMAIN_INVARIANT_VIOLATION","INVALID_NORMALIZED_CONTEXT");
    return failure("INTERNAL_ERROR","DOMAIN_RUNTIME_FAULT");
  }
}
