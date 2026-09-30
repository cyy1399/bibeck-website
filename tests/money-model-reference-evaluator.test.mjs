import assert from "node:assert/strict";
import test from "node:test";
import { executableCases } from "../docs/money-model/tests/executable-cases.ts";
import { evaluateReference } from "../docs/money-model/reference/reference-evaluator.ts";
import { evaluateCondition } from "../docs/money-model/reference/predicate-evaluator.ts";
import { createContext, flag, scalar } from "../docs/money-model/reference/context-builder.ts";
import { known, unknown } from "../docs/money-model/schemas/domain-value.schema.ts";
import { validateResourceLineage, isFreeOwnedCash } from "../docs/money-model/reference/resource-validator.ts";
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
  for (const output of decisionOutputExamples) assert.equal(/[\u3400-\u9fff]/u.test(JSON.stringify(output)),false);
});
