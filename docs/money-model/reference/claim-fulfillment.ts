import type { FinancialClaim } from "../schemas/financial-claim.schema.ts";
import type { FinancialResource } from "../schemas/financial-resource.schema.ts";
import type { DomainValue } from "../schemas/domain-value.schema.ts";
import { validateClaimLifecycle } from "./claim-validator.ts";
import { validateResourceClaimCompatibility } from "./resource-validator.ts";
import { decimalProduct, decimalSum } from "./decimal-arithmetic.ts";

/** A deliberately small, known-value reference ledger, not a production workflow. */
export interface FulfillmentLedger {
  assets:Record<string,number>;
  liabilities:Record<string,number>;
  assignments:Record<string,{assetId:string; purpose:string; amount:number}>;
  receiptIds:string[];
  /** Canonical economic payloads bind a receipt to the effects actually applied. */
  receiptEffectFingerprints?:Record<string,string>;
}
export interface FulfillmentFunding {cashAssetId?:string; sourceAssignmentId?:string; resource?:FinancialResource; asOf?:string}
const record=(value:unknown):value is Record<string,unknown>=>!!value && typeof value==="object" && !Array.isArray(value);
const amount=(value:unknown):number=> {
  if (typeof value!=="number" || !Number.isFinite(value) || value<0) throw new Error("KNOWN_NONNEGATIVE_LEDGER_AMOUNT_REQUIRED");
  return value;
};
/** Economic occurrence identity survives a renamed claim record. */
export const fulfillmentReceiptId=(claim:FinancialClaim):string => claim.occurrence
  ? JSON.stringify(["RECURRING_OCCURRENCE",claim.occurrence.templateId,claim.occurrence.occurrenceKey])
  : JSON.stringify(["ONE_TIME_CLAIM",claim.id]);

const economicValue=<T>(value:DomainValue<T>) => value.status==="KNOWN"
  ? {status:value.status,value:value.data.value}
  : {status:value.status,reasonCode:value.reasonCode};

/** A deterministic equality key, not a cryptographic signature or a confidence score. */
const fulfillmentEffectFingerprint=(claim:FinancialClaim):string => JSON.stringify({
  claimType:claim.claimType,
  amount:economicValue(claim.amount),
  fundedAmount:economicValue(claim.fundedAmount),
  dueDate:economicValue(claim.dueDate),
  effects:claim.fulfillmentEffects.map((effect)=>({code:effect.code,targetId:effect.targetId??null,amountSource:effect.amountSource,assignmentOnly:effect.assignmentOnly??false})).sort((a,b)=>a.code.localeCompare(b.code)),
  debtPayment:claim.debtPayment?{liabilityId:claim.debtPayment.liabilityId,principal:economicValue(claim.debtPayment.principal),interest:economicValue(claim.debtPayment.interest),fees:economicValue(claim.debtPayment.fees)}:null,
});

export function validateFulfillmentLedger(ledger:FulfillmentLedger):void {
  if (!record(ledger) || !record(ledger.assets) || !record(ledger.liabilities) || !record(ledger.assignments) || !Array.isArray(ledger.receiptIds)
    || ledger.receiptIds.some((id)=>typeof id!=="string" || id.length===0)) throw new Error("INVALID_FULFILLMENT_LEDGER_SHAPE");
  for (const value of Object.values(ledger.assets)) amount(value);
  for (const value of Object.values(ledger.liabilities)) amount(value);
  const totals=new Map<string,number>();
  for (const assignment of Object.values(ledger.assignments)) {
    if (!record(assignment) || typeof assignment.assetId!=="string" || typeof assignment.purpose!=="string") throw new Error("INVALID_LEDGER_ASSIGNMENT");
    amount(assignment.amount);
    if (!Object.hasOwn(ledger.assets,assignment.assetId)) throw new Error("ASSIGNMENT_ASSET_NOT_FOUND");
    totals.set(assignment.assetId,decimalSum([totals.get(assignment.assetId)??0,assignment.amount]));
  }
  for (const [assetId,total] of totals) {amount(total);if (total>ledger.assets[assetId]) throw new Error("ASSIGNMENT_EXCEEDS_ASSET");}
  if (new Set(ledger.receiptIds).size!==ledger.receiptIds.length) throw new Error("DUPLICATE_FULFILLMENT_RECEIPT");
  const fingerprints=ledger.receiptEffectFingerprints??{};
  if (!record(fingerprints) || ledger.receiptIds.some((id)=>!Object.hasOwn(fingerprints,id) || typeof fingerprints[id]!=="string" || fingerprints[id].length===0)
    || Object.keys(fingerprints).some((id)=>!ledger.receiptIds.includes(id))) throw new Error("FULFILLMENT_RECEIPT_EFFECT_BINDING_REQUIRED");
}

/** Validate every effect before returning one atomic immutable result. Retry is a no-op. */
export function fulfillClaim(claim:FinancialClaim,ledger:FulfillmentLedger,funding:FulfillmentFunding={}) {
  const validation=validateClaimLifecycle(claim);
  if (!validation.valid) throw new Error(validation.codes.join(","));
  validateFulfillmentLedger(ledger);
  const receiptId=fulfillmentReceiptId(claim);
  const fulfilled={...claim,lifecycleStatus:"FULFILLED" as const};
  const fulfilledValidation=validateClaimLifecycle(fulfilled);
  if (!fulfilledValidation.valid) throw new Error(fulfilledValidation.codes.join(","));
  const effectFingerprint=fulfillmentEffectFingerprint(claim);
  if (ledger.receiptIds.includes(receiptId)) {
    if (claim.lifecycleStatus!=="ACTIVE" && claim.lifecycleStatus!=="FULFILLED") throw new Error("TERMINAL_OCCURRENCE_CANNOT_REOPEN");
    if (ledger.receiptEffectFingerprints?.[receiptId]!==effectFingerprint) throw new Error("FULFILLMENT_RECEIPT_EFFECT_PAYLOAD_MISMATCH");
    return {applied:false,claim:fulfilled,ledger,receiptId};
  }
  if (claim.lifecycleStatus!=="ACTIVE") throw new Error("ONLY_ACTIVE_OCCURRENCE_CAN_BE_FULFILLED");
  if (!["FUNDED","OVERFUNDED","NOT_APPLICABLE"].includes(claim.fundingStatus)) throw new Error("CLAIM_FUNDING_NOT_COMPLETE");
  if (claim.fulfillmentEffects.some((effect)=>effect.code!=="NO_BALANCE_SHEET_EFFECT")) {
    if (!funding.resource) throw new Error("COMPATIBLE_FUNDING_RESOURCE_REQUIRED");
    const compatibility=validateResourceClaimCompatibility(funding.resource,claim,funding.asOf);
    if (!compatibility.valid) throw new Error(compatibility.codes.join(","));
    const source=funding.sourceAssignmentId?ledger.assignments[funding.sourceAssignmentId]:undefined;
    if (!source || source.assetId!==funding.resource.underlyingAssetId) throw new Error("FUNDING_RESOURCE_ASSIGNMENT_ASSET_MISMATCH");
    if (source.purpose!==funding.resource.purpose || funding.resource.partitionAssignmentIds!==undefined && !funding.resource.partitionAssignmentIds.includes(funding.sourceAssignmentId!)) throw new Error("FUNDING_RESOURCE_ASSIGNMENT_PARTITION_MISMATCH");
    if (claim.fundedAmount.status!=="KNOWN" || funding.resource.amount.status!=="KNOWN" || funding.resource.amount.data.value<claim.fundedAmount.data.value) throw new Error("FUNDING_EXCEEDS_RESOURCE");
    const share=funding.resource.ownership==="JOINT"?funding.resource.jointOwnership!.ownedFraction:1;
    if (funding.resource.amount.data.value>decimalProduct(ledger.assets[source.assetId],share)) throw new Error("RESOURCE_EXCEEDS_CURRENT_ECONOMIC_ASSET");
  }
  const next:FulfillmentLedger={assets:{...ledger.assets},liabilities:{...ledger.liabilities},assignments:Object.fromEntries(Object.entries(ledger.assignments).map(([id,assignment])=>[id,{...assignment}])),receiptIds:[...ledger.receiptIds,receiptId],receiptEffectFingerprints:{...ledger.receiptEffectFingerprints,[receiptId]:effectFingerprint}};
  for (const effect of claim.fulfillmentEffects) {
    if (effect.code==="NO_BALANCE_SHEET_EFFECT") continue;
    const tagged=effect.amountSource==="DEBT_PRINCIPAL"?claim.debtPayment?.principal:effect.amountSource==="CLAIM_AMOUNT"?claim.amount:claim.fundedAmount;
    if (!tagged || tagged.status!=="KNOWN") throw new Error("UNKNOWN_EFFECT_AMOUNT_CANNOT_BE_APPLIED");
    const appliedAmount=amount(tagged.data.value);
    if (effect.code==="REDUCE_CASH") {
      const assetId=funding.cashAssetId;
      const assignment=funding.sourceAssignmentId?next.assignments[funding.sourceAssignmentId]:undefined;
      if (!assetId || !Object.hasOwn(next.assets,assetId) || !assignment || assignment.assetId!==assetId) throw new Error("CASH_FUNDING_ASSIGNMENT_REQUIRED");
      if (next.assets[assetId]<appliedAmount || assignment.amount<appliedAmount) throw new Error("INSUFFICIENT_CASH_FUNDING");
      next.assets[assetId]=decimalSum([next.assets[assetId],-appliedAmount]);
      assignment.amount=decimalSum([assignment.amount,-appliedAmount]);
    } else if (effect.code==="REDUCE_DEBT_BALANCE") {
      if (!effect.targetId || !Object.hasOwn(next.liabilities,effect.targetId)) throw new Error("LIABILITY_TARGET_NOT_FOUND");
      if (next.liabilities[effect.targetId]<appliedAmount) throw new Error("PRINCIPAL_EXCEEDS_DEBT_BALANCE");
      next.liabilities[effect.targetId]=decimalSum([next.liabilities[effect.targetId],-appliedAmount]);
    } else {
      const source=funding.sourceAssignmentId?next.assignments[funding.sourceAssignmentId]:undefined;
      const target=effect.targetId?next.assignments[effect.targetId]:undefined;
      if (!source || !target || funding.sourceAssignmentId===effect.targetId || source.assetId!==target.assetId) throw new Error("SAME_ASSET_ASSIGNMENT_TRANSFER_REQUIRED");
      const purpose=effect.code==="INCREASE_SAFETY_CAPITAL"?"SAFETY":"GOAL";
      if (target.purpose!==purpose) throw new Error("CAPITAL_TARGET_PURPOSE_MISMATCH");
      if (source.amount<appliedAmount) throw new Error("INSUFFICIENT_ASSIGNMENT_FUNDING");
      source.amount=decimalSum([source.amount,-appliedAmount]);
      target.amount=decimalSum([target.amount,appliedAmount]);
    }
  }
  validateFulfillmentLedger(next);
  return {applied:true,claim:fulfilled,ledger:next,receiptId};
}

/** Cancellation/expiry retain history and explicitly release reservations; neither pays a claim. */
export function terminateClaim(claim:FinancialClaim,status:"EXPIRED"|"CANCELLED") {
  if (!["EXPIRED","CANCELLED"].includes(status)) throw new Error("TERMINATION_REQUIRES_EXPIRED_OR_CANCELLED");
  if (!validateClaimLifecycle(claim).valid) throw new Error("INVALID_CLAIM_CANNOT_BE_TERMINATED");
  if (claim.lifecycleStatus!=="ACTIVE" && claim.lifecycleStatus!=="CREATED") throw new Error("TERMINAL_OCCURRENCE_CANNOT_REOPEN_OR_TERMINATE_AGAIN");
  const next={...claim,lifecycleStatus:status};
  const validation=validateClaimLifecycle(next);
  if (!validation.valid) throw new Error(validation.codes.join(","));
  return {claim:next,releasedReservationClaimIds:[claim.id],effectsApplied:false as const};
}
