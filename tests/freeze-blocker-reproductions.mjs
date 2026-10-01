// Separate review diagnostic, NOT an acceptance suite and NOT part of pnpm test.
// Run: node --experimental-strip-types tests/freeze-blocker-reproductions.mjs
// A nonzero exit means an intended freeze invariant is still violated.
import { evaluateReference } from "../docs/money-model/reference/reference-evaluator.ts";
import { createContext, flag, scalar } from "../docs/money-model/reference/context-builder.ts";
import { known, unknown } from "../docs/money-model/schemas/domain-value.schema.ts";
import { validateResourceLineage } from "../docs/money-model/reference/resource-validator.ts";
import { validateClaimLifecycle } from "../docs/money-model/reference/claim-validator.ts";

const results=[];
const audit=(id,expected,actual,satisfied)=>{
  results.push({id,status:satisfied?"PASS":"FAIL",expected,actual});
};

const collision=evaluateReference(createContext({
  "flags.hasDelinquentDebt":flag(true),
  "counts.unresolvedPriorityClaims":scalar(0),
}));
audit("FR-B001/critical-no-mission",
  "A critical repair candidate cannot be erased by NO_MISSION; contradictory context must be rejected or reconciled.",
  {rules:collision.matchedRuleIds,severity:collision.severity,mainQuest:collision.mainQuest,halted:collision.halted},
  collision.mainQuest!==null||collision.halted);

const missing=evaluateReference(createContext());
audit("FR-B001/all-unknown",
  "Unknown required inputs must expose missing information and must not claim HIGH complete-decision confidence.",
  {confidence:missing.modelConfidence,missingInformation:missing.missingInformation,halted:missing.halted},
  missing.modelConfidence!=="HIGH"&&missing.missingInformation.length>0);

const orphan=validateResourceLineage([],[],[
  {id:"orphan",assetId:"missing",purpose:"SAFETY",amount:known(100)},
]);
audit("FR-B002/orphan-asset",
  "An allocation to an absent asset must not validate.",
  orphan,!orphan.valid);

const asset={id:"cash",type:"CASH",currentValue:{value:1000,source:"USER_REPORTED",updatedAt:"2026-10-01"},liquidity:"IMMEDIATE",purpose:"UNASSIGNED"};
const amounts=[
  ["unknown",unknown("NOT_REPORTED")],
  ["negative",known(-1)],
  ["NaN",known(Number.NaN)],
  ["infinity",known(Number.POSITIVE_INFINITY)],
];
const amountChecks=amounts.map(([input,amount])=>({
  input,
  ...validateResourceLineage([asset],[],[{id:"allocation",assetId:"cash",purpose:"SAFETY",amount}]),
}));
audit("FR-B002/uncalculable-amount",
  "Unknown, negative or nonfinite amounts cannot certify safe allocation.",
  amountChecks,amountChecks.every((result)=>!result.valid));

const claim={
  id:"claim",claimType:"IMMEDIATE_OBLIGATION",category:"HARD",
  amount:known(100),dueDate:known("2026-10-02"),required:true,
  userPriority:"HIGH",urgency:"IMMEDIATE",severity:"HIGH",
  certainty:"HIGH",reversibility:"LOW",lifecycleStatus:"ACTIVE",
  fundedAmount:known(0),fundingStatus:"FUNDED",eligibleResources:[],
  stageImpact:"SURVIVAL",source:"USER_REPORTED",modelVersion:"1.0.0",
  origin:{type:"USER_INPUT"},recurrence:"NONE",
  fulfillmentEffects:[{code:"REDUCE_CASH",amountSource:"FUNDED_AMOUNT"}],
};
const inconsistent=validateClaimLifecycle(claim);
audit("FR-B003/funding-mismatch",
  "FUNDED with fundedAmount=0 and claim amount=100 must be rejected.",
  inconsistent,!inconsistent.valid);

const recurrence=validateClaimLifecycle({
  ...claim,fundingStatus:"UNFUNDED",recurrence:"CUSTOM",
  customRecurrence:{interval:0,unit:"DAY"},
});
audit("FR-B003/zero-interval",
  "Custom recurrence must have a positive finite interval.",
  recurrence,!recurrence.valid);

for (const result of results) console.log(JSON.stringify(result));
const failures=results.filter((result)=>result.status==="FAIL");
console.log(JSON.stringify({diagnostic:"FREEZE_BLOCKER_REPRODUCTION",checks:results.length,passed:results.length-failures.length,failed:failures.length,freezeApproved:false}));
process.exitCode=failures.length?1:0;
