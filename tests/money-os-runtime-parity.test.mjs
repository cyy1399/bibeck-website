import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { analyzeFinancialProfile, moneyModelV1Bundle } from "../lib/money-model/index.ts";
import { normalizeProfile } from "../lib/money-model/runtime/profile-normalizer.ts";
import { evaluateReference } from "../lib/money-model/runtime/reference-evaluator.ts";
import { validateDecisionOutput } from "../lib/money-model/runtime/output-validator.ts";
import { executableCases } from "../docs/money-model/tests/executable-cases.ts";
import { goldenCase, point, missing } from "./money-os/fixtures/golden-cases.ts";
import { frozenFiles } from "./money-os/frozen-runtime-manifest.mjs";
import { loadFrozenOracle } from "./money-os/frozen-oracle.mjs";

const oracle=await loadFrozenOracle();after(oracle.cleanup);
const read=p=>readFileSync(fileURLToPath(new URL("../"+p,import.meta.url)),"utf8").replace(/\r\n/g,"\n");
const split=({flags,blockers,matchedRuleIds,modelConfidence,halted,...output})=>({output,diagnostics:{flags,blockers,matchedRuleIds,legacyModelConfidence:modelConfidence,halted}});

function assertProfileParity(fixture) {
  const {profile,options}=fixture;
  const old=oracle.normalizer.normalizeProfile(profile,options);
  const current=normalizeProfile(profile,options,moneyModelV1Bundle);
  assert.deepEqual(current,old,"Every normalized field, trace, raw record and dependency must match");
  const expected=oracle.evaluator.evaluateReference(old.context,undefined,old.metadata);
  assert.deepEqual(evaluateReference(current.context,moneyModelV1Bundle.rules,current.metadata,moneyModelV1Bundle),expected,"Full evaluator and legacy diagnostics parity");
  const result=analyzeFinancialProfile(profile,options,moneyModelV1Bundle);
  const frozenValidation=oracle.validator.validateDecisionOutput(expected);
  if (!options.primaryCurrencyConfirmed || !options.netMonthlyBasisConfirmed || !options.stockAsOfConfirmed) {
    assert.equal(result.ok,false);assert.equal(result.error.category,"MISSING_REQUIRED_INFORMATION");
    assert.equal(result.error.safeCode,"ANALYSIS_BASIS_NOT_CONFIRMED");
    assert.deepEqual(validateDecisionOutput(expected,moneyModelV1Bundle),frozenValidation);
    return;
  }
  assert.equal(result.ok,true,JSON.stringify(result));
  const frozen=split(expected);
  assert.deepEqual(result.output,frozen.output,"Full DecisionOutput parity, not seven summary fields");
  for (const [key,value] of Object.entries(frozen.diagnostics)) assert.deepEqual(result.diagnostics[key],value,"Diagnostic "+key);
  assert.deepEqual(result.diagnostics.normalizationTraces,old.traces);
  assert.deepEqual(validateDecisionOutput(result.output,moneyModelV1Bundle),frozenValidation);
}

for (const id of ["A","B","C","D","E","F"]) test("S01 parity: raw golden "+id+" full normalization/output/provenance/diagnostics",()=>assertProfileParity(goldenCase(id)));

for (const id of ["A","B","C","D","E","F","PARTIAL"]) test("S01 parity: observed "+id+" update or incomplete snapshot",()=>{
  const f=goldenCase(id==="PARTIAL"?"D":id);
  f.options.snapshotId+="-observed";
  if (id==="A") {f.profile.income[0].averageMonthlyNetIncome=point(38000);f.options.claims=[];}
  if (id==="B") {f.profile.assets[0].currentValue=point(30000);f.options.resources[0].amount=point(30000);f.options.claims=[];}
  if (id==="C") f.profile.liabilities[0].apr=point(5);
  if (id==="E") f.profile.expenses.discretionaryMonthly=point(100000);
  if (id==="F") f.profile.goals[0].targetDate="2029-10-02";
  if (id==="PARTIAL") {f.options.complete.assets=false;f.options.complete.resources=false;f.options.complete.claims=false;}
  assertProfileParity(f);
});

for (const fixture of executableCases) test("S01 parity: "+fixture.id+" full frozen normalized-rule fixture",()=>{
  const expected=oracle.evaluator.evaluateReference(fixture.context);
  const actual=evaluateReference(fixture.context,moneyModelV1Bundle.rules,undefined,moneyModelV1Bundle);
  assert.deepEqual(actual,expected);
  assert.deepEqual(evaluateReference(fixture.context,[...moneyModelV1Bundle.rules].reverse(),undefined,moneyModelV1Bundle),expected,"Rule registry insertion order is not policy");
  assert.deepEqual(validateDecisionOutput(actual,moneyModelV1Bundle),oracle.validator.validateDecisionOutput(expected));
});

test("S01 parity: critical/scoped correction, tagged unknown and decimal bookkeeping mutations",()=>{
  for (const mutate of [f=>{f.options.resources.push({...f.options.resources[0],id:"duplicate"});},f=>{f.profile.reportedMonthlySavings=point(9999);},f=>{f.profile.assets[0].currentValue=missing();},f=>{f.profile.income[0].averageMonthlyNetIncome=point(0.3);f.profile.expenses.necessaryMonthly=point(0.1);f.profile.expenses.discretionaryMonthly=point(0.1);},f=>{f.options.netMonthlyBasisConfirmed=false;}]) {
    const f=goldenCase("D");mutate(f);assertProfileParity(f);
  }
});

test("S01: every migrated contract/registry/body matches pinned source plus explicit injection adapter only",()=>{
  const runtimeNames=["profile-normalizer","input-value","resource-validator","claim-validator","claim-fulfillment","predicate-evaluator","reference-evaluator","output-validator"];
  for (const {path} of frozenFiles) {
    if (path.includes("/reference/") && !runtimeNames.some(name=>path.endsWith("/"+name+".ts"))) continue;
    const target=path.replace("docs/money-model/","lib/money-model/").replace("schemas/","contracts/").replace("reference/","runtime/");
    let expected=oracle.sources.get(path).replace(/\r\n/g,"\n").replaceAll("../schemas/","../contracts/").replaceAll('"./decimal-arithmetic.ts"','"../arithmetic/decimal-arithmetic.ts"');
    if (path.endsWith("/profile-normalizer.ts")) expected=expected.replace('"./context-builder.ts"','"./context-seed.ts"')
      .replace('import { createContext } from "./context-seed.ts";', 'import { createContext } from "./context-seed.ts";\nimport { assertRegisteredBundle, moneyModelV1Bundle, type RuntimeBundle } from "../registries/runtime-bundle.ts";')
      .replace("options:NormalizationOptions):NormalizationResult {","options:NormalizationOptions,bundle:RuntimeBundle=moneyModelV1Bundle):NormalizationResult {\n  assertRegisteredBundle(bundle);")
      .replace("const context=createContext();","const context=createContext(bundle.config);");
    if (path.endsWith("/reference-evaluator.ts")) expected=expected
      .replace('import { assumptions } from "../registries/assumptions.ts";\nimport { evidence } from "../registries/evidence.ts";\nimport { models } from "../registries/models.ts";', 'import { assumptions as referenceAssumptions } from "../registries/assumptions.ts";\nimport { evidence as referenceEvidence } from "../registries/evidence.ts";\nimport { models as referenceModels } from "../registries/models.ts";\nimport { assertRegisteredBundle, type RuntimeBundle } from "../registries/runtime-bundle.ts";')
      .replace("rules:ExecutableDecisionRule[]=executableRules,metadata?:EvaluationMetadata):ReferenceDecisionOutput {","rules:readonly ExecutableDecisionRule[]=executableRules,metadata?:EvaluationMetadata,bundle?:RuntimeBundle):ReferenceDecisionOutput {\n  if (bundle !== undefined) assertRegisteredBundle(bundle);\n  // Omitted bundle exists only for the old reference API. Production always injects it.\n  const { models, evidence, assumptions }=bundle??{models:referenceModels,evidence:referenceEvidence,assumptions:referenceAssumptions};");
    if (path.endsWith("/output-validator.ts")) expected=expected
      .replace('import { executableRules } from "../registries/executable-rules.ts";\nimport { models } from "../registries/models.ts";\nimport { evidence } from "../registries/evidence.ts";\nimport { assumptions } from "../registries/assumptions.ts";', 'import { executableRules as referenceRules } from "../registries/executable-rules.ts";\nimport { models as referenceModels } from "../registries/models.ts";\nimport { evidence as referenceEvidence } from "../registries/evidence.ts";\nimport { assumptions as referenceAssumptions } from "../registries/assumptions.ts";\nimport { assertRegisteredBundle, type RuntimeBundle } from "../registries/runtime-bundle.ts";')
      .replace("validateDecisionOutput(value:unknown):OutputValidationResult {","validateDecisionOutput(value:unknown,bundle?:RuntimeBundle):OutputValidationResult {")
      .replace("try { return validate(value); }","try { if (bundle !== undefined) assertRegisteredBundle(bundle); return validate(value,bundle); }")
      .replace("function validate(value:unknown):OutputValidationResult {","function validate(value:unknown,bundle?:RuntimeBundle):OutputValidationResult {\n  const { rules:executableRules, models, evidence, assumptions }=bundle??{rules:referenceRules,models:referenceModels,evidence:referenceEvidence,assumptions:referenceAssumptions};")
      .replace("const replay=evaluateReference(context);","const replay=evaluateReference(context,executableRules,undefined,bundle);");
    assert.equal(read(target).trimEnd(),expected.trimEnd(),target);
    assert.equal(read(path).trim(),['/** Compatibility only: '+(path.includes("/reference/")?"no second evaluator or financial implementation.":"the portable domain owns this frozen contract.")+" */",'export * from "../../../'+target+'";'].join("\n"),path);
  }
  assert.equal(moneyModelV1Bundle.manifest.artifactDigest,"sha256:"+createHash("sha256").update(JSON.stringify(frozenFiles)).digest("hex"));
});
