import type { FinancialClaim } from "../schemas/index.ts";

export interface ClaimValidationResult { valid:boolean; codes:string[] }

export function validateClaimLifecycle(claim:FinancialClaim):ClaimValidationResult {
  const codes:string[]=[];
  if (claim.lifecycleStatus==="CREATED"&&claim.fundingStatus!=="UNFUNDED") codes.push("CREATED_CLAIM_MUST_BE_UNFUNDED");
  if (claim.lifecycleStatus==="FULFILLED"&&!["FUNDED","OVERFUNDED","NOT_APPLICABLE"].includes(claim.fundingStatus)) codes.push("FULFILLED_CLAIM_MUST_BE_FUNDED_OR_NOT_APPLICABLE");
  if ((claim.lifecycleStatus==="EXPIRED"||claim.lifecycleStatus==="CANCELLED")&&claim.fundingStatus==="OVERFUNDED") codes.push("INACTIVE_TERMINAL_CLAIM_CANNOT_BE_OVERFUNDED");
  if (claim.recurrence==="CUSTOM"&&!claim.customRecurrence) codes.push("CUSTOM_RECURRENCE_REQUIRES_INTERVAL");
  if (claim.recurrence!=="CUSTOM"&&claim.customRecurrence) codes.push("NON_CUSTOM_RECURRENCE_CANNOT_HAVE_INTERVAL");
  return {valid:codes.length===0,codes};
}
