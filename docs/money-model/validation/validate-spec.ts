import { assumptions } from "../registries/assumptions.ts";
import { evidence } from "../registries/evidence.ts";
import { models } from "../registries/models.ts";
import { rules } from "../registries/rules.ts";
import { terminology } from "../registries/terminology.ts";
import { collisionSuiteMetadata, priorityCollisions } from "../tests/priority-collisions.ts";
import { syntheticCases, syntheticSuiteMetadata, type MoneyModelFixture } from "../tests/synthetic-cases.ts";
import { decisionOutputExamples } from "../tests/decision-output-examples.ts";
import { adversarialCases } from "../tests/adversarial-cases.ts";
import { auditFindings } from "../audits/findings.ts";
import { ruleCoverage } from "../audits/rule-coverage.ts";
import { terminologyAudit } from "../audits/terminology-audit.ts";
import { executableRules } from "../registries/executable-rules.ts";
import { modelCalculationContracts } from "../registries/model-calculation-contracts.ts";
import { executableCases } from "../tests/executable-cases.ts";
import { valueRefs, v1AssumptionConfig, type Condition, type ValueRef } from "../schemas/index.ts";
import { validateClaimLifecycle } from "../reference/claim-validator.ts";
import { validateCondition } from "../reference/predicate-evaluator.ts";
import { validateDecisionOutput } from "../reference/output-validator.ts";
import { evaluateReference } from "../reference/reference-evaluator.ts";
import { valueRefRegistry } from "../registries/value-refs.ts";

const duplicates = (ids:string[]) => [...new Set(ids.filter((id,index) => ids.indexOf(id) !== index))];
const hasHan = (value:string) => /[\u3400-\u9fff]/u.test(value);

export function validateMoneyModelSpecification(): string[] {
  const issues:string[] = [];
  for(const record of [...evidence,...assumptions]) if(!Number.isInteger(record.revision)||record.revision<1)issues.push(`${record.id}: invalid record revision`);
  const collections = { rules, evidence, assumptions, models, terminology };
  for (const [name, records] of Object.entries(collections)) {
    const ids = records.map((record) => "id" in record ? record.id : record.key);
    for (const id of duplicates(ids)) issues.push(`${name}: duplicate id ${id}`);
  }

  const evidenceIds = new Set(evidence.map((item) => item.id));
  const assumptionIds = new Set(assumptions.map((item) => item.id));
  const ruleIds = new Set(rules.map((item) => item.id));
  const modelIds = new Set(models.map((item) => item.id));
  const fixtures = [...syntheticCases, ...priorityCollisions];
  const testIds = new Set([...fixtures, ...adversarialCases, ...executableCases].map((item) => item.id));

  for (const item of rules) {
    for (const id of item.evidenceIds) if (!evidenceIds.has(id)) issues.push(`${item.id}: invalid evidence ${id}`);
    for (const id of item.assumptionIds) if (!assumptionIds.has(id)) issues.push(`${item.id}: invalid assumption ${id}`);
    for (const id of item.tests) if (!testIds.has(id)) issues.push(`${item.id}: invalid test ${id}`);
    if (item.priorityChanging && item.evidenceIds.length + item.assumptionIds.length === 0) issues.push(`${item.id}: priority-changing rule lacks provenance`);
    if ((item.confidence === "LOW" || item.confidence === "EXPERIMENTAL") && item.status !== "RESEARCH_REQUIRED") issues.push(`${item.id}: low-confidence priority rule must be research-required`);
  }
  for (const item of models) {
    for (const id of item.dependencies) if (!modelIds.has(id)) issues.push(`${item.id}: invalid model dependency ${id}`);
    for (const id of item.rules) if (!ruleIds.has(id)) issues.push(`${item.id}: invalid rule ${id}`);
    for (const id of item.evidence) if (!evidenceIds.has(id)) issues.push(`${item.id}: invalid evidence ${id}`);
    for (const id of item.assumptions) if (!assumptionIds.has(id)) issues.push(`${item.id}: invalid assumption ${id}`);
  }

  if (syntheticCases.length !== 24) issues.push(`synthetic fixture count: expected 24, got ${syntheticCases.length}`);
  if (priorityCollisions.length !== 4) issues.push(`collision fixture count: expected 4, got ${priorityCollisions.length}`);
  if (syntheticSuiteMetadata.validationLevel !== "STRUCTURE_ONLY" || !syntheticSuiteMetadata.requiresReferenceEvaluator) issues.push("synthetic suite must not claim engine execution coverage");
  if (collisionSuiteMetadata.validationLevel !== "STRUCTURE_ONLY" || !collisionSuiteMetadata.requiresReferenceEvaluator) issues.push("collision suite must not claim engine execution coverage");
  for (const fixture of fixtures) {
    for (const id of fixture.ruleIds) {
      if (!ruleIds.has(id)) issues.push(`${fixture.id}: invalid rule ${id}`);
      else if (!rules.find((item) => item.id === id)?.tests.includes(fixture.id)) issues.push(`${fixture.id}: missing reverse rule linkage ${id}`);
    }
    if (!hasHan(fixture.description)) issues.push(`${fixture.id}: description must be zh-TW`);
    if (fixture.expected.forbiddenOutputs.length === 0) issues.push(`${fixture.id}: forbiddenOutputs required`);
    if (fixture.expected.forbiddenAllocations.length === 0) issues.push(`${fixture.id}: forbiddenAllocations required`);
    for (const dimension of ["stage","severity","requiredFlags","resourceInvariant","claimInvariant"] as const) {
      if (fixture.expected[dimension] === undefined) issues.push(`${fixture.id}: missing expected dimension ${dimension}`);
    }
    if ("primaryBottleneck" in fixture.expected && !fixture.expected.primaryBottleneck) issues.push(`${fixture.id}: primaryBottleneck required`);
    if ("allocationMode" in fixture.expected && !fixture.expected.allocationMode) issues.push(`${fixture.id}: allocationMode required`);
  }

  for (const fixture of syntheticCases) validateAllocations(fixture, issues);
  for (const fixture of syntheticCases) {
    const validClaims = fixture.claims.every((claim) => claim.amount.status !== "KNOWN" || claim.fundedAmount.status !== "KNOWN" || (claim.amount.data.value >= 0 && claim.fundedAmount.data.value >= 0 && (claim.fundingStatus === "OVERFUNDED" || claim.fundedAmount.data.value <= claim.amount.data.value)));
    if (validClaims !== fixture.expected.claimInvariant) issues.push(`${fixture.id}: claim invariant expectation does not match fixture`);
    for (const claim of fixture.claims) for (const code of validateClaimLifecycle(claim).codes) issues.push(`${fixture.id}/${claim.id}: ${code}`);
  }
  for (const output of decisionOutputExamples) {
    for(const code of validateDecisionOutput(output).codes) issues.push(`DecisionOutput: ${code}`);
    if (hasHan(JSON.stringify(output))) issues.push("DecisionOutput domain example must not contain raw zh-TW copy");
    if (output.sideMissions.length > 3) issues.push("DecisionOutput example exceeds side mission limit");
    if (output.decisionOutputVersion !== "1.0") issues.push("DecisionOutput version must be 1.0");
    if (output.ruleIds.length === 0) issues.push("DecisionOutput provenance requires at least one rule ID");
    for (const id of output.ruleIds) if (!ruleIds.has(id)) issues.push(`DecisionOutput references unknown rule ${id}`);
    for (const id of output.evidenceIds) if (!evidenceIds.has(id)) issues.push(`DecisionOutput references unknown evidence ${id}`);
    for (const id of output.assumptionIds) if (!assumptionIds.has(id)) issues.push(`DecisionOutput references unknown assumption ${id}`);
  }
  const findingIds = new Set(auditFindings.map((item) => item.id));
  for (const auditCase of adversarialCases) {
    if (!hasHan(auditCase.scenario) || !hasHan(auditCase.whyExistingSuiteWasInsufficient)) issues.push(`${auditCase.id}: audit rationale must be zh-TW`);
    if (auditCase.forbiddenOutputs.length === 0) issues.push(`${auditCase.id}: forbiddenOutputs required`);
    for (const id of auditCase.ruleIds) {
      if (!ruleIds.has(id)) issues.push(`${auditCase.id}: invalid rule ${id}`);
      else if (!rules.find((item) => item.id === id)?.tests.includes(auditCase.id)) issues.push(`${auditCase.id}: missing reverse rule linkage ${id}`);
    }
    for (const id of auditCase.findingIds) if (!findingIds.has(id)) issues.push(`${auditCase.id}: invalid finding ${id}`);
    if (auditCase.ruleIds.length === 0 && auditCase.findingIds.length === 0) issues.push(`${auditCase.id}: must identify a rule or an explicit specification gap`);
  }
  for (const finding of auditFindings.filter((item) => item.classification === "BLOCKER")) {
    if (finding.status !== "FIXED") issues.push(`${finding.id}: executable hardening blocker remains unresolved`);
    if (!finding.adversarialTests.some((id) => testIds.has(id))) issues.push(`${finding.id}: blocker lacks adversarial coverage`);
  }
  const coverageIds = new Set(ruleCoverage.map((item) => item.ruleId));
  for (const item of rules) if (!coverageIds.has(item.id)) issues.push(`${item.id}: missing rule coverage matrix entry`);
  for (const item of ruleCoverage) {
    if (!ruleIds.has(item.ruleId)) issues.push(`${item.ruleId}: coverage references unknown rule`);
    if (item.failureModes.length === 0) issues.push(`${item.ruleId}: coverage failure modes required`);
  }
  const terminologyKeys = new Set(terminology.map((item) => item.key));
  for (const item of terminologyAudit) if (!terminologyKeys.has(item.key)) issues.push(`${item.key}: terminology audit references unknown key`);
  for (const key of terminologyKeys) if (!terminologyAudit.some((item) => item.key === key)) issues.push(`${key}: missing terminology audit recommendation`);
  for (const record of evidence) for (const id of record.supports) if (!ruleIds.has(id)) issues.push(`${record.id}: supports unknown rule ${id}`);
  for (const assumption of assumptions) {
    if (!rules.some((item) => item.assumptionIds.includes(assumption.id))) issues.push(`${assumption.id}: assumption has no rule consumer`);
    for (const id of assumption.tests) if (!testIds.has(id)) issues.push(`${assumption.id}: invalid test ${id}`);
  }
  for (const term of terminology) {
    if (!hasHan(term.zhTW) || !hasHan(term.descriptionZhTW)) issues.push(`${term.key}: zh-TW terminology required`);
    if (term.status === "APPROVED") issues.push(`${term.key}: terminology cannot be auto-approved in V1`);
  }
  if (!assumptions.find((item) => item.id === "AS-001" && item.status === "RESEARCH_REQUIRED" && item.confidence === "LOW")) issues.push("AS-001 must remain LOW / RESEARCH_REQUIRED");
  if (JSON.stringify(rules).includes("8%")) issues.push("unverified universal 8% threshold is forbidden");
  for (const record of evidence) if (record.sourceUrl && record.requiresVerification) issues.push(`${record.id}: unverified URL must not be recorded as a citation`);
  const executableIds=new Set(executableRules.map((item)=>item.id));
  for (const id of ruleIds) if (!executableIds.has(id)) issues.push(`${id}: missing executable rule`);
  for (const rule of executableRules) {
    for(const error of validateCondition(rule.condition).errors) issues.push(`${rule.id}: ${error.code}`);
    if(rule.discoveryCondition) for(const error of validateCondition(rule.discoveryCondition).errors) issues.push(`${rule.id}/discovery: ${error.code}`);
    if(!rule.version||!Array.isArray(rule.requiredKnownInputs)) issues.push(`${rule.id}: mission requirement/version contract absent`);
    if(rule.result.mainQuestCandidate&&!rule.result.mainQuestCandidate.code.startsWith("DISCOVER")&&rule.id!=="R-015"&&collectConditionRefs(rule.condition).some(ref=>!rule.requiredKnownInputs.includes(ref))) issues.push(`${rule.id}: missing mission-required input`);
    if (!ruleIds.has(rule.id)) issues.push(`${rule.id}: executable rule has no registry record`);
    for (const ref of collectConditionRefs(rule.condition)) if (!valueRefs.includes(ref)) issues.push(`${rule.id}: invalid ValueRef ${ref}`);
    if (hasHan(JSON.stringify(rule.result))) issues.push(`${rule.id}: executable result contains raw zh-TW copy`);
    if (rule.evidenceIds.length+rule.assumptionIds.length===0) issues.push(`${rule.id}: executable rule lacks provenance`);
  }
  const activeModelIds=new Set(models.filter((item)=>item.active).map((item)=>item.id));
  const contractIds=new Set(modelCalculationContracts.map((item)=>item.modelId));
  for (const id of activeModelIds) if (!contractIds.has(id)) issues.push(`${id}: active model lacks calculation contract`);
  for (const contract of modelCalculationContracts) {
    if (!activeModelIds.has(contract.modelId)) issues.push(`${contract.modelId}: calculation contract is not an active model`);
    if (!contract.inputs.length||!contract.outputs.length||!contract.calculationSemantics.length) issues.push(`${contract.modelId}: incomplete calculation contract`);
  }
  if (v1AssumptionConfig.minimumViableLiquidityMonths.assumptionId!=="AS-001"||v1AssumptionConfig.minimumViableLiquidityMonths.confidence!=="LOW"||v1AssumptionConfig.minimumViableLiquidityMonths.status!=="RESEARCH_REQUIRED") issues.push("AS-001 configuration provenance changed");
  for(const [ref,definition]of Object.entries(valueRefRegistry)) {
    if(ref!==definition.key||!definition.unit||!definition.timeBasis||!definition.description)issues.push(`${ref}: incomplete ValueRef contract`);
    if(definition.producerModel&&!modelIds.has(definition.producerModel))issues.push(`${ref}: unknown producer model`);
  }
  for(const fixture of executableCases) for(const code of validateDecisionOutput(evaluateReference(fixture.context)).codes)issues.push(`${fixture.id}/complete-output: ${code}`);
  return issues;
}

function collectConditionRefs(condition:Condition):ValueRef[] {
  if (condition.kind==="exists"||condition.kind==="missing") return [condition.ref];
  if (condition.kind==="not") return collectConditionRefs(condition.condition);
  if (condition.kind==="logical") return condition.conditions.flatMap(collectConditionRefs);
  return [condition.left,...(condition.right.kind==="ref"?[condition.right.ref]:[])];
}

function validateAllocations(fixture:MoneyModelFixture, issues:string[]) {
  const allocations = fixture.allocations ?? [];
  const assigned = new Set<string>();
  let valid = true;
  for (const allocation of allocations) {
    const resource = fixture.resources.find((item) => item.id === allocation.resourceId);
    if (!resource) { issues.push(`${fixture.id}: allocation references unknown resource`); valid = false; continue; }
    const total = allocations.filter((item) => item.resourceId === resource.id).reduce((sum,item) => sum + item.amount,0);
    if (resource.amount.status !== "KNOWN" || total > resource.amount.data.value) valid = false;
    if (assigned.has(allocation.capitalAssignmentId)) valid = false;
    assigned.add(allocation.capitalAssignmentId);
  }
  if (valid !== fixture.expected.resourceInvariant) issues.push(`${fixture.id}: resource invariant expectation does not match fixture`);
}
