import type { Asset, CapitalAssignment, FinancialResource } from "../schemas/index.ts";
export interface ResourceValidationResult { valid:boolean; codes:string[] }
export function validateResourceLineage(assets:Asset[],resources:FinancialResource[],assignments:CapitalAssignment[]):ResourceValidationResult {
  const codes:string[]=[];
  for (const resource of resources) {
    if (resource.type==="FUTURE_INCOME"&&resource.certainty==="HIGH") codes.push("FUTURE_INCOME_CERTAINTY_TOO_HIGH");
    if (resource.type==="EXTERNAL_SUPPORT"&&resource.ownership!=="EXTERNAL") codes.push("EXTERNAL_SUPPORT_NOT_OWNED_CAPITAL");
    if (resource.availability!=="AVAILABLE"&&resource.reservedForClaimIds.length===0&&resource.availability==="RESERVED") codes.push("RESERVED_RESOURCE_WITHOUT_CLAIM");
  }
  for (const asset of assets) {
    const amount=asset.currentValue.value;
    const resourceTotal=resources.filter((item)=>item.underlyingAssetId===asset.id&&item.amount.status==="KNOWN").reduce((sum,item)=>sum+(item.amount.status==="KNOWN"?item.amount.data.value:0),0);
    const assignmentTotal=assignments.filter((item)=>item.assetId===asset.id&&item.amount.status==="KNOWN").reduce((sum,item)=>sum+(item.amount.status==="KNOWN"?item.amount.data.value:0),0);
    if (resourceTotal>amount) codes.push("UNDERLYING_ASSET_RESOURCE_OVERALLOCATION");
    if (assignmentTotal>amount) codes.push("CAPITAL_ASSIGNMENT_OVERALLOCATION");
  }
  return {valid:codes.length===0,codes:[...new Set(codes)]};
}
export function isFreeOwnedCash(resource:FinancialResource):boolean { return resource.type==="CURRENT_CASH"&&resource.ownership==="SOLE"&&resource.availability==="AVAILABLE"&&resource.liquidity==="IMMEDIATE"&&resource.amount.status==="KNOWN"; }
