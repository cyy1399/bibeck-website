import type { FinancialClaim, FundingStatus } from "../schemas/financial-claim.schema.ts";
import type { DomainValue } from "../schemas/domain-value.schema.ts";
import { decimalSum } from "./decimal-arithmetic.ts";

export interface ClaimValidationResult { valid:boolean; codes:string[] }
const debtTypes = new Set(["DEBT_MINIMUM","DELINQUENT_DEBT","DEBT_ACCELERATION"]);
const claimTypes = new Set(["NECESSARY_LIVING","DEBT_MINIMUM","DELINQUENT_DEBT","IMMEDIATE_OBLIGATION","SAFETY_BUFFER","DEBT_ACCELERATION","GOAL_FUNDING","HUMAN_CAPITAL","BUSINESS_CAPITAL","LONG_TERM_GROWTH","EXPERIMENTAL","TRADING_COST_OPTIMIZATION"]);
const finiteAmount = (value:unknown):value is number => typeof value==="number" && Number.isFinite(value) && value>=0;
const nonempty = (value:unknown):value is string => typeof value==="string" && value.trim().length>0;
const record = (value:unknown):value is Record<string,unknown> => !!value && typeof value==="object" && !Array.isArray(value);
const sourceValid = (value:unknown):boolean => typeof value==="string" && ["USER_REPORTED","CALCULATED","VERIFIED","IMPORTED"].includes(value);
const dateValid = (value:unknown):value is string => {
  if (typeof value!=="string" || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/u.test(value)) return false;
  const parsed=Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0,10)===value.slice(0,10);
};
const pointValid = (value:unknown):boolean => record(value) && sourceValid(value.source) && dateValid(value.updatedAt);
const moneyValid = (value:DomainValue<number>):boolean => {
  if (!record(value)) return false;
  if (value.status==="KNOWN") return pointValid(value.data) && finiteAmount(value.data?.value);
  return (value.status==="UNKNOWN" || value.status==="NOT_APPLICABLE") && nonempty(value.reasonCode);
};
const taggedDateValid = (value:unknown):boolean => record(value) && (value.status==="KNOWN"
  ? pointValid(value.data) && record(value.data) && dateValid(value.data.value)
  : (value.status==="UNKNOWN" || value.status==="NOT_APPLICABLE") && nonempty(value.reasonCode));

/** Target unknown is not zero, and unknown target never produces a normal funding percentage. */
export function deriveFundingStatus(claim:Pick<FinancialClaim,"amount"|"fundedAmount"|"overfundingSupport">):FundingStatus {
  if (!moneyValid(claim.amount)||!moneyValid(claim.fundedAmount)) return "UNKNOWN";
  if (claim.amount.status==="NOT_APPLICABLE" && claim.fundedAmount.status==="NOT_APPLICABLE") return "NOT_APPLICABLE";
  if (claim.amount.status!=="KNOWN" || claim.fundedAmount.status!=="KNOWN") return "UNKNOWN";
  const target=claim.amount.data.value;
  const funded=claim.fundedAmount.data.value;
  if (funded>target) return "OVERFUNDED";
  if (funded===target) return "FUNDED";
  return funded===0 ? "UNFUNDED" : "PARTIALLY_FUNDED";
}

export function validateClaimLifecycle(claim:FinancialClaim):ClaimValidationResult {
  const codes:string[]=[];
  const add=(code:string)=>{if (!codes.includes(code)) codes.push(code);};
  if (!record(claim)) return {valid:false,codes:["INVALID_CLAIM"]};
  if (!nonempty(claim.id)) add("CLAIM_ID_REQUIRED");
  if (!sourceValid(claim.source) || !nonempty(claim.modelVersion) || !["HIGH","MEDIUM","LOW","EXPERIMENTAL"].includes(claim.certainty)) add("INVALID_CLAIM_QUALITY_METADATA");
  if (!taggedDateValid(claim.dueDate)) add("INVALID_CLAIM_DUE_DATE");
  if (!claimTypes.has(claim.claimType) || !["HARD","PROTECTIVE","CHOSEN","OPTIMIZATION"].includes(claim.category)) add("INVALID_CLAIM_CLASSIFICATION");
  if (!Array.isArray(claim.eligibleResources) || !claim.eligibleResources.every(nonempty) || new Set(claim.eligibleResources).size!==claim.eligibleResources.length) add("INVALID_CLAIM_ELIGIBLE_RESOURCES");
  if (!["CREATED","ACTIVE","FULFILLED","EXPIRED","CANCELLED"].includes(claim.lifecycleStatus)) add("INVALID_CLAIM_LIFECYCLE");
  if (!moneyValid(claim.amount)) add("INVALID_CLAIM_AMOUNT");
  if (!moneyValid(claim.fundedAmount)) add("INVALID_FUNDED_AMOUNT");
  if (!moneyValid(claim.amount) || !moneyValid(claim.fundedAmount)) return {valid:false,codes};
  if (moneyValid(claim.amount) && moneyValid(claim.fundedAmount)) {
    const expected=deriveFundingStatus(claim);
    if (expected!==claim.fundingStatus) add("FUNDING_STATUS_AMOUNT_MISMATCH");
    if (expected==="OVERFUNDED" && (!claim.overfundingSupport || !nonempty(claim.overfundingSupport.reasonCode) || claim.category==="HARD" || debtTypes.has(claim.claimType))) add("OVERFUNDING_NOT_SUPPORTED");
    if ((claim.amount.status==="NOT_APPLICABLE")!==(claim.fundedAmount.status==="NOT_APPLICABLE")) add("INCONSISTENT_NOT_APPLICABLE_FUNDING");
  }
  if (claim.lifecycleStatus==="CREATED" && !["UNFUNDED","UNKNOWN"].includes(claim.fundingStatus)) add("CREATED_CLAIM_MUST_BE_UNFUNDED");
  if (claim.lifecycleStatus==="FULFILLED"&&! ["FUNDED","OVERFUNDED","NOT_APPLICABLE"].includes(claim.fundingStatus)) add("FULFILLED_CLAIM_MUST_BE_FUNDED_OR_NOT_APPLICABLE");
  if ((claim.lifecycleStatus==="EXPIRED"||claim.lifecycleStatus==="CANCELLED")&&claim.fundingStatus==="OVERFUNDED") add("INACTIVE_TERMINAL_CLAIM_CANNOT_BE_OVERFUNDED");
  if (!["NONE","MONTHLY","QUARTERLY","ANNUAL","CUSTOM"].includes(claim.recurrence)) add("INVALID_CLAIM_RECURRENCE");
  if (claim.recurrence==="CUSTOM"&&!claim.customRecurrence) add("CUSTOM_RECURRENCE_REQUIRES_INTERVAL");
  if (claim.recurrence!=="CUSTOM"&&claim.customRecurrence) add("NON_CUSTOM_RECURRENCE_CANNOT_HAVE_INTERVAL");
  const customValid=claim.customRecurrence && Number.isSafeInteger(claim.customRecurrence.interval) && claim.customRecurrence.interval>0 && ["DAY","WEEK","MONTH"].includes(claim.customRecurrence.unit);
  if (claim.customRecurrence && !customValid) add("CUSTOM_RECURRENCE_INTERVAL_MUST_BE_POSITIVE_INTEGER");
  if (claim.recurrence!=="NONE" && (claim.recurrence!=="CUSTOM" || customValid) && (!claim.occurrence || !nonempty(claim.occurrence.templateId)||!nonempty(claim.occurrence.occurrenceKey)||claim.occurrence.templateId===claim.id)) add("RECURRING_CLAIM_REQUIRES_DISTINCT_OCCURRENCE_IDENTITY");
  if (claim.recurrence==="NONE" && claim.occurrence!==undefined) add("NONRECURRING_CLAIM_CANNOT_USE_TEMPLATE_OCCURRENCE");
  if (!Array.isArray(claim.fulfillmentEffects) || claim.fulfillmentEffects.length===0) add("FULFILLMENT_EFFECTS_REQUIRED");
  const rawEffects=Array.isArray(claim.fulfillmentEffects)?claim.fulfillmentEffects:[];
  const effects=rawEffects.filter((effect)=>effect && typeof effect==="object" && !Array.isArray(effect));
  if (effects.length!==rawEffects.length) add("INVALID_FULFILLMENT_EFFECT");
  const effectCodes=effects.map((effect)=>effect?.code);
  if (new Set(effectCodes).size!==effectCodes.length) add("DUPLICATE_FULFILLMENT_EFFECT");
  for (const effect of effects) {
    if (!effect || !["REDUCE_CASH","REDUCE_DEBT_BALANCE","INCREASE_SAFETY_CAPITAL","FUND_GOAL","NO_BALANCE_SHEET_EFFECT"].includes(effect.code)) {add("INVALID_FULFILLMENT_EFFECT");continue;}
    if (!["FUNDED_AMOUNT","CLAIM_AMOUNT","DEBT_PRINCIPAL"].includes(effect.amountSource)) add("INVALID_EFFECT_AMOUNT_SOURCE");
    if (Object.keys(effect).some((key)=>!["code","targetId","amountSource","assignmentOnly"].includes(key))) add("FULFILLMENT_EFFECT_MUST_BE_CLOSED_DECLARATIVE_RECORD");
    if (effect.targetId!==undefined && !nonempty(effect.targetId)) add("INVALID_EFFECT_TARGET_ID");
    if (effect.assignmentOnly!==undefined && effect.assignmentOnly!==true) add("INVALID_ASSIGNMENT_EFFECT_SEMANTICS");
    if (effect.assignmentOnly===true && !["INCREASE_SAFETY_CAPITAL","FUND_GOAL"].includes(effect.code)) add("ASSIGNMENT_ONLY_FLAG_REQUIRES_CAPITAL_EFFECT");
    if (effect.code!=="REDUCE_DEBT_BALANCE" && effect.amountSource==="DEBT_PRINCIPAL") add("DEBT_PRINCIPAL_ONLY_FOR_DEBT_BALANCE");
  }
  if (debtTypes.has(claim.claimType)) {
    if (effects.length!==2 || !effectCodes.includes("REDUCE_CASH") || !effectCodes.includes("REDUCE_DEBT_BALANCE")) add("DEBT_FULFILLMENT_REQUIRES_CASH_AND_PRINCIPAL_EFFECTS");
    if (!claim.debtPayment || !nonempty(claim.debtPayment.liabilityId)) add("DEBT_PAYMENT_BREAKDOWN_REQUIRED");
    else {
      const parts=[claim.debtPayment.principal,claim.debtPayment.interest,claim.debtPayment.fees];
      if (parts.some((part)=>!moneyValid(part)||part.status==="NOT_APPLICABLE")) add("INVALID_DEBT_PAYMENT_BREAKDOWN");
      if (parts.every((part)=>part?.status==="KNOWN"&&moneyValid(part)) && claim.amount.status==="KNOWN" && decimalSum(parts.map(part=>part.status==="KNOWN"?part.data.value:0))!==claim.amount.data.value) add("DEBT_PAYMENT_COMPONENT_SUM_MISMATCH");
      if (claim.lifecycleStatus==="FULFILLED" && parts.some((part)=>part?.status!=="KNOWN")) add("UNKNOWN_DEBT_BREAKDOWN_CANNOT_CERTIFY_FULFILLMENT");
      if (effects.some((effect)=>effect.code==="REDUCE_DEBT_BALANCE" && (effect.amountSource!=="DEBT_PRINCIPAL" || effect.targetId!==claim.debtPayment?.liabilityId))) add("DEBT_BALANCE_EFFECT_MUST_REFERENCE_PRINCIPAL_AND_LIABILITY");
    }
    if (effects.some((effect)=>effect.code==="REDUCE_CASH"&&effect.amountSource!=="CLAIM_AMOUNT")) add("DEBT_CASH_EFFECT_MUST_REFERENCE_TOTAL_PAYMENT");
  } else if (claim.debtPayment || effectCodes.includes("REDUCE_DEBT_BALANCE")) add("NON_DEBT_CLAIM_CANNOT_REDUCE_DEBT");
  if (claim.claimType==="SAFETY_BUFFER" || claim.claimType==="GOAL_FUNDING") {
    const expected=claim.claimType==="SAFETY_BUFFER"?"INCREASE_SAFETY_CAPITAL":"FUND_GOAL";
    if (effects.length!==1 || effects[0]?.code!==expected || effects[0]?.assignmentOnly!==true || !nonempty(effects[0]?.targetId) || effects[0]?.amountSource!=="FUNDED_AMOUNT") add("CAPITAL_FUNDING_MUST_RECLASSIFY_EXISTING_ASSIGNMENT_ONLY");
  } else if (effectCodes.includes("INCREASE_SAFETY_CAPITAL")||effectCodes.includes("FUND_GOAL")) add("CAPITAL_EFFECT_INCOMPATIBLE_WITH_CLAIM_TYPE");
  if (["NECESSARY_LIVING","IMMEDIATE_OBLIGATION"].includes(claim.claimType) && (effects.length!==1 || effects[0]?.code!=="REDUCE_CASH")) add("EXPENSE_FULFILLMENT_REQUIRES_CASH_EFFECT");
  if (effectCodes.includes("NO_BALANCE_SHEET_EFFECT") && (effects.length!==1 || claim.category==="HARD" || claim.amount.status!=="NOT_APPLICABLE" || claim.fundedAmount.status!=="NOT_APPLICABLE")) add("NO_BALANCE_SHEET_EFFECT_REQUIRES_NON_MONETARY_CLAIM");
  return {valid:codes.length===0,codes};
}

export function validateClaims(claims:FinancialClaim[]):ClaimValidationResult {
  if (!Array.isArray(claims)) return {valid:false,codes:["CLAIM_INVENTORY_MUST_BE_ARRAY"]};
  const codes=claims.flatMap((claim)=>validateClaimLifecycle(claim).codes);
  const validRecords=claims.filter((claim)=>record(claim));
  if (new Set(validRecords.map((claim)=>claim.id)).size!==validRecords.length) codes.push("DUPLICATE_CLAIM_ID");
  const occurrences=validRecords.filter((claim)=>claim.occurrence).map((claim)=>JSON.stringify([claim.occurrence?.templateId,claim.occurrence?.occurrenceKey]));
  if (new Set(occurrences).size!==occurrences.length) codes.push("DUPLICATE_RECURRING_OCCURRENCE");
  return {valid:codes.length===0,codes:[...new Set(codes)]};
}
