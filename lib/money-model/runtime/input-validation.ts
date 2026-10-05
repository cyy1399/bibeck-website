import type { FinancialProfile } from "../contracts/index.ts";
import { readInput, validInputDate } from "./input-value.ts";
import type { NormalizationOptions } from "./profile-normalizer.ts";

const record=(v:unknown):v is Record<string,unknown>=>v!==null && typeof v==="object" && !Array.isArray(v);
const text=(v:unknown)=>typeof v==="string" && v.trim().length>0;
const oneOf=(v:unknown,values:readonly unknown[])=>values.includes(v);

/** Bound plain input, not a UI parser. Unknown values remain tagged, never filled in. */
function boundedPlain(value:unknown):boolean {
  const seen=new Set<object>(); let nodes=0;
  const visit=(v:unknown,depth:number):boolean=>{
    if (++nodes>50000 || depth>64) return false;
    if (v===null || v===undefined || typeof v==="string" || typeof v==="boolean") return true;
    if (typeof v==="number") return Number.isFinite(v);
    if (typeof v!=="object" || seen.has(v)) return false;
    if (!Array.isArray(v) && Object.getPrototypeOf(v)!==Object.prototype && Object.getPrototypeOf(v)!==null) return false;
    if (Array.isArray(v) && (Object.getPrototypeOf(v)!==Array.prototype || Object.keys(v).length!==v.length || Object.keys(v).some(key=>!Number.isInteger(Number(key)) || String(Number(key))!==key || Number(key)<0 || Number(key)>=v.length))) return false;
    const descriptors=Object.getOwnPropertyDescriptors(v);
    if (Object.values(descriptors).some(d=>d.get || d.set) || Object.getOwnPropertySymbols(v).length) return false;
    seen.add(v);
    const valid=Object.values(descriptors).every(d=>visit(d.value,depth+1));
    seen.delete(v); return valid;
  };
  return visit(value,0);
}

/** Format checks only. Fiscal thresholds and incomplete-information behavior stay frozen. */
export function validateAnalysisInput(profile:FinancialProfile,options:NormalizationOptions):string[] {
  if (!boundedPlain(profile) || !boundedPlain(options)) return ["INPUT_NOT_BOUNDED_PLAIN_DATA"];
  const p:unknown=profile,o:unknown=options;
  if (!record(p) || !record(o)) return ["INVALID_ANALYSIS_INPUT_SHAPE"];
  const codes:string[]=[];
  const add=(code:string)=>{ if (!codes.includes(code)) codes.push(code); };
  const numberInput=(v:unknown,path:string,signed=false)=>{
    if (v===undefined) return; // Missing financial information belongs to UNKNOWN.
    const input=readInput(v as Parameters<typeof readInput>[0]);
    if (input.status==="UNKNOWN" && input.reasonCode.startsWith("INVALID_") && input!==v) add("INVALID_FINANCIAL_INPUT:"+path);
    if (input.status==="KNOWN" && (typeof input.data.value!=="number" || !Number.isFinite(input.data.value) || !signed && input.data.value<0)) add("INVALID_FINANCIAL_VALUE:"+path);
  };
  const inventory=(v:unknown,path:string):Record<string,unknown>[]=>{
    if (!Array.isArray(v) || v.some(item=>!record(item) || !text(item.id))) {add("INVALID_INVENTORY:"+path);return [];}
    return v as Record<string,unknown>[];
  };
  const closed=(v:Record<string,unknown>,keys:string[])=>Object.keys(v).every(key=>keys.includes(key));
  if (!closed(p,["profile","income","expenses","assets","liabilities","obligations","goals","household","reportedMonthlySavings"]) || !closed(o,["snapshotId","asOf","monthlyPeriodId","primaryCurrencyConfirmed","netMonthlyBasisConfirmed","stockAsOfConfirmed","approvedMonthlyIncomeIds","complete","resources","assignments","claims","claimOrigins"])) add("UNSUPPORTED_INPUT_FIELD");
  if (o.claimOrigins!==undefined) {
    const ids=new Set<string>();
    if (!Array.isArray(o.claimOrigins)) add("INVALID_CLAIM_ORIGINS");
    else for (const origin of o.claimOrigins) {
      if (!record(origin) || !closed(origin,["claimId","sourceCollection","sourceId"]) || !text(origin.claimId) || !text(origin.sourceId) || !oneOf(origin.sourceCollection,["expenses","liabilities","obligations","goals"]) || ids.has(origin.claimId as string)) { add("INVALID_CLAIM_ORIGINS"); continue; }
      ids.add(origin.claimId as string);
      if (origin.sourceCollection!=="expenses" && (!Array.isArray(p[origin.sourceCollection as string]) || !(p[origin.sourceCollection as string] as unknown[]).some(item=>record(item) && item.id===origin.sourceId))) add("INVALID_CLAIM_ORIGINS");
    }
  }
  if (!record(p.profile) || !text(p.profile.primaryCurrency) || !text(p.profile.country)) add("INVALID_PROFILE_IDENTITY");
  if (!text(o.snapshotId) || !text(o.monthlyPeriodId) || !validInputDate(o.asOf)) add("INVALID_OBSERVATION_BASIS");
  for (const field of ["primaryCurrencyConfirmed","netMonthlyBasisConfirmed","stockAsOfConfirmed"]) if (typeof o[field]!=="boolean") add("INVALID_BASIS_ATTESTATION:"+field);
  if (!Array.isArray(o.approvedMonthlyIncomeIds) || o.approvedMonthlyIncomeIds.some(id=>!text(id)) || new Set(o.approvedMonthlyIncomeIds).size!==o.approvedMonthlyIncomeIds.length) add("INVALID_MONTHLY_INCOME_ATTESTATIONS");
  const completeKeys=["income","expenses","assets","liabilities","obligations","goals","resources","assignments","claims"];
  if (!record(o.complete) || !closed(o.complete,completeKeys) || Object.values(o.complete).some(v=>typeof v!=="boolean")) add("INVALID_COMPLETENESS_ATTESTATIONS");
  for (const item of inventory(p.income,"income")) {
    if (!oneOf(item.type,["SALARY","BUSINESS","FREELANCE","COMMISSION","INVESTMENT","RENTAL","OTHER"]) || !oneOf(item.stability,["HIGH","MEDIUM","LOW","UNKNOWN"])) add("INVALID_INCOME_CLASSIFICATION");
    numberInput(item.averageMonthlyNetIncome,"income."+item.id);
  }
  if (!record(p.expenses)) add("INVALID_EXPENSE_SHAPE");
  else {
    for (const field of ["necessaryMonthly","discretionaryMonthly","otherMonthlyRequired"]) numberInput(p.expenses[field],"expenses."+field);
    if (p.expenses.aggregatesExcludeDebtAndObligations!==undefined && typeof p.expenses.aggregatesExcludeDebtAndObligations!=="boolean") add("INVALID_EXPENSE_BASIS");
    if (p.expenses.components!==undefined) for (const item of inventory(p.expenses.components,"expenseComponents")) {
      if (!text(item.economicPaymentId) || !oneOf(item.category,["NECESSARY","DISCRETIONARY","OTHER_REQUIRED"]) || !oneOf(item.timeBasis,["MONTHLY","ONE_TIME","UNNORMALIZED"])) add("INVALID_EXPENSE_COMPONENT");
      numberInput(item.amount,"expenseComponents."+item.id);
    }
  }
  for (const item of inventory(p.assets,"assets")) {
    if (!oneOf(item.type,["CASH","DEPOSIT","STOCKS","FUNDS","BONDS","CRYPTO","REAL_ESTATE","BUSINESS","OTHER"]) || !oneOf(item.liquidity,["IMMEDIATE","SHORT","LIMITED","ILLIQUID"]) || !oneOf(item.purpose,["OPERATING","SAFETY","GOAL","LONG_TERM","BUSINESS","EXPERIMENTAL","UNASSIGNED"]) || item.ownership!==undefined && !oneOf(item.ownership,["SOLE","JOINT","EXTERNAL","UNKNOWN"])) add("INVALID_ASSET_CLASSIFICATION");
    numberInput(item.currentValue,"assets."+item.id); numberInput(item.availableEconomicValue,"assets."+item.id+".availableEconomicValue");
  }
  for (const item of inventory(p.liabilities,"liabilities")) {
    if (!oneOf(item.type,["CREDIT_CARD","PERSONAL_LOAN","MORTGAGE","AUTO_LOAN","STUDENT_LOAN","FAMILY_LOAN","OTHER"]) || !oneOf(item.delinquencyStatus,["CURRENT","AT_RISK","DELINQUENT","DEFAULT","UNKNOWN"]) || typeof item.secured!=="boolean") add("INVALID_LIABILITY_CLASSIFICATION");
    if (item.economicPaymentId!==undefined && !text(item.economicPaymentId)) add("INVALID_LIABILITY_PAYMENT_IDENTITY");
    if (item.variableRate!==undefined && typeof item.variableRate!=="boolean" || item.prepaymentPenaltyType!==undefined && !oneOf(item.prepaymentPenaltyType,["FIXED","PERCENTAGE","UNKNOWN"])) add("INVALID_LIABILITY_TERMS");
    for (const field of ["balance","apr","nominalRate","promotionalRate","minimumMonthlyPayment","remainingTermMonths","prepaymentPenalty"]) numberInput(item[field],"liabilities."+item.id+"."+field);
    if (item.costClassification!==undefined) {
      const v=readInput(item.costClassification as Parameters<typeof readInput>[0]);
      if (v.status==="KNOWN" && !oneOf(v.data.value,["HIGH_COST","OTHER_COST"]) || v.status==="UNKNOWN" && v.reasonCode.startsWith("INVALID_") && v!==item.costClassification) add("INVALID_DEBT_COST_CLASSIFICATION");
    }
    if (item.promotionalRateEndDate!==undefined && !validInputDate(item.promotionalRateEndDate)) add("INVALID_LIABILITY_DATE");
  }
  for (const item of inventory(p.obligations,"obligations")) {
    if (!text(item.name) || typeof item.required!=="boolean" || item.recurrence!==undefined && !oneOf(item.recurrence,["NONE","MONTHLY","UNNORMALIZED"]) || item.economicPaymentId!==undefined && !text(item.economicPaymentId)) add("INVALID_OBLIGATION_STRUCTURE");
    if (item.dueDate!==undefined && !validInputDate(item.dueDate)) add("INVALID_OBLIGATION_DATE");
    numberInput(item.amount,"obligations."+item.id); numberInput(item.reservedAmount,"obligations."+item.id+".reservedAmount");
  }
  for (const item of inventory(p.goals,"goals")) {
    if (!text(item.name) || !oneOf(item.priority,["HIGH","MEDIUM","LOW"]) || typeof item.required!=="boolean" || item.status!==undefined && !oneOf(item.status,["ACTIVE","PAUSED","ABANDONED","COMPLETED"])) add("INVALID_GOAL_STRUCTURE");
    if (item.targetDate!==undefined && !validInputDate(item.targetDate)) add("INVALID_GOAL_DATE");
    numberInput(item.targetAmount,"goals."+item.id); numberInput(item.currentFunding,"goals."+item.id+".currentFunding");
  }
  if (!record(p.household)) add("INVALID_HOUSEHOLD_SHAPE");
  else {
    numberInput(p.household.dependents,"household.dependents");
    if (p.household.externalSupportAvailable!==undefined) {
      const v=readInput(p.household.externalSupportAvailable as Parameters<typeof readInput>[0]);
      if (v.status==="KNOWN" && typeof v.data.value!=="boolean" || v.status==="UNKNOWN" && v.reasonCode.startsWith("INVALID_") && v!==p.household.externalSupportAvailable) add("INVALID_SUPPORT_INPUT");
    }
  }
  numberInput(p.reportedMonthlySavings,"reportedMonthlySavings",true);
  for (const field of ["resources","assignments","claims"]) if (o[field]!==undefined) for (const item of inventory(o[field],field)) {
    numberInput(item.amount,field+"."+item.id+".amount");
    if (field==="claims") {
      numberInput(item.fundedAmount,"claims."+item.id+".fundedAmount");
      if (typeof item.required!=="boolean" || !oneOf(item.userPriority,["HIGH","MEDIUM","LOW"]) || !oneOf(item.urgency,["IMMEDIATE","NEAR_TERM","LATER"]) || !oneOf(item.severity,["CRITICAL","HIGH","MEDIUM","LOW"]) || !oneOf(item.reversibility,["LOW","MEDIUM","HIGH"]) || !oneOf(item.stageImpact,["SURVIVAL","STABILITY","CONTROL","ACCUMULATION","GROWTH","OPTIONALITY"]) || !record(item.origin) || !oneOf(item.origin.type,["USER_INPUT","OBLIGATION","DERIVED_MODEL","GOAL","DEBT","SYSTEM_RULE"])) add("INVALID_CLAIM_STRUCTURE");
    }
    if (field==="resources" && item.availableFrom!==undefined) {
      const v=readInput(item.availableFrom as Parameters<typeof readInput>[0]);
      if (v.status==="KNOWN" && !validInputDate(v.data.value) || v.status==="UNKNOWN" && v.reasonCode.startsWith("INVALID_") && v!==item.availableFrom) add("INVALID_RESOURCE_DATE");
    }
  }
  return codes;
}
