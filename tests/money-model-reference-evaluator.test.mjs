import assert from "node:assert/strict";
import test from "node:test";
import { executableCases } from "../docs/money-model/tests/executable-cases.ts";
import { evaluateReference } from "../docs/money-model/reference/reference-evaluator.ts";
import { evaluateCondition } from "../docs/money-model/reference/predicate-evaluator.ts";
import { createContext, flag, scalar } from "../docs/money-model/reference/context-builder.ts";
import { known, unknown, notApplicable } from "../docs/money-model/schemas/domain-value.schema.ts";
import { sumKnown, subtractKnown, ratioKnown } from "../docs/money-model/reference/calculations.ts";
import { executableRules } from "../docs/money-model/registries/executable-rules.ts";
import { validateResourceLineage, isFreeOwnedCash } from "../docs/money-model/reference/resource-validator.ts";
import { validateClaimLifecycle } from "../docs/money-model/reference/claim-validator.ts";
import { decisionOutputExamples } from "../docs/money-model/tests/decision-output-examples.ts";

for (const fixture of executableCases) test(`${fixture.id}: ${fixture.rationale}`,()=>{
  const actual=evaluateReference(fixture.context);
  assert.deepEqual({matchedRuleIds:actual.matchedRuleIds,stage:actual.currentStage,severity:actual.severity,bottleneckCode:actual.primaryBottleneck?.code??null,mainQuestCode:actual.mainQuest?.code??null,halted:actual.halted,confidence:actual.modelConfidence},fixture.expected);
});

test("unknown is not equal to zero",()=>{
  const context=createContext({"metrics.coreCashFlow":unknown("NOT_REPORTED"),"metrics.monthlySurplus":scalar(0)});
  assert.equal(evaluateCondition({kind:"comparison",left:"metrics.coreCashFlow",operator:"EQ",right:{kind:"literal",value:0}},context),"UNKNOWN");
  assert.equal(evaluateCondition({kind:"comparison",left:"metrics.monthlySurplus",operator:"EQ",right:{kind:"literal",value:0}},context),"TRUE");
});

test("tagged N/A, unknown and known zero remain distinct; required arithmetic never guesses zero",()=>{
  const na=notApplicable("NO_APPLICABLE_VALUE");
  const missing=unknown("NOT_REPORTED");
  assert.notDeepEqual(na,missing);
  assert.notDeepEqual(missing,known(0));
  assert.equal(sumKnown([known(10),na]).status,"UNKNOWN");
  assert.equal(subtractKnown(known(10),missing).status,"UNKNOWN");
  assert.equal(ratioKnown(known(10),known(0)).status,"UNKNOWN");
  assert.equal(ratioKnown(na,known(10)).status,"UNKNOWN");
  assert.equal(sumKnown([known(0),known(10)]).data.value,10);
  assert.equal(evaluateCondition({kind:"comparison",left:"metrics.coreCashFlow",operator:"EQ",right:{kind:"literal",value:0}},createContext({"metrics.coreCashFlow":na})),"UNKNOWN");
});

test("validated rule ordering is phase, order, then ID independent of registry input order",()=>{
  const template=executableRules.find((rule)=>rule.id==="R-002");
  const context=createContext({"flags.hasDelinquentDebt":flag(true)});
  const base={...template,enabled:true,overrideBehavior:"NONE"};
  const rules=[
    {...base,id:"R-TEST-B",phase:"CONTROL",order:20},
    {...base,id:"R-TEST-A",phase:"CONTROL",order:20},
    {...base,id:"R-TEST-D",phase:"CONTROL",order:10},
    {...base,id:"R-TEST-C",phase:"DATA_QUALITY",order:100},
  ];
  const output=evaluateReference(context,rules);
  assert.deepEqual(output.matchedRuleIds,["R-TEST-C","R-TEST-D","R-TEST-A","R-TEST-B"]);
  assert.deepEqual(evaluateReference(context,[...rules].reverse()),output);
});

test("same asset cannot create or assign more economic value than it owns",()=>{
  const dp=(value)=>({value,source:"USER_REPORTED",updatedAt:"2026-10-01"});
  const assets=[{id:"cash",type:"CASH",currentValue:dp(100000),liquidity:"IMMEDIATE",purpose:"UNASSIGNED"}];
  const base={ownership:"SOLE",availability:"AVAILABLE",liquidity:"IMMEDIATE",valuationStatus:"KNOWN",availableFrom:known("2026-10-01"),reservedForClaimIds:[],source:"USER_REPORTED",certainty:"HIGH"};
  const resources=[{id:"safety",type:"SAFETY_CAPITAL",amount:known(100000),underlyingAssetId:"cash",purpose:"SAFETY",...base},{id:"goal",type:"GOAL_CAPITAL",amount:known(100000),underlyingAssetId:"cash",purpose:"GOAL",...base}];
  const result=validateResourceLineage(assets,resources,[{id:"a1",assetId:"cash",purpose:"SAFETY",amount:known(70000)},{id:"a2",assetId:"cash",purpose:"GOAL",amount:known(70000)}]);
  assert.equal(result.valid,false);
  assert.deepEqual(result.codes.sort(),["CAPITAL_ASSIGNMENT_OVERALLOCATION","UNDERLYING_ASSET_RESOURCE_OVERALLOCATION"]);
});

test("reserved, joint, external and future resources are not identical to free owned cash",()=>{
  const base={id:"cash",type:"CURRENT_CASH",amount:known(1000),underlyingAssetId:"a",ownership:"SOLE",availability:"AVAILABLE",liquidity:"IMMEDIATE",valuationStatus:"KNOWN",purpose:"UNASSIGNED",availableFrom:known("2026-10-01"),reservedForClaimIds:[],source:"USER_REPORTED",certainty:"HIGH"};
  assert.equal(isFreeOwnedCash(base),true);
  assert.equal(isFreeOwnedCash({...base,ownership:"JOINT"}),false);
  assert.equal(isFreeOwnedCash({...base,availability:"RESERVED",reservedForClaimIds:["rent"]}),false);
  assert.equal(isFreeOwnedCash({...base,type:"FUTURE_INCOME",underlyingIncomeId:"salary",underlyingAssetId:undefined,certainty:"LOW"}),false);
  assert.equal(isFreeOwnedCash({...base,type:"EXTERNAL_SUPPORT",ownership:"EXTERNAL",underlyingAssetId:undefined}),false);
});

test("semantic DecisionOutput contains no raw zh-TW domain strings",()=>{
  for (const output of decisionOutputExamples) {
    assert.equal(/[\u3400-\u9fff]/u.test(JSON.stringify(output)),false);
    assert.equal(output.decisionOutputVersion,"1.0");
    assert.ok(output.ruleIds.length>0);
  }
});

test("limited lifecycle checks reject unfunded fulfillment and missing custom interval",()=>{
  const base={id:"claim",claimType:"IMMEDIATE_OBLIGATION",category:"HARD",amount:known(100),dueDate:known("2026-10-02"),required:true,userPriority:"HIGH",urgency:"IMMEDIATE",severity:"HIGH",certainty:"HIGH",reversibility:"LOW",lifecycleStatus:"ACTIVE",fundedAmount:known(0),fundingStatus:"UNFUNDED",eligibleResources:[],stageImpact:"SURVIVAL",source:"USER_REPORTED",modelVersion:"1.0.0",origin:{type:"USER_INPUT"},recurrence:"NONE",fulfillmentEffects:[{code:"REDUCE_CASH",amountSource:"FUNDED_AMOUNT"}]};
  assert.equal(validateClaimLifecycle(base).valid,true);
  assert.deepEqual(validateClaimLifecycle({...base,lifecycleStatus:"FULFILLED"}).codes,["FULFILLED_CLAIM_MUST_BE_FUNDED_OR_NOT_APPLICABLE"]);
  assert.deepEqual(validateClaimLifecycle({...base,recurrence:"CUSTOM"}).codes,["CUSTOM_RECURRENCE_REQUIRES_INTERVAL"]);
});

test("reference output exposes version and matched provenance",()=>{
  const actual=evaluateReference(createContext({"flags.hasMissingCriticalData":flag(true)}));
  assert.equal(actual.decisionOutputVersion,"1.0");
  assert.deepEqual(actual.matchedRuleIds,["R-001"]);
  assert.deepEqual(actual.evidenceIds,["EV-004"]);
  assert.deepEqual(actual.assumptionIds,[]);
});
