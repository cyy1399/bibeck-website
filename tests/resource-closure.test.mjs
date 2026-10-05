import assert from "node:assert/strict";
import test from "node:test";
import { known, unknown, notApplicable } from "../docs/money-model/schemas/domain-value.schema.ts";
import { validateResourceLineage, validateResourceClaimCompatibility, isFreeOwnedCash } from "../docs/money-model/reference/resource-validator.ts";

const dp = (value) => ({value, source:"USER_REPORTED", updatedAt:"2026-10-01"});
const asset = (overrides={}) => ({id:"bank",type:"CASH",currentValue:dp(100000),liquidity:"IMMEDIATE",purpose:"UNASSIGNED",...overrides});
const resource = (overrides={}) => ({id:"cash",type:"CURRENT_CASH",amount:known(100000),underlyingAssetId:"bank",ownership:"SOLE",availability:"AVAILABLE",liquidity:"IMMEDIATE",valuationStatus:"KNOWN",purpose:"UNASSIGNED",availableFrom:known("2026-10-01"),reservedForClaimIds:[],source:"USER_REPORTED",certainty:"HIGH",...overrides});
const assignment = (overrides={}) => ({id:"use",assetId:"bank",purpose:"UNASSIGNED",amount:known(100000),claimId:"rent",...overrides});
const claim = (overrides={}) => ({id:"rent",claimType:"IMMEDIATE_OBLIGATION",urgency:"IMMEDIATE",lifecycleStatus:"ACTIVE",eligibleResources:["cash"],...overrides});
const expectCode = (actual, code) => {assert.equal(actual.valid,false); assert.ok(actual.codes.includes(code),JSON.stringify(actual));};

test("B2: one economic asset and bounded assignments validate without creating more assets", () => {
  assert.deepEqual(validateResourceLineage([asset()],[resource()],[assignment()]), {valid:true,codes:[]});
});

test("B2: fractional currency partitions conserve the exact asset without binary over-allocation",()=>{
  const uses=[assignment({id:"operating",purpose:"OPERATING",amount:known(.1)}),assignment({id:"safety",purpose:"SAFETY",amount:known(.2)})];
  const views=[resource({id:"operating",purpose:"OPERATING",amount:known(.1),partitionAssignmentIds:["operating"]}),resource({id:"safety",type:"SAFETY_CAPITAL",purpose:"SAFETY",amount:known(.2),partitionAssignmentIds:["safety"]})];
  assert.deepEqual(validateResourceLineage([asset({currentValue:dp(.3)})],views,uses),{valid:true,codes:[]});
});

test("B2: unrepresentable aggregate amounts cannot certify allocation within the asset bound",()=>{
  const uses=[assignment({id:"large",amount:known(1e16)}),assignment({id:"small",amount:known(.1)})];
  expectCode(validateResourceLineage([asset({currentValue:dp(1e16)})],[],uses),"CAPITAL_ASSIGNMENT_AGGREGATE_UNCALCULABLE");
});

test("B2: unknown, N/A, negative and nonfinite amounts cannot certify safe resource allocation", () => {
  for (const value of [unknown("NOT_REPORTED"),notApplicable("NOT_OWNED"),known(-1),known(NaN),known(Infinity),{status:"KNOWN",data:{value:"100"}},null]) {
    expectCode(validateResourceLineage([asset()],[],[assignment({amount:value})]),"CAPITAL_ASSIGNMENT_AMOUNT_UNCALCULABLE");
    expectCode(validateResourceLineage([asset()],[resource({amount:value})],[]),"RESOURCE_AMOUNT_UNCALCULABLE");
  }
  assert.equal(validateResourceLineage([asset()],[resource({amount:known(0)})],[assignment({amount:known(0)})]).valid,true);
});

test("B2: actual asset references and unique identities are mandatory", () => {
  expectCode(validateResourceLineage([],[],[assignment()]),"CAPITAL_ASSIGNMENT_ASSET_NOT_FOUND");
  expectCode(validateResourceLineage([asset()],[resource({underlyingAssetId:"missing"})],[]),"RESOURCE_ASSET_NOT_FOUND");
  expectCode(validateResourceLineage([asset()],[resource({underlyingAssetId:undefined})],[]),"RESOURCE_REQUIRES_UNDERLYING_ASSET");
  expectCode(validateResourceLineage([asset(),asset()],[],[]),"DUPLICATE_ASSET_ID");
  expectCode(validateResourceLineage([asset()],[resource(),resource()],[]),"DUPLICATE_RESOURCE_ID");
  expectCode(validateResourceLineage([asset()],[],[assignment(),assignment()]),"DUPLICATE_CAPITAL_ASSIGNMENT_ID");
});

test("B2: a 100000 bank account cannot become three 100000 resources", () => {
  const purposes=["OPERATING","SAFETY","GOAL"];
  const views=purposes.map((purpose)=>resource({id:purpose,type:purpose==="OPERATING"?"CURRENT_CASH":`${purpose}_CAPITAL`,purpose}));
  const uses=purposes.map((purpose)=>assignment({id:purpose,purpose,amount:known(100000)}));
  const checked=validateResourceLineage([asset()],views,uses);
  expectCode(checked,"UNDERLYING_ASSET_RESOURCE_OVERALLOCATION");
  assert.ok(checked.codes.includes("CAPITAL_ASSIGNMENT_OVERALLOCATION"));
});

test("B2: views fitting the balance still require disjoint explicit real partitions", () => {
  const uses=[assignment({id:"safety",purpose:"SAFETY",amount:known(60000)}),assignment({id:"goal",purpose:"GOAL",amount:known(40000)})];
  const views=[resource({id:"safe",type:"SAFETY_CAPITAL",purpose:"SAFETY",amount:known(60000),partitionAssignmentIds:["safety"]}),resource({id:"goal",type:"GOAL_CAPITAL",purpose:"GOAL",amount:known(40000),partitionAssignmentIds:["goal"]})];
  assert.equal(validateResourceLineage([asset()],views,uses).valid,true);
  expectCode(validateResourceLineage([asset()],views.map((view)=>({...view,partitionAssignmentIds:undefined})),uses),"DUPLICATE_ECONOMIC_RESOURCE_REQUIRES_PARTITION");
  expectCode(validateResourceLineage([asset()],[views[0],{...views[1],partitionAssignmentIds:["safety"]}],uses),"RESOURCE_PARTITION_ASSIGNMENT_REUSED");
  expectCode(validateResourceLineage([asset()],[views[0],{...views[1],partitionAssignmentIds:["missing"]}],uses),"RESOURCE_PARTITION_ASSIGNMENT_MISMATCH");
  expectCode(validateResourceLineage([asset()],[{...views[0],amount:known(50000)},views[1]],uses),"RESOURCE_PARTITION_AMOUNT_MISMATCH");
  expectCode(validateResourceLineage([asset()],[resource({partitionAssignmentIds:["missing"]})],[]),"RESOURCE_PARTITION_ASSIGNMENT_MISMATCH");
});

test("B2: available economic amount, not gross asset value, bounds every assignment", () => {
  const restricted=asset({availableEconomicValue:known(40000)});
  expectCode(validateResourceLineage([restricted],[],[assignment({amount:known(40001)})]),"CAPITAL_ASSIGNMENT_OVERALLOCATION");
  assert.equal(validateResourceLineage([restricted],[resource({amount:known(40000)})],[assignment({amount:known(40000)})]).valid,true);
  expectCode(validateResourceLineage([asset({availableEconomicValue:known(100001)})],[],[]),"INVALID_AVAILABLE_ECONOMIC_VALUE");
  expectCode(validateResourceLineage([asset({type:"STOCKS",liquidity:"SHORT"})],[resource({type:"LONG_TERM_CAPITAL",liquidity:"SHORT"})],[]),"AVAILABLE_ECONOMIC_VALUE_UNCALCULABLE");
});

test("B2: joint ownership requires bounded share and consent and never means free sole cash", () => {
  const jointAsset=asset({ownership:"JOINT",availableEconomicValue:known(100000)});
  const jointResource=resource({ownership:"JOINT",amount:known(40000),jointOwnership:{ownedFraction:0.4,allocationConsent:true}});
  assert.equal(validateResourceLineage([jointAsset],[jointResource],[assignment({amount:known(40000)})]).valid,true);
  assert.equal(isFreeOwnedCash(jointResource),false);
  expectCode(validateResourceLineage([jointAsset],[{...jointResource,jointOwnership:undefined}],[]),"JOINT_OWNERSHIP_REQUIRES_SHARE_AND_CONSENT");
  for (const ownedFraction of [0,-1,1.1,Infinity,NaN]) expectCode(validateResourceLineage([jointAsset],[{...jointResource,jointOwnership:{ownedFraction,allocationConsent:true}}],[]),"JOINT_OWNERSHIP_REQUIRES_SHARE_AND_CONSENT");
  expectCode(validateResourceLineage([jointAsset],[jointResource],[assignment({amount:known(40001)})]),"CAPITAL_ASSIGNMENT_OVERALLOCATION");
  expectCode(validateResourceClaimCompatibility({...jointResource,jointOwnership:{ownedFraction:0.4,allocationConsent:false}},claim(),"2026-10-01"),"JOINT_RESOURCE_ALLOCATION_NOT_AUTHORIZED");
});

test("B2: availability, reservations and explicit restrictions remain coherent", () => {
  expectCode(validateResourceLineage([asset()],[resource({availability:"RESERVED"})],[]),"RESERVED_RESOURCE_WITHOUT_CLAIM");
  expectCode(validateResourceLineage([asset()],[resource({reservedForClaimIds:["house"]})],[]),"AVAILABLE_RESOURCE_HAS_RESERVATIONS");
  expectCode(validateResourceLineage([asset()],[resource({availability:"RESTRICTED",restrictionReason:"RETIREMENT"})],[]),"RESTRICTED_RESOURCE_REQUIRES_SEMANTICS");
  const reserved=resource({availability:"RESERVED",reservedForClaimIds:["house"]});
  assert.equal(isFreeOwnedCash(reserved),false);
  assert.equal(isFreeOwnedCash(resource({purpose:"GOAL"})),false);
  expectCode(validateResourceClaimCompatibility(reserved,claim(),"2026-10-01"),"RESOURCE_RESERVED_FOR_ANOTHER_CLAIM");
  const restricted=resource({availability:"RESTRICTED",restriction:{reasonCode:"RETIREMENT",allowsCurrentFunding:false}});
  expectCode(validateResourceClaimCompatibility(restricted,claim(),"2026-10-01"),"RESOURCE_RESTRICTION_BLOCKS_FUNDING");
  const permitted={...restricted,restriction:{reasonCode:"RENT_ONLY",allowsCurrentFunding:true,allowedClaimIds:["rent"],allowedClaimTypes:["IMMEDIATE_OBLIGATION"]}};
  assert.equal(validateResourceClaimCompatibility(permitted,claim(),"2026-10-01").valid,true);
  expectCode(validateResourceClaimCompatibility(permitted,claim({id:"house"}),"2026-10-01"),"RESOURCE_RESTRICTION_CLAIM_MISMATCH");
});

test("B2: malformed runtime classifications and dates are rejected rather than funded", () => {
  expectCode(validateResourceClaimCompatibility(resource({ownership:"MADE_UP"}),claim(),"2026-10-01"),"INVALID_RESOURCE_CLASSIFICATION");
  expectCode(validateResourceClaimCompatibility(resource({reservedForClaimIds:42}),claim(),"2026-10-01"),"INVALID_RESOURCE_RESERVATIONS");
  expectCode(validateResourceClaimCompatibility(resource({availableFrom:{status:"KNOWN"}}),claim(),"2026-10-01"),"RESOURCE_AVAILABILITY_DATE_UNRESOLVED");
  expectCode(validateResourceClaimCompatibility(resource({availableFrom:known("2026-02-30")}),claim(),"2026-10-01"),"RESOURCE_AVAILABILITY_DATE_UNRESOLVED");
  expectCode(validateResourceLineage(null,[],[]),"RESOURCE_INVENTORY_MUST_BE_ARRAYS");
  for (const currentValue of [
    {value:100000,source:"FORGED",updatedAt:"2026-10-01"},
    {value:100000,source:"VERIFIED",updatedAt:"2026-02-30"},
    {value:100000},
  ]) expectCode(validateResourceLineage([asset({currentValue})],[resource()],[]),"ASSET_VALUE_UNCALCULABLE");
  for (const changes of [{type:"FAKE"},{liquidity:"FAKE"},{purpose:"FAKE"},{ownership:"FAKE"}]) expectCode(validateResourceLineage([asset(changes)],[],[]),"INVALID_ASSET_CLASSIFICATION");
  for (const data of [
    {value:"2026-10-01",source:"FORGED",updatedAt:"2026-10-01"},
    {value:"2026-10-01",source:"VERIFIED",updatedAt:"2026-02-30"},
    {value:"2026-10-01"},
  ]) {
    const invalid=resource({availableFrom:{status:"KNOWN",data}});
    expectCode(validateResourceLineage([asset()],[invalid],[]),"RESOURCE_AVAILABILITY_DATE_UNRESOLVED");
    expectCode(validateResourceClaimCompatibility(invalid,claim(),"2026-10-01"),"RESOURCE_AVAILABILITY_DATE_UNRESOLVED");
    assert.equal(isFreeOwnedCash(invalid),false);
  }
  expectCode(validateResourceLineage([],[],[],null),"INVALID_RESOURCE_VALIDATION_CONTEXT");
  for (const claims of [42,[null],[{}]]) expectCode(validateResourceLineage([],[],[],{claims}),"INVALID_RESOURCE_CLAIM_INVENTORY");
  expectCode(validateResourceLineage([],[],[],{claims:[{id:"rent"}]}),"INVALID_RESOURCE_CLAIM_REFERENCE_CONTRACT");
  expectCode(validateResourceLineage([],[],[],{claims:[claim(),claim()]}),"DUPLICATE_RESOURCE_CLAIM_ID");
  for (const allocations of [42,[null]]) expectCode(validateResourceLineage([],[],[],{allocations}),"INVALID_RESOURCE_ALLOCATION_INVENTORY");
  expectCode(validateResourceLineage([],[],[],{incomeIds:42}),"INVALID_RESOURCE_INCOME_INVENTORY");
  expectCode(validateResourceLineage([],[],[],{asOf:"2026-02-30"}),"INVALID_RESOURCE_EVALUATION_DATE");
  expectCode(validateResourceClaimCompatibility(resource({source:"FORGED"}),claim(),"2026-10-01"),"INVALID_RESOURCE_QUALITY_METADATA");
  expectCode(validateResourceClaimCompatibility(resource({underlyingAssetId:undefined}),claim(),"2026-10-01"),"RESOURCE_REQUIRES_UNDERLYING_ASSET");
  expectCode(validateResourceClaimCompatibility(resource({partitionAssignmentIds:42}),claim(),"2026-10-01"),"INVALID_RESOURCE_PARTITION_REFERENCE");
});

test("B2: future income, support and credit cannot fund already-owned claims", () => {
  for (const type of ["FUTURE_INCOME","EXTERNAL_SUPPORT","CREDIT_AVAILABILITY","MONTHLY_SURPLUS"]) {
    const noncurrent=resource({type,underlyingAssetId:undefined,underlyingIncomeId:"salary",ownership:type==="EXTERNAL_SUPPORT"?"EXTERNAL":"UNKNOWN",certainty:"LOW"});
    assert.equal(isFreeOwnedCash(noncurrent),false);
    expectCode(validateResourceClaimCompatibility(noncurrent,claim(),"2026-10-01"),"NONCURRENT_RESOURCE_CANNOT_FUND_OWNED_CLAIM");
  }
  expectCode(validateResourceLineage([],[resource({type:"FUTURE_INCOME",underlyingAssetId:undefined,underlyingIncomeId:"missing",certainty:"LOW"})],[],{incomeIds:["salary"]}),"RESOURCE_INCOME_NOT_FOUND");
  expectCode(validateResourceLineage([],[resource({type:"CREDIT_AVAILABILITY",underlyingAssetId:undefined,ownership:"JOINT",jointOwnership:{ownedFraction:0.5,allocationConsent:true}})],[]),"CREDIT_AVAILABILITY_NOT_OWNED_CAPITAL");
});

test("B2: dated availability, liquidity, eligible source and active claim gate funding", () => {
  assert.equal(validateResourceClaimCompatibility(resource(),claim(),"2026-10-01").valid,true);
  expectCode(validateResourceClaimCompatibility(resource({availableFrom:unknown("NOT_REPORTED")}),claim(),"2026-10-01"),"RESOURCE_AVAILABILITY_DATE_UNRESOLVED");
  expectCode(validateResourceClaimCompatibility(resource(),claim()),"RESOURCE_AVAILABILITY_DATE_UNRESOLVED");
  expectCode(validateResourceClaimCompatibility(resource({availableFrom:known("2026-10-02")}),claim(),"2026-10-01"),"RESOURCE_AVAILABLE_IN_FUTURE");
  assert.equal(isFreeOwnedCash(resource({availableFrom:known("2026-10-02")}),"2026-10-01"),false);
  assert.equal(isFreeOwnedCash(resource({availableFrom:unknown("NOT_REPORTED")}),"2026-10-01"),false);
  assert.equal(isFreeOwnedCash(resource(),"2026-10-01"),true);
  expectCode(validateResourceClaimCompatibility(resource({liquidity:"ILLIQUID"}),claim(),"2026-10-01"),"RESOURCE_NOT_IMMEDIATELY_LIQUID");
  expectCode(validateResourceClaimCompatibility(resource(),claim({eligibleResources:[]}),"2026-10-01"),"RESOURCE_NOT_ELIGIBLE_FOR_CLAIM");
  expectCode(validateResourceClaimCompatibility(resource(),claim({lifecycleStatus:"FULFILLED"}),"2026-10-01"),"CLAIM_NOT_ACTIVE_FOR_FUNDING");
});

test("B2: allocations cannot reuse assignment or resource amount beyond its bound", () => {
  const allocation={resourceId:"cash",claimId:"rent",capitalAssignmentId:"use",amount:100000};
  const context={claims:[claim()],allocations:[allocation],asOf:"2026-10-01"};
  assert.equal(validateResourceLineage([asset()],[resource()],[assignment()],context).valid,true);
  const doubled=validateResourceLineage([asset()],[resource()],[assignment()],{...context,allocations:[allocation,allocation]});
  expectCode(doubled,"RESOURCE_ALLOCATION_OVERALLOCATION");
  assert.ok(doubled.codes.includes("ASSIGNMENT_FUNDING_OVERALLOCATION"));
  expectCode(validateResourceLineage([asset()],[resource()],[assignment()],{...context,allocations:[{...allocation,capitalAssignmentId:"missing"}]}),"RESOURCE_ALLOCATION_REFERENCE_NOT_FOUND");
  expectCode(validateResourceLineage([asset()],[resource()],[assignment({claimId:"house"})],context),"RESOURCE_ALLOCATION_ASSIGNMENT_MISMATCH");
  expectCode(validateResourceLineage([asset()],[resource({partitionAssignmentIds:42})],[assignment()],context),"RESOURCE_ALLOCATION_OUTSIDE_PARTITION");
});
