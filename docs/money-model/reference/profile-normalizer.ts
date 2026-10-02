import { known, unknown, valueRefs, type CapitalAssignment, type DataSource, type DomainValue, type EvaluationMetadata, type FinancialClaim, type FinancialProfile, type FinancialResource, type InputState, type NormalizedDecisionContext, type Scalar, type ValueRef } from "../schemas/index.ts";
import { valueRefRegistry } from "../registries/value-refs.ts";
import { createContext } from "./context-builder.ts";
import { amountOf, readInput, validInputDate, type FinancialInput } from "./input-value.ts";
import { validateResourceLineage } from "./resource-validator.ts";
import { validateClaims } from "./claim-validator.ts";
import { decimalSum } from "./decimal-arithmetic.ts";

export interface NormalizationOptions {
  snapshotId:string;
  asOf:string;
  /** These are approved input-basis attestations, not inferred normalization/tax policies. */
  monthlyPeriodId:string;
  primaryCurrencyConfirmed:boolean;
  netMonthlyBasisConfirmed:boolean;
  stockAsOfConfirmed:boolean;
  approvedMonthlyIncomeIds:string[];
  complete:Partial<Record<"income"|"expenses"|"assets"|"liabilities"|"obligations"|"goals"|"resources"|"assignments"|"claims",boolean>>;
  resources?:FinancialResource[];
  assignments?:CapitalAssignment[];
  claims?:FinancialClaim[];
}
export interface NormalizationTrace {
  ref:ValueRef;
  modelId:string|null;
  inputPaths:string[];
  dependencyRefs:ValueRef[];
  inputSources:DataSource[];
  periodId:string;
  currency:string;
  reasonCodes:string[];
}
export interface NormalizationResult { context:NormalizedDecisionContext; traces:NormalizationTrace[]; metadata:EvaluationMetadata }
const millisecondsPerDay=86400000;
const validDate=validInputDate;
const unique=(values:string[]) => [...new Set(values)];

/** Deterministic bookkeeping only. Unsupported policy inputs remain explicitly UNKNOWN. */
export function normalizeProfile(profile:FinancialProfile,options:NormalizationOptions):NormalizationResult {
  if (!validDate(options.asOf) || !options.snapshotId || !options.monthlyPeriodId) throw new Error("NORMALIZATION_REQUIRES_SNAPSHOT_AND_PERIOD");
  const context=createContext();
  const traces:NormalizationTrace[]=[];
  const sourceByPath=new Map<string,DataSource>();
  const inputRecords:Record<string,InputState>={};
  const valueLineage:Partial<Record<ValueRef,string[]>>={};
  const snapshotInput=(input:DomainValue<Scalar>):InputState => input.status === "KNOWN"?{status:input.status,value:input.data.value,source:input.data.source,updatedAt:input.data.updatedAt}:{status:input.status,reasonCode:input.reasonCode};
  const attest=(path:string,value:Scalar|undefined):void => {
    const point=value === undefined?unknown<Scalar>("ATTESTATION_NOT_PROVIDED"):{status:"KNOWN" as const,data:{value,source:"USER_REPORTED" as const,updatedAt:options.asOf}};
    inputRecords[path]=snapshotInput(point);
    if (point.status === "KNOWN") sourceByPath.set(path,point.data.source);
  };
  attest("basis.primaryCurrencyConfirmed",options.primaryCurrencyConfirmed);
  attest("profile.primaryCurrency",profile.profile.primaryCurrency);
  attest("profile.country",profile.profile.country);
  attest("basis.netMonthlyBasisConfirmed",options.netMonthlyBasisConfirmed);
  attest("basis.stockAsOfConfirmed",options.stockAsOfConfirmed);
  attest("basis.monthlyPeriodId",options.monthlyPeriodId);
  for (const key of ["income","expenses","assets","liabilities","obligations","goals","resources","assignments","claims"] as const) attest(`completeness.${key}`,options.complete[key]);
  const normalizationAllowed=options.primaryCurrencyConfirmed && options.netMonthlyBasisConfirmed;
  const readAtSnapshot=<T>(input:FinancialInput<T>|undefined):DomainValue<T> => {
    const tagged=readInput(input);
    return tagged.status === "KNOWN" && Date.parse(tagged.data.updatedAt)>Date.parse(options.asOf)?unknown("INPUT_AFTER_EVALUATION_SNAPSHOT"):tagged;
  };
  const resolve=(input:FinancialInput<number>|undefined,path:string):number|null => {
    const tagged=readAtSnapshot(input);
    inputRecords[path]=snapshotInput(tagged);
    if (tagged.status === "KNOWN") sourceByPath.set(path,tagged.data.source);
    if (tagged.status !== "KNOWN" || !validDate(tagged.data.updatedAt) || Date.parse(tagged.data.updatedAt)>Date.parse(options.asOf)) return null;
    return amountOf(tagged);
  };
  // Snapshot consumed structured inputs as scalar leaves, including empty inventories.
  // This records provenance only; it is not a predicate language or a policy resolver.
  const capture=(path:string,input:unknown,paths:string[]):void => {
    if (Array.isArray(input)) {
      attest(`${path}.length`,input.length); paths.push(`${path}.length`);
      input.forEach((item,index)=>capture(`${path}.${index}`,item,paths));
    } else if (input!==null && typeof input === "object") {
      if ("status" in input || "value" in input && "source" in input && "updatedAt" in input) {
        const point=readAtSnapshot(input as FinancialInput<Scalar>);
        inputRecords[path]=snapshotInput(point);
        if (point.status === "KNOWN") sourceByPath.set(path,point.data.source);
        paths.push(path);
      } else {
        attest(`${path}.present`,true); paths.push(`${path}.present`);
        for (const [key,entry] of Object.entries(input)) capture(`${path}.${key}`,entry,paths);
      }
    } else {
      attest(path,typeof input === "string" || typeof input === "boolean" || typeof input === "number" && Number.isFinite(input)?input:undefined);
      paths.push(path);
    }
  };
  function emit(ref:ValueRef,value:number|boolean|null,reason:string,paths:string[]=[],dependencies:ValueRef[]=[]):void {
    const domain:DomainValue<Scalar>=value === null || typeof value === "number" && !Number.isFinite(value) ? unknown(reason) : known(value,options.asOf);
    context[ref]=domain;
    const lineage=unique([...paths,...dependencies.flatMap((dependency) => valueLineage[dependency]??[]),...(valueRefRegistry[ref].currency === "profile.primaryCurrency"?["profile.primaryCurrency"]:[])]);
    valueLineage[ref]=lineage;
    const inputSources=[...new Set(lineage.flatMap((path) => sourceByPath.has(path)?[sourceByPath.get(path)!]:[]))];
    const reasons=domain.status === "UNKNOWN"?[domain.reasonCode]:inputSources.includes("USER_REPORTED")?["USER_REPORTED_INPUT"]:[];
    traces.push({ref,modelId:valueRefRegistry[ref].producerModel,inputPaths:lineage,dependencyRefs:[...new Set(dependencies)],inputSources,periodId:valueRefRegistry[ref].timeBasis === "MONTHLY"?options.monthlyPeriodId:options.asOf,currency:valueRefRegistry[ref].currency === "profile.primaryCurrency"?profile.profile.primaryCurrency:"NOT_APPLICABLE",reasonCodes:reasons});
  }
  const configRef="config.minimumViableLiquidityMonths";
  const configInput=context[configRef];
  inputRecords["assumptions.AS-001.minimumViableLiquidityMonths"]=snapshotInput(configInput);
  if (configInput.status === "KNOWN") sourceByPath.set("assumptions.AS-001.minimumViableLiquidityMonths",configInput.data.source);
  emit(configRef,configInput.status === "KNOWN"?configInput.data.value as number:null,"LIQUIDITY_ASSUMPTION_NOT_PROVIDED",["assumptions.AS-001.minimumViableLiquidityMonths"]);
  const sum=(items:(number|null)[]):number|null => { const result=items.includes(null)?null:decimalSum(items as number[]); return result === null || !Number.isFinite(result)?null:result; };
  const value=(ref:ValueRef):number|null => context[ref].status === "KNOWN" && typeof context[ref].data.value === "number"?context[ref].data.value:null;
  const incomePaths=profile.income.map((item) => `income.${item.id}.averageMonthlyNetIncome`);
  capture("inventory.income",profile.income.map(({id})=>id),incomePaths);
  for (const item of profile.income) attest(`income.${item.id}.monthlyNormalizationApproved`,options.approvedMonthlyIncomeIds.includes(item.id));
  const uniqueIncomeIds=new Set(profile.income.map(({id}) => id)).size === profile.income.length;
  const incomeAmounts=profile.income.map((item,index) => { const amount=resolve(item.averageMonthlyNetIncome,incomePaths[index]); return options.approvedMonthlyIncomeIds.includes(item.id)?amount:null; });
  const nmi=normalizationAllowed && options.complete.income && uniqueIncomeIds?sum(incomeAmounts):null;
  emit("metrics.netMonthlyIncome",nmi,"INCOME_BASIS_OR_COMPLETENESS_UNKNOWN",[...incomePaths,...profile.income.map(({id}) => `income.${id}.monthlyNormalizationApproved`),"basis.primaryCurrencyConfirmed","basis.netMonthlyBasisConfirmed","basis.monthlyPeriodId","completeness.income"]);

  const payments=new Map<string,number>();
  const debtPayments=new Map<string,number>();
  const outflowPaths:string[]=[];
  const discretionaryPaths:string[]=[];
  const discretionaryPayments=new Set<string>();
  capture("inventory.liabilities",profile.liabilities.map(({id})=>id),outflowPaths);
  capture("inventory.obligations",profile.obligations.map(({id})=>id),outflowPaths);
  let outflowValid=normalizationAllowed && !!options.complete.expenses && !!options.complete.liabilities && !!options.complete.obligations;
  let debtValid=normalizationAllowed && !!options.complete.liabilities;
  let discretionary:number|null=null;
  function addPayment(id:string|undefined,amount:number|null,path:string,debt=false):void {
    outflowPaths.push(path);
    if (!id || amount === null) { outflowValid=false; if (debt) debtValid=false; return; }
    if (payments.has(id) && payments.get(id) !== amount) { outflowValid=false; if (debt) debtValid=false; return; }
    payments.set(id,amount);
    if (debt) debtPayments.set(id,amount);
  }
  if (profile.expenses.components !== undefined) {
    capture("inventory.expenseComponents",profile.expenses.components.map(({id})=>id),outflowPaths);
    const discretionaryParts:(number|null)[]=[];
    const componentIds=new Set<string>();
    for (const item of profile.expenses.components) {
      const path=`expenses.components.${item.id}.amount`;
      const amount=resolve(item.amount,path);
      attest(`expenses.components.${item.id}.economicPaymentId`,item.economicPaymentId);
      attest(`expenses.components.${item.id}.timeBasis`,item.timeBasis);
      attest(`expenses.components.${item.id}.category`,item.category);
      outflowPaths.push(`expenses.components.${item.id}.economicPaymentId`,`expenses.components.${item.id}.timeBasis`,`expenses.components.${item.id}.category`);
      if (componentIds.has(item.id)) outflowValid=false;
      componentIds.add(item.id);
      if (item.timeBasis !== "MONTHLY") { if (item.timeBasis === "UNNORMALIZED") { outflowValid=false; discretionaryParts.push(null); } continue; }
      if (item.category === "DISCRETIONARY") {
        discretionaryPaths.push(path,`expenses.components.${item.id}.economicPaymentId`,`expenses.components.${item.id}.timeBasis`,`expenses.components.${item.id}.category`);
        if (!item.economicPaymentId || discretionaryPayments.has(item.economicPaymentId)) { discretionaryParts.push(null); continue; }
        discretionaryPayments.add(item.economicPaymentId); discretionaryParts.push(amount);
      } else addPayment(item.economicPaymentId,amount,path);
    }
    discretionary=options.complete.expenses && normalizationAllowed?sum(discretionaryParts):null;
    // Explicit components replace, never supplement overlapping legacy aggregates.
  } else {
    attest("expenses.aggregatesExcludeDebtAndObligations",profile.expenses.aggregatesExcludeDebtAndObligations);
    outflowPaths.push("expenses.aggregatesExcludeDebtAndObligations");
    const hasOtherRecurringPayments=profile.liabilities.length>0 || profile.obligations.some((item) => item.required && item.recurrence === "MONTHLY");
    if (hasOtherRecurringPayments && profile.expenses.aggregatesExcludeDebtAndObligations !== true) outflowValid=false;
    addPayment("aggregate.necessary",resolve(profile.expenses.necessaryMonthly,"expenses.necessaryMonthly"),"expenses.necessaryMonthly");
    addPayment("aggregate.otherRequired",resolve(profile.expenses.otherMonthlyRequired,"expenses.otherMonthlyRequired"),"expenses.otherMonthlyRequired");
    discretionary=normalizationAllowed && options.complete.expenses?resolve(profile.expenses.discretionaryMonthly,"expenses.discretionaryMonthly"):null;
    discretionaryPaths.push("expenses.discretionaryMonthly");
  }
  const liabilityIds=new Set<string>();
  for (const liability of profile.liabilities) {
    attest(`liabilities.${liability.id}.economicPaymentId`,liability.economicPaymentId);
    outflowPaths.push(`liabilities.${liability.id}.economicPaymentId`);
    if (liabilityIds.has(liability.id)) { outflowValid=false; debtValid=false; }
    liabilityIds.add(liability.id);
    addPayment(liability.economicPaymentId,resolve(liability.minimumMonthlyPayment,`liabilities.${liability.id}.minimumMonthlyPayment`),`liabilities.${liability.id}.minimumMonthlyPayment`,true);
  }
  const obligationIds=new Set<string>();
  for (const obligation of profile.obligations) {
    attest(`obligations.${obligation.id}.economicPaymentId`,obligation.economicPaymentId);
    attest(`obligations.${obligation.id}.recurrence`,obligation.recurrence);
    attest(`obligations.${obligation.id}.required`,obligation.required);
    attest(`obligations.${obligation.id}.dueDate`,obligation.dueDate);
    resolve(obligation.amount,`obligations.${obligation.id}.amount`);
    resolve(obligation.reservedAmount,`obligations.${obligation.id}.reservedAmount`);
    outflowPaths.push(`obligations.${obligation.id}.economicPaymentId`,`obligations.${obligation.id}.recurrence`,`obligations.${obligation.id}.required`);
    if (obligationIds.has(obligation.id)) outflowValid=false;
    obligationIds.add(obligation.id);
    if (!obligation.required) continue;
    if (obligation.recurrence === "MONTHLY") addPayment(obligation.economicPaymentId,resolve(obligation.amount,`obligations.${obligation.id}.amount`),`obligations.${obligation.id}.amount`);
    else if (obligation.recurrence === undefined || obligation.recurrence === "UNNORMALIZED") outflowValid=false;
  }
  // Check after debt and obligation identities have joined the required-payment union.
  if ([...discretionaryPayments].some((id)=>payments.has(id))) { outflowValid=false; discretionary=null; }
  const cmo=outflowValid?sum([...payments.values()]):null;
  emit("metrics.coreMonthlyOutflow",cmo,"OUTFLOW_IDENTITY_PERIOD_OR_COMPLETENESS_UNKNOWN",[...outflowPaths,"basis.primaryCurrencyConfirmed","basis.netMonthlyBasisConfirmed","basis.monthlyPeriodId","completeness.expenses","completeness.liabilities","completeness.obligations"]);
  const ccf=nmi !== null && cmo !== null?sum([nmi,-cmo]):null;
  emit("metrics.coreCashFlow",ccf,"CORE_CASH_FLOW_DEPENDENCY_UNKNOWN",[],["metrics.netMonthlyIncome","metrics.coreMonthlyOutflow"]);
  emit("metrics.monthlySurplus",ccf !== null && discretionary !== null?decimalSum([ccf,-discretionary]):null,"SURPLUS_DEPENDENCY_UNKNOWN",[...discretionaryPaths,"completeness.expenses","basis.netMonthlyBasisConfirmed","basis.monthlyPeriodId"],["metrics.coreCashFlow"]);
  const monthlyDebtPaymentTotal=sum([...debtPayments.values()]);
  emit("metrics.debtServiceRatio",debtValid && monthlyDebtPaymentTotal !== null && nmi !== null && nmi>0?monthlyDebtPaymentTotal/nmi:null,"DEBT_SERVICE_UNKNOWN_OR_NONPOSITIVE_INCOME",[...outflowPaths.filter((path) => path.startsWith("liabilities.") || path.startsWith("inventory.liabilities")),"completeness.liabilities"],["metrics.netMonthlyIncome"]);
  emit("metrics.incomeConcentration",nmi !== null && nmi>0?Math.max(...incomeAmounts as number[])/nmi:null,"CONCENTRATION_UNKNOWN_OR_NONPOSITIVE_INCOME",incomePaths,["metrics.netMonthlyIncome"]);

  const assetPaths=profile.assets.map((asset) => `assets.${asset.id}.currentValue`);
  const assetBasisPaths:string[]=[];
  const assetIdentityPaths:string[]=[];
  capture("inventory.assets",profile.assets.map(({id})=>id),assetIdentityPaths);
  for (const asset of profile.assets) {
    for (const [key,entry] of Object.entries({type:asset.type,ownership:asset.ownership,liquidity:asset.liquidity,purpose:asset.purpose})) { const path=`assets.${asset.id}.${key}`; attest(path,entry); assetBasisPaths.push(path); }
    const availableValuePath=`assets.${asset.id}.availableEconomicValue`;
    resolve(asset.availableEconomicValue,availableValuePath);
    // Cash may use its current value directly; unsupported noncash realization retains the missing input.
    assetBasisPaths.push(availableValuePath);
  }
  const balancePaths=profile.liabilities.map((item) => `liabilities.${item.id}.balance`);
  const ownedValues=profile.assets.map((asset,index) => { const amount=resolve(asset.currentValue,assetPaths[index]); return asset.ownership === "EXTERNAL"?0:asset.ownership === "SOLE"?amount:null; });
  const balances=profile.liabilities.map((item,index) => resolve(item.balance,balancePaths[index]));
  const assetIdentityValid=new Set(profile.assets.map(({id}) => id)).size === profile.assets.length;
  const totalAssets=sum(ownedValues),totalDebt=sum(balances);
  const nw=options.primaryCurrencyConfirmed && options.stockAsOfConfirmed && options.complete.assets && options.complete.liabilities && assetIdentityValid && liabilityIds.size === profile.liabilities.length && totalAssets !== null && totalDebt !== null?sum([totalAssets,-totalDebt]):null;
  emit("metrics.netWorth",nw,"NET_WORTH_OWNERSHIP_SNAPSHOT_OR_VALUATION_UNKNOWN",[...assetPaths,...assetIdentityPaths,...balancePaths,...outflowPaths.filter((path)=>path.startsWith("inventory.liabilities")),...profile.assets.map(({id}) => `assets.${id}.ownership`),"basis.primaryCurrencyConfirmed","basis.stockAsOfConfirmed","completeness.assets","completeness.liabilities"]);

  const resources=(options.resources??[]).map((resource) => ({...resource,amount:readAtSnapshot(resource.amount),availableFrom:readAtSnapshot(resource.availableFrom)}));
  const assignments=(options.assignments??[]).map((assignment) => ({...assignment,amount:readAtSnapshot(assignment.amount)}));
  const resourcePaths:string[]=[];
  assetBasisPaths.push(...assetIdentityPaths);
  capture("inventory.income",profile.income.map(({id})=>id),resourcePaths);
  capture("inventory.resources",resources.map(({id})=>id),resourcePaths);
  capture("inventory.assignments",assignments.map(({id})=>id),resourcePaths);
  for (const resource of resources) {
    const prefix=`resources.${resource.id}`;
    for (const [key,entry] of Object.entries({type:resource.type,underlyingAssetId:resource.underlyingAssetId,underlyingIncomeId:resource.underlyingIncomeId,ownership:resource.ownership,availability:resource.availability,liquidity:resource.liquidity,valuationStatus:resource.valuationStatus,purpose:resource.purpose,source:resource.source,certainty:resource.certainty,reservedForClaimIds:resource.reservedForClaimIds,partitionAssignmentIds:resource.partitionAssignmentIds,restriction:resource.restriction,jointOwnership:resource.jointOwnership})) capture(`${prefix}.${key}`,entry,resourcePaths);
    inputRecords[`${prefix}.amount`]=snapshotInput(readInput(resource.amount));
    inputRecords[`${prefix}.availableFrom`]=snapshotInput(readInput(resource.availableFrom));
    if (resource.amount.status === "KNOWN") sourceByPath.set(`${prefix}.amount`,resource.amount.data.source);
    if (resource.availableFrom.status === "KNOWN") sourceByPath.set(`${prefix}.availableFrom`,resource.availableFrom.data.source);
    resourcePaths.push(`${prefix}.amount`,`${prefix}.availableFrom`);
  }
  for (const assignment of assignments) {
    const prefix=`assignments.${assignment.id}`;
    attest(`${prefix}.assetId`,assignment.assetId); attest(`${prefix}.claimId`,assignment.claimId); attest(`${prefix}.purpose`,assignment.purpose);
    inputRecords[`${prefix}.amount`]=snapshotInput(readInput(assignment.amount));
    if (assignment.amount.status === "KNOWN") sourceByPath.set(`${prefix}.amount`,assignment.amount.data.source);
    resourcePaths.push(`${prefix}.assetId`,`${prefix}.claimId`,`${prefix}.purpose`,`${prefix}.amount`);
  }
  const claims=options.claims??[];
  const claimPaths:string[]=[];
  capture("inventory.claims",claims.map(({id})=>id),claimPaths);
  capture("inventory.claimsProvided",options.claims!==undefined,claimPaths);
  for (const claim of claims) {
    for (const [key,entry] of Object.entries({claimType:claim.claimType,lifecycleStatus:claim.lifecycleStatus,category:claim.category,fundingStatus:claim.fundingStatus,source:claim.source,modelVersion:claim.modelVersion,certainty:claim.certainty,urgency:claim.urgency,eligibleResources:claim.eligibleResources,dueDate:claim.dueDate,recurrence:claim.recurrence,customRecurrence:claim.customRecurrence,occurrence:claim.occurrence,overfundingSupport:claim.overfundingSupport,debtPayment:claim.debtPayment,fulfillmentEffects:claim.fulfillmentEffects})) capture(`claims.${claim.id}.${key}`,entry,claimPaths);
    resolve(claim.amount,`claims.${claim.id}.amount`);
    resolve(claim.fundedAmount,`claims.${claim.id}.fundedAmount`);
    claimPaths.push(`claims.${claim.id}.amount`,`claims.${claim.id}.fundedAmount`);
  }
  resourcePaths.push(...claimPaths);
  const snapshotAssets=profile.assets.map((asset) => ({...asset,currentValue:readAtSnapshot(asset.currentValue),...(asset.availableEconomicValue === undefined?{}:{availableEconomicValue:readAtSnapshot(asset.availableEconomicValue)})}));
  const resourceValidation=validateResourceLineage(snapshotAssets,resources,assignments,{incomeIds:profile.income.map(({id}) => id),claims:options.claims,asOf:options.asOf});
  const unresolvedResourceCodes=new Set(["ASSET_VALUE_UNCALCULABLE","RESOURCE_AMOUNT_UNCALCULABLE","CAPITAL_ASSIGNMENT_AMOUNT_UNCALCULABLE","AVAILABLE_ECONOMIC_VALUE_UNCALCULABLE","JOINT_ASSET_ECONOMIC_SHARE_UNRESOLVED","RESOURCE_AVAILABILITY_DATE_UNRESOLVED","RESOURCE_AMOUNT_AGGREGATE_UNCALCULABLE","CAPITAL_ASSIGNMENT_AGGREGATE_UNCALCULABLE","RESOURCE_PARTITION_AMOUNT_UNCALCULABLE"]);
  const invalidEconomicValueIsUnknown=snapshotAssets.some((asset) => asset.availableEconomicValue !== undefined && (readInput(asset.availableEconomicValue).status !== "KNOWN" || readInput(asset.currentValue).status !== "KNOWN"));
  if (invalidEconomicValueIsUnknown) unresolvedResourceCodes.add("INVALID_AVAILABLE_ECONOMIC_VALUE");
  const actualResourceConflict=resourceValidation.codes.some((code) => !unresolvedResourceCodes.has(code));
  const capitalConflict=actualResourceConflict?true:options.complete.resources && options.complete.assignments && resourceValidation.valid?false:null;
  emit("flags.hasCapitalAssignmentConflict",capitalConflict,"CAPITAL_DISCOVERY_OR_VALUATION_UNKNOWN",[...resourcePaths,...assetPaths,...assetBasisPaths,"completeness.resources","completeness.assignments"]);
  const claimReservations=new Map<string,number>();
  let liquidValid=!!(options.primaryCurrencyConfirmed && options.stockAsOfConfirmed && options.complete.assets && options.complete.resources && options.complete.assignments && options.complete.obligations && resourceValidation.valid);
  const liquidAssetIds=new Set<string>();
  const excludedPartitionIds=new Set<string>();
  let liquidCapital=0,reservedTotal=0;
  for (const resource of resources) {
    if (["FUTURE_INCOME","EXTERNAL_SUPPORT","CREDIT_AVAILABILITY","MONTHLY_SURPLUS"].includes(resource.type)) continue;
    if (resource.ownership !== "SOLE") { if (resource.ownership !== "EXTERNAL") liquidValid=false; continue; }
    if (["LOCKED","RESTRICTED","UNSETTLED"].includes(resource.availability)) continue;
    if (resource.availability === "UNKNOWN" || resource.amount.status !== "KNOWN" || resource.valuationStatus === "UNKNOWN" || !resource.underlyingAssetId || resource.availableFrom.status !== "KNOWN" || !validDate(resource.availableFrom.data.value)) { liquidValid=false; continue; }
    if (Date.parse(resource.availableFrom.data.value)>Date.parse(options.asOf)) continue;
    if (resource.liquidity !== "IMMEDIATE") { liquidValid=false; continue; }
    // A supplied availableEconomicValue is a normalized realization input, never a guessed haircut.
    const underlying=snapshotAssets.find((item) => item.id === resource.underlyingAssetId);
    if (!underlying || !(underlying.type === "CASH" || underlying.type === "DEPOSIT") && underlying.availableEconomicValue?.status !== "KNOWN") { liquidValid=false; continue; }
    liquidCapital=decimalSum([liquidCapital,resource.amount.data.value]);
    liquidAssetIds.add(resource.underlyingAssetId);
    if (["GOAL","LONG_TERM","BUSINESS","EXPERIMENTAL"].includes(resource.purpose)) {
      reservedTotal=decimalSum([reservedTotal,resource.amount.data.value]);
      for (const id of resource.partitionAssignmentIds??[]) excludedPartitionIds.add(id);
      // A single dedicated resource without partition still corresponds to its same-purpose assignments.
      if (resources.filter((item) => item.underlyingAssetId === resource.underlyingAssetId).length === 1) for (const assignment of assignments.filter((item) => item.assetId === resource.underlyingAssetId && item.purpose === resource.purpose)) excludedPartitionIds.add(assignment.id);
    }
    if (resource.availability === "RESERVED" && resource.reservedForClaimIds.some((id) => !assignments.some((assignment) => assignment.assetId === resource.underlyingAssetId && assignment.claimId === id))) liquidValid=false;
  }
  for (const asset of profile.assets) if (asset.ownership === "SOLE" && (asset.type === "CASH" || asset.type === "DEPOSIT") && asset.liquidity === "IMMEDIATE" && !liquidAssetIds.has(asset.id)) liquidValid=false;
  for (const assignment of assignments) {
    if (!liquidAssetIds.has(assignment.assetId)) continue;
    if (assignment.amount.status !== "KNOWN") { liquidValid=false; continue; }
    if (assignment.purpose === "UNASSIGNED" || assignment.purpose === "SAFETY" && !assignment.claimId) continue;
    if (!excludedPartitionIds.has(assignment.id)) reservedTotal=decimalSum([reservedTotal,assignment.amount.data.value]);
    if (assignment.claimId) claimReservations.set(assignment.claimId,decimalSum([claimReservations.get(assignment.claimId)??0,assignment.amount.data.value]));
  }
  const horizonPaths=profile.obligations.filter((item) => item.required).flatMap((item) => [`obligations.${item.id}.amount`,`obligations.${item.id}.reservedAmount`,`obligations.${item.id}.economicPaymentId`,`obligations.${item.id}.recurrence`,`obligations.${item.id}.required`,`obligations.${item.id}.dueDate`]);
  function obligationsWithin(days:number):{required:number|null;uncovered:number|null} {
    if (!options.complete.obligations || obligationIds.size !== profile.obligations.length) return {required:null,uncovered:null};
    const records=new Map<string,{amount:number;reserved:number}>();
    for (const item of profile.obligations) {
      if (!item.required) continue;
      // Recurrence needs explicit occurrence identities; never annualize or repeat a template here.
      if (item.recurrence !== "NONE" || !validDate(item.dueDate) || !item.economicPaymentId) return {required:null,uncovered:null};
      const day=(Date.parse(item.dueDate)-Date.parse(options.asOf))/millisecondsPerDay;
      // A required overdue occurrence remains payable until explicitly removed/fulfilled upstream.
      if (day>days) continue;
      const amount=resolve(item.amount,`obligations.${item.id}.amount`),reportedReserved=resolve(item.reservedAmount,`obligations.${item.id}.reservedAmount`);
      if (amount === null || reportedReserved === null || reportedReserved>amount) return {required:null,uncovered:null};
      const assigned=claimReservations.get(item.id)??0;
      // A reservation attestation must agree with actual assignments; otherwise deduction lineage is ambiguous.
      if (assigned !== reportedReserved || assigned>amount) return {required:null,uncovered:null};
      const existing=records.get(item.economicPaymentId);
      if (existing && assigned>0) return {required:null,uncovered:null};
      if (existing && (existing.amount !== amount || existing.reserved !== assigned)) return {required:null,uncovered:null};
      records.set(item.economicPaymentId,{amount,reserved:assigned});
    }
    return {required:sum([...records.values()].map(item=>item.amount)),uncovered:sum([...records.values()].map(item=>decimalSum([item.amount,-item.reserved])))};
  }
  for (const days of [30,90,365] as const) {
    const due=obligationsWithin(days);
    if (days === 30) emit("metrics.requiredObligations30d",due.required,"DATED_OBLIGATION_IDENTITY_OR_AMOUNT_UNKNOWN",[...horizonPaths,...resourcePaths,...outflowPaths.filter((path)=>path.startsWith("inventory.obligations")),"completeness.obligations"]);
    emit(`metrics.availableSafetyLiquidity${days}d`,liquidValid && due.uncovered !== null?decimalSum([liquidCapital,-reservedTotal,-due.uncovered]):null,"LIQUIDITY_REALIZATION_RESERVATION_OR_OBLIGATION_UNKNOWN",[...assetPaths,...assetBasisPaths,...horizonPaths,...resourcePaths,"basis.primaryCurrencyConfirmed","basis.stockAsOfConfirmed","completeness.assets","completeness.resources","completeness.assignments","completeness.obligations"]);
  }
  const safety=value("metrics.availableSafetyLiquidity30d");
  emit("metrics.financialRunwayMonths",safety !== null && cmo !== null && cmo>0?safety/cmo:null,"RUNWAY_UNKNOWN_OR_NONPOSITIVE_DENOMINATOR",[],["metrics.availableSafetyLiquidity30d","metrics.coreMonthlyOutflow"]);
  emit("flags.hasReservedCapital",liquidValid?reservedTotal>0:null,"RESERVATION_DISCOVERY_INCOMPLETE",[...assetPaths,...assetBasisPaths,...resourcePaths,"basis.primaryCurrencyConfirmed","basis.stockAsOfConfirmed","completeness.assets","completeness.resources","completeness.assignments","completeness.obligations"]);
  emit("flags.hasImmediateFundingGap",safety !== null?safety<0:null,"IMMEDIATE_FUNDING_GAP_UNKNOWN",[],["metrics.availableSafetyLiquidity30d"]);
  emit("flags.hasNegativeCoreCashFlow",ccf !== null?ccf<0:null,"CORE_CASH_FLOW_UNKNOWN",[],["metrics.coreCashFlow"]);
  emit("flags.hasZeroIncome",nmi !== null?nmi === 0:null,"INCOME_UNKNOWN",[],["metrics.netMonthlyIncome"]);
  emit("flags.hasNegativeNetWorth",nw !== null?nw<0:null,"NET_WORTH_UNKNOWN",[],["metrics.netWorth"]);
  const debtCosts=profile.liabilities.map((item) => ({apr:resolve(item.apr,`liabilities.${item.id}.apr`),classification:readAtSnapshot(item.costClassification)}));
  for (const item of profile.liabilities) {
    attest(`liabilities.${item.id}.delinquencyStatus`,item.delinquencyStatus);
    const classification=readAtSnapshot(item.costClassification);
    inputRecords[`liabilities.${item.id}.costClassification`]=snapshotInput(classification);
    if (classification.status === "KNOWN") sourceByPath.set(`liabilities.${item.id}.costClassification`,classification.data.source);
  }
  const debtUnknown=debtCosts.some(({apr,classification}) => apr === null || classification.status !== "KNOWN" || !["HIGH_COST","OTHER_COST"].includes(classification.data.value));
  emit("flags.hasUnknownDebtCost",options.complete.liabilities?debtUnknown:null,"DEBT_DISCOVERY_INCOMPLETE",[...profile.liabilities.flatMap(({id}) => [`liabilities.${id}.apr`,`liabilities.${id}.costClassification`]),"completeness.liabilities"]);
  emit("flags.hasHighCostDebt",options.complete.liabilities && !debtUnknown?debtCosts.some(({classification}) => classification?.status === "KNOWN" && classification.data.value === "HIGH_COST"):null,"DEBT_COST_CLASSIFICATION_UNKNOWN",[...profile.liabilities.flatMap(({id}) => [`liabilities.${id}.apr`,`liabilities.${id}.costClassification`]),"completeness.liabilities"]);
  const knownDelinquency=profile.liabilities.some(({delinquencyStatus}) => delinquencyStatus === "DELINQUENT" || delinquencyStatus === "DEFAULT");
  emit("flags.hasDelinquentDebt",knownDelinquency?true:options.complete.liabilities && profile.liabilities.every(({delinquencyStatus}) => delinquencyStatus === "CURRENT" || delinquencyStatus === "AT_RISK")?false:null,"DELINQUENCY_STATE_UNKNOWN",[...profile.liabilities.map(({id}) => `liabilities.${id}.delinquencyStatus`),"completeness.liabilities"]);
  const milestone=value("config.minimumViableLiquidityMonths"),runway=value("metrics.financialRunwayMonths");
  emit("flags.hasMinimumViableLiquidityGap",runway !== null && milestone !== null?runway<milestone:null,"LIQUIDITY_MILESTONE_DEPENDENCY_UNKNOWN",[],["metrics.financialRunwayMonths","config.minimumViableLiquidityMonths"]);
  const savings=readAtSnapshot(profile.reportedMonthlySavings);
  inputRecords["reportedMonthlySavings"]=snapshotInput(savings);
  if (savings.status === "KNOWN") sourceByPath.set("reportedMonthlySavings",savings.data.source);
  const savingsKnown=normalizationAllowed && savings.status === "KNOWN" && typeof savings.data.value === "number" && Number.isFinite(savings.data.value) && Date.parse(savings.data.updatedAt)<=Date.parse(options.asOf);
  emit("metrics.reportedMonthlySavings",savingsKnown?savings.data.value as number:null,"REPORTED_SAVINGS_BASIS_OR_VALUE_UNKNOWN",["reportedMonthlySavings","basis.netMonthlyBasisConfirmed","basis.monthlyPeriodId","basis.primaryCurrencyConfirmed"]);
  if (savingsKnown) context["metrics.reportedMonthlySavings"]=savings;
  const reported=value("metrics.reportedMonthlySavings"),surplus=value("metrics.monthlySurplus");
  emit("flags.hasCashFlowContradiction",reported !== null && surplus !== null?reported !== surplus:null,"REPORTED_SAVINGS_RECONCILIATION_UNKNOWN",[],["metrics.reportedMonthlySavings","metrics.monthlySurplus"]);
  const unresolved=claims.filter((item) => item.lifecycleStatus === "ACTIVE" && item.category !== "OPTIMIZATION");
  const claimDiscoveryComplete=options.complete.claims && validateClaims(claims).valid;
  emit("counts.unresolvedPriorityClaims",claimDiscoveryComplete?unresolved.length:null,"CLAIM_DISCOVERY_INCOMPLETE",[...claimPaths,"completeness.claims"]);
  emit("flags.hasUnresolvedPriorityClaim",claimDiscoveryComplete?unresolved.length>0:null,"CLAIM_DISCOVERY_INCOMPLETE",[...claimPaths,"completeness.claims"]);
  const goalFundingUnknown=unresolved.some((item) => item.claimType === "GOAL_FUNDING" && item.fundingStatus === "UNKNOWN");
  emit("flags.hasGoalFundingClaim",claimDiscoveryComplete && !goalFundingUnknown?unresolved.some((item) => item.claimType === "GOAL_FUNDING" && (item.fundingStatus === "UNFUNDED" || item.fundingStatus === "PARTIALLY_FUNDED")):null,"GOAL_CLAIM_DISCOVERY_INCOMPLETE",[...claimPaths,"completeness.claims"]);
  const goalClaimGaps=unresolved.filter((claim) => claim.claimType === "GOAL_FUNDING").map((claim) => {
    const amount=resolve(claim.amount,`claims.${claim.id}.amount`),funding=resolve(claim.fundedAmount,`claims.${claim.id}.fundedAmount`);
    return amount !== null && funding !== null?Math.max(decimalSum([amount,-funding]),0):null;
  });
  emit("metrics.totalGoalClaims",claimDiscoveryComplete?sum(goalClaimGaps):null,"GOAL_CLAIM_DISCOVERY_OR_AMOUNT_UNKNOWN",[...claimPaths,"completeness.claims"]);
  // Higher-level allocation/goal models remain research-required UNKNOWN slots.
  emit("metrics.sustainableGoalCapital",null,"RESEARCH_REQUIRED_SUSTAINABILITY_MODEL",["completeness.goals","completeness.assets","completeness.claims"]);
  emit("metrics.longTermInvestableCapital",null,"RESEARCH_REQUIRED_ALLOCATION_MODEL",["completeness.assets","completeness.assignments","completeness.claims"]);
  emit("flags.hasGoalConflict",null,"RESEARCH_REQUIRED_GOAL_SUSTAINABILITY_MODEL",[],["metrics.sustainableGoalCapital","metrics.totalGoalClaims"]);
  emit("flags.hasAllocationConflict",null,"ALLOCATION_TRADEOFF_NOT_EXPLICITLY_REPORTED",["completeness.claims"]);
  const coreRefs:ValueRef[]=["metrics.netMonthlyIncome","metrics.coreMonthlyOutflow","metrics.coreCashFlow","metrics.monthlySurplus","metrics.netWorth","metrics.availableSafetyLiquidity30d","metrics.financialRunwayMonths","metrics.debtServiceRatio"];
  emit("flags.hasMissingCriticalData",coreRefs.some((ref) => context[ref].status !== "KNOWN"),"CRITICAL_DEPENDENCY_UNKNOWN",[],coreRefs);
  const metadata:EvaluationMetadata={id:`normalization:${options.snapshotId}`,snapshotId:options.snapshotId,evaluatedAt:options.asOf,schemaVersion:"1.0.0",jurisdiction:profile.profile.country,inputStates:Object.fromEntries(valueRefs.map((ref) => {
    const state=context[ref]; return [ref,state.status === "KNOWN"?{status:state.status,value:state.data.value,source:state.data.source,updatedAt:state.data.updatedAt}:{status:state.status,reasonCode:state.reasonCode}];
  })),configValues:milestone === null?{}:{"config.minimumViableLiquidityMonths":milestone},source:"PROFILE_NORMALIZATION",inputRecords,valueLineage,valueDependencies:Object.fromEntries(traces.map(({ref,dependencyRefs}) => [ref,dependencyRefs]))};
  return {context,traces,metadata};
}
