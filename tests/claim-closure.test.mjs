import assert from "node:assert/strict";
import test from "node:test";
import { known, unknown, notApplicable } from "../docs/money-model/schemas/domain-value.schema.ts";
import { deriveFundingStatus, validateClaimLifecycle, validateClaims } from "../docs/money-model/reference/claim-validator.ts";
import { fulfillClaim, terminateClaim, validateFulfillmentLedger } from "../docs/money-model/reference/claim-fulfillment.ts";

const claim=(changes={})=>({id:"rent",claimType:"IMMEDIATE_OBLIGATION",category:"HARD",amount:known(100),dueDate:known("2026-10-02"),required:true,userPriority:"HIGH",urgency:"IMMEDIATE",severity:"HIGH",certainty:"HIGH",reversibility:"LOW",lifecycleStatus:"ACTIVE",fundedAmount:known(0),fundingStatus:"UNFUNDED",eligibleResources:["owned-cash"],stageImpact:"SURVIVAL",source:"USER_REPORTED",modelVersion:"1.0.0",origin:{type:"USER_INPUT"},recurrence:"NONE",fulfillmentEffects:[{code:"REDUCE_CASH",amountSource:"FUNDED_AMOUNT"}],...changes});
const ledger=()=>({assets:{bank:1000},liabilities:{loan:500},assignments:{operating:{assetId:"bank",purpose:"OPERATING",amount:800},safety:{assetId:"bank",purpose:"SAFETY",amount:100},goal:{assetId:"bank",purpose:"GOAL",amount:100}},receiptIds:[]});
const debt=(changes={})=>claim({id:"repayment",claimType:"DEBT_MINIMUM",amount:known(120),fundedAmount:known(120),fundingStatus:"FUNDED",debtPayment:{liabilityId:"loan",principal:known(100),interest:known(15),fees:known(5)},fulfillmentEffects:[{code:"REDUCE_CASH",amountSource:"CLAIM_AMOUNT"},{code:"REDUCE_DEBT_BALANCE",targetId:"loan",amountSource:"DEBT_PRINCIPAL"}],...changes});
const funding=(changes={})=>({cashAssetId:"bank",sourceAssignmentId:"operating",asOf:"2026-10-01",resource:{id:"owned-cash",type:"CURRENT_CASH",amount:known(1000),underlyingAssetId:"bank",ownership:"SOLE",availability:"AVAILABLE",liquidity:"IMMEDIATE",valuationStatus:"KNOWN",purpose:"OPERATING",availableFrom:known("2026-10-01"),reservedForClaimIds:[],source:"USER_REPORTED",certainty:"HIGH"},...changes});

test("B3 fractional debt payment components and ledger effects conserve decimal currency exactly",()=>{
  const repayment=debt({amount:known(.3),fundedAmount:known(.3),debtPayment:{liabilityId:"loan",principal:known(.1),interest:known(.2),fees:known(0)}});
  const before={assets:{bank:.5},liabilities:{loan:.4},assignments:{operating:{assetId:"bank",purpose:"OPERATING",amount:.3},safety:{assetId:"bank",purpose:"SAFETY",amount:.1},goal:{assetId:"bank",purpose:"GOAL",amount:.1}},receiptIds:[]};
  const source=funding();source.resource.amount=known(.5);
  assert.equal(validateClaimLifecycle(repayment).valid,true);
  const paid=fulfillClaim(repayment,before,source);
  assert.equal(paid.ledger.assets.bank,.2);
  assert.equal(paid.ledger.liabilities.loan,.3);
  assert.equal(paid.ledger.assignments.operating.amount,0);
  assert.equal(before.assets.bank,.5);
  assert.equal(fulfillClaim(repayment,paid.ledger,source).applied,false);
});

test("B3 unrepresentable assignment aggregate cannot silently pass ledger conservation",()=>{
  const before={assets:{bank:1e16},liabilities:{},assignments:{large:{assetId:"bank",purpose:"OPERATING",amount:1e16},small:{assetId:"bank",purpose:"GOAL",amount:.1}},receiptIds:[]};
  assert.throws(()=>validateFulfillmentLedger(before),/KNOWN_NONNEGATIVE_LEDGER_AMOUNT_REQUIRED/);
});

test("B3 funding status agrees exactly with finite target and funded amounts",()=>{
  for (const [funded,status] of [[0,"UNFUNDED"],[25,"PARTIALLY_FUNDED"],[100,"FUNDED"]]) {
    assert.equal(deriveFundingStatus(claim({fundedAmount:known(funded)})),status);
    assert.equal(validateClaimLifecycle(claim({fundedAmount:known(funded),fundingStatus:status})).valid,true);
  }
  assert.equal(validateClaimLifecycle(claim({fundingStatus:"FUNDED"})).valid,false);
  assert.equal(validateClaimLifecycle(claim({fundedAmount:known(125),fundingStatus:"OVERFUNDED"})).valid,false);
  for (const invalid of [-1,NaN,Infinity]) assert.equal(validateClaimLifecycle(claim({fundedAmount:known(invalid)})).valid,false);
  for (const invalid of [undefined,null,{status:"MAYBE"}]) assert.equal(validateClaimLifecycle(claim({amount:invalid})).valid,false);
  assert.equal(validateClaimLifecycle(debt({fulfillmentEffects:[null]})).valid,false);
  assert.equal(validateClaimLifecycle(debt({debtPayment:{liabilityId:"loan"}})).valid,false);
  assert.equal(validateClaimLifecycle(claim({amount:known(0),fundingStatus:"FUNDED"})).valid,true);
});

test("B3 unknown target/funding is separate from zero and N/A",()=>{
  for (const changes of [{amount:unknown("TARGET_UNKNOWN")},{fundedAmount:unknown("FUNDING_UNKNOWN")},{amount:unknown("TARGET_UNKNOWN"),fundedAmount:unknown("FUNDING_UNKNOWN")}]) {
    assert.equal(deriveFundingStatus(claim(changes)),"UNKNOWN");
    assert.equal(validateClaimLifecycle(claim({...changes,fundingStatus:"UNKNOWN"})).valid,true);
    assert.equal(validateClaimLifecycle(claim({...changes,fundingStatus:"FUNDED"})).valid,false);
    assert.equal(validateClaimLifecycle(claim({...changes,fundingStatus:"UNKNOWN",lifecycleStatus:"FULFILLED"})).valid,false);
  }
  const decision=claim({claimType:"TRADING_COST_OPTIMIZATION",category:"OPTIMIZATION",amount:notApplicable("NON_MONETARY_DECISION"),fundedAmount:notApplicable("NON_MONETARY_DECISION"),fundingStatus:"NOT_APPLICABLE",fulfillmentEffects:[{code:"NO_BALANCE_SHEET_EFFECT",amountSource:"CLAIM_AMOUNT"}]});
  assert.equal(validateClaimLifecycle(decision).valid,true);
  assert.equal(fulfillClaim(decision,ledger()).applied,true);
  assert.equal(validateClaimLifecycle({...decision,fundedAmount:known(0)}).valid,false);
});

test("B3 overfunding is opt-in, and funded is not fulfilled",()=>{
  const target=claim({claimType:"GOAL_FUNDING",category:"CHOSEN",fundedAmount:known(125),fundingStatus:"OVERFUNDED",overfundingSupport:{reasonCode:"EXPLICIT_TARGET_ACCEPTS_SURPLUS"},fulfillmentEffects:[{code:"FUND_GOAL",targetId:"goal",amountSource:"FUNDED_AMOUNT",assignmentOnly:true}]});
  assert.equal(validateClaimLifecycle(target).valid,true);
  assert.equal(validateClaimLifecycle({...target,overfundingSupport:undefined}).valid,false);
  assert.equal(validateClaimLifecycle({...target,category:"HARD"}).valid,false);
  const rent=claim({fundedAmount:known(100),fundingStatus:"FUNDED"});
  assert.equal(rent.lifecycleStatus,"ACTIVE");
  assert.equal(validateClaimLifecycle(rent).valid,true);
  assert.equal(validateClaimLifecycle({...rent,lifecycleStatus:"CREATED"}).valid,false);
});

test("B3 recurring occurrences require stable distinct identity and positive integer interval",()=>{
  for (const interval of [0,-1,0.5,NaN,Infinity]) assert.equal(validateClaimLifecycle(claim({recurrence:"CUSTOM",customRecurrence:{interval,unit:"MONTH"},occurrence:{templateId:"rent-template",occurrenceKey:"2026-10"}})).valid,false);
  const monthly=claim({recurrence:"MONTHLY",occurrence:{templateId:"rent-template",occurrenceKey:"2026-10"}});
  assert.equal(validateClaimLifecycle(monthly).valid,true);
  assert.equal(validateClaimLifecycle({...monthly,occurrence:undefined}).valid,false);
  assert.equal(validateClaimLifecycle({...monthly,occurrence:{templateId:"rent",occurrenceKey:"2026-10"}}).valid,false);
  assert.equal(validateClaims([monthly,{...monthly,id:"rent-copy"}]).valid,false);
  assert.equal(validateClaims([monthly,{...monthly,id:"rent-next",occurrence:{templateId:"rent-template",occurrenceKey:"2026-11"}}]).valid,true);
});

test("B3 debt fulfillment subtracts cash total and principal only, atomically and once",()=>{
  const before=ledger();
  const original=structuredClone(before);
  const paid=fulfillClaim(debt(),before,funding());
  assert.equal(paid.ledger.assets.bank,880);
  assert.equal(paid.ledger.liabilities.loan,400);
  assert.equal(paid.ledger.assignments.operating.amount,680);
  assert.equal(paid.ledger.assets.bank-paid.ledger.liabilities.loan,480);
  assert.equal(before.assets.bank-before.liabilities.loan,500);
  assert.deepEqual(before,original);
  assert.equal(paid.claim.lifecycleStatus,"FULFILLED");
  const retried=fulfillClaim(debt(),paid.ledger,funding());
  assert.equal(retried.applied,false);
  assert.deepEqual(retried.ledger,paid.ledger);
  assert.throws(()=>fulfillClaim(debt({amount:known(130),fundedAmount:known(130),debtPayment:{liabilityId:"loan",principal:known(100),interest:known(25),fees:known(5)}}),paid.ledger,funding()),/RECEIPT_EFFECT_PAYLOAD_MISMATCH/);
  assert.throws(()=>fulfillClaim(debt({debtPayment:{liabilityId:"loan",principal:known(110),interest:known(5),fees:known(5)}}),paid.ledger,funding()),/RECEIPT_EFFECT_PAYLOAD_MISMATCH/);
  assert.throws(()=>fulfillClaim(debt(),{...paid.ledger,receiptEffectFingerprints:undefined},funding()),/RECEIPT_EFFECT_BINDING_REQUIRED/);
  assert.throws(()=>fulfillClaim({...paid.claim},before,funding()),/ONLY_ACTIVE/);
  assert.throws(()=>fulfillClaim(debt({debtPayment:{liabilityId:"loan",principal:unknown("UNKNOWN_PRINCIPAL"),interest:known(15),fees:known(5)}}),before,funding()),/UNKNOWN_DEBT_BREAKDOWN/);
  assert.equal(validateClaimLifecycle(debt({fulfillmentEffects:[{code:"REDUCE_DEBT_BALANCE",targetId:"loan",amountSource:"DEBT_PRINCIPAL"}]})).valid,false);
  assert.equal(validateClaimLifecycle(debt({debtPayment:{liabilityId:"loan",principal:known(120),interest:known(15),fees:known(5)}})).valid,false);
  assert.throws(()=>fulfillClaim(debt(),{...before,liabilities:{loan:50}},funding()),/PRINCIPAL_EXCEEDS/);
  assert.deepEqual(before,original);
});

test("B3 safety and goal fulfillment only transfer existing assignments, not assets/net worth",()=>{
  for (const [type,code,target] of [["SAFETY_BUFFER","INCREASE_SAFETY_CAPITAL","safety"],["GOAL_FUNDING","FUND_GOAL","goal"]]) {
    const capital=claim({id:target,claimType:type,category:"PROTECTIVE",fundedAmount:known(100),fundingStatus:"FUNDED",fulfillmentEffects:[{code,targetId:target,amountSource:"FUNDED_AMOUNT",assignmentOnly:true}]});
    const before=ledger();
    const funded=fulfillClaim(capital,before,funding());
    assert.deepEqual(funded.ledger.assets,before.assets);
    assert.deepEqual(funded.ledger.liabilities,before.liabilities);
    assert.equal(funded.ledger.assignments[target].amount,200);
    assert.equal(funded.ledger.assignments.operating.amount,700);
    assert.equal(Object.values(funded.ledger.assignments).reduce((sum,a)=>sum+a.amount,0),1000);
    assert.equal(validateClaimLifecycle({...capital,fulfillmentEffects:[{code,targetId:target,amountSource:"FUNDED_AMOUNT"}]}).valid,false);
    assert.throws(()=>fulfillClaim(capital,before,funding({sourceAssignmentId:target,resource:{...funding().resource,amount:known(100),purpose:target.toUpperCase()}})),/SAME_ASSET/);
  }
});

test("B3 cancellation/expiry retain funded history and expose reservation release, never payment",()=>{
  for (const status of ["CANCELLED","EXPIRED"]) {
    const active=claim({fundedAmount:known(100),fundingStatus:"FUNDED"});
    const terminated=terminateClaim(active,status);
    assert.equal(terminated.claim.fundingStatus,"FUNDED");
    assert.equal(terminated.claim.fundedAmount.data.value,100);
    assert.equal(terminated.claim.lifecycleStatus,status);
    assert.deepEqual(terminated.releasedReservationClaimIds,[active.id]);
    assert.equal(terminated.effectsApplied,false);
    assert.throws(()=>terminateClaim(terminated.claim,"CANCELLED"),/TERMINAL/);
    assert.throws(()=>fulfillClaim(terminated.claim,ledger(),funding()),/ONLY_ACTIVE/);
  }
});

test("B3 fulfillment enforces declared resource compatibility before any ledger effect",()=>{
  const active=debt();
  const source=funding();
  const before=ledger();
  const original=structuredClone(before);
  assert.throws(()=>fulfillClaim(active,before),/COMPATIBLE_FUNDING_RESOURCE_REQUIRED/);
  for (const resource of [
    {...source.resource,availability:"RESERVED",reservedForClaimIds:["house"]},
    {...source.resource,type:"EXTERNAL_SUPPORT",ownership:"EXTERNAL"},
    {...source.resource,type:"FUTURE_INCOME"},
    {...source.resource,type:"CREDIT_AVAILABILITY"},
    {...source.resource,availability:"RESTRICTED",restriction:{reasonCode:"RETIREMENT_LOCK",allowsCurrentFunding:false}},
    {...source.resource,amount:known(20)},
    {...source.resource,amount:known(1001)},
    {...source.resource,partitionAssignmentIds:["house-assignment"]},
  ]) assert.throws(()=>fulfillClaim(active,before,{...source,resource}));
  assert.deepEqual(before,original);
});

test("B3 runtime claim/ledger shape, source/date and closed effects reject malformed data safely",()=>{
  for (const changes of [
    {amount:{status:"KNOWN",data:{value:100,source:"UNTRUSTED",updatedAt:"2026-10-01"}}},
    {fundedAmount:{status:"KNOWN",data:{value:0,source:"VERIFIED",updatedAt:"2026-02-30"}}},
    {dueDate:known("2026-02-30")},
    {dueDate:known("not-a-date")},
    {source:"UNKNOWN_SOURCE"},
    {fulfillmentEffects:[{code:"REDUCE_CASH",amountSource:"FUNDED_AMOUNT",callback:()=>{throw new Error("must not run");}}]},
  ]) assert.equal(validateClaimLifecycle(claim(changes)).valid,false);
  for (const inventory of [null,{},[null],[claim(),null]]) assert.equal(validateClaims(inventory).valid,false);
  for (const invalid of [null,{}, {...ledger(),assets:{bank:NaN}}, {...ledger(),assignments:{bad:null}}, {...ledger(),receiptIds:"not-an-array"}]) assert.throws(()=>validateFulfillmentLedger(invalid));
  assert.throws(()=>terminateClaim(claim(),"ACTIVE"),/TERMINATION_REQUIRES/);
});

test("B3 recurring receipt prevents renamed records paying the same economic occurrence twice",()=>{
  const monthly=claim({fundedAmount:known(100),fundingStatus:"FUNDED",recurrence:"MONTHLY",occurrence:{templateId:"rent-template",occurrenceKey:"2026-10"}});
  const first=fulfillClaim(monthly,ledger(),funding());
  const renamed=fulfillClaim({...monthly,id:"renamed-rent-record"},first.ledger,funding());
  assert.equal(renamed.applied,false);
  assert.equal(renamed.receiptId,first.receiptId);
  assert.equal(renamed.ledger.assets.bank,900);
  assert.throws(()=>fulfillClaim({...monthly,id:"altered-rent-record",amount:known(200),fundedAmount:known(200)},first.ledger,funding()),/RECEIPT_EFFECT_PAYLOAD_MISMATCH/);
  assert.throws(()=>fulfillClaim({...monthly,dueDate:known("2026-10-03")},first.ledger,funding()),/RECEIPT_EFFECT_PAYLOAD_MISMATCH/);
  const november={...monthly,id:"rent-next",occurrence:{templateId:"rent-template",occurrenceKey:"2026-11"}};
  const next=fulfillClaim(november,first.ledger,funding({resource:{...funding().resource,amount:known(900)}}));
  assert.equal(next.applied,true);
  assert.equal(next.ledger.assets.bank,800);
});
