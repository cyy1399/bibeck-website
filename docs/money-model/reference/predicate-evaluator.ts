import { valueRefs, type Condition, type DomainValue, type LiteralValue, type NormalizedDecisionContext, type PredicateValidationIssue, type PredicateValidationResult, type Scalar, type TruthValue, type ValueRef } from "../schemas/index.ts";
import { isRegisteredValueRef, valueRefRegistry, type ValueRefDefinition } from "../registries/value-refs.ts";
export const approvedValueRefs = new Set<ValueRef>(valueRefs);
const record = (value:unknown):value is Record<string,unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const ownKeys = (value:Record<string,unknown>, allowed:string[]) => Object.keys(value).every((key) => allowed.includes(key));
const issue = (errors:PredicateValidationIssue[],code:string,path:string,message:string) => errors.push({code,path,message});
const numeric = (value:unknown) => typeof value === "number" && Number.isFinite(value);
function validScalar(value:unknown,definition:ValueRefDefinition,checkSign=true):boolean {
  if (definition.valueType === "boolean") return typeof value === "boolean";
  if (!numeric(value)) return false;
  const number = value as number;
  if (definition.valueType === "count" && !Number.isInteger(number)) return false;
  if (checkSign && (definition.sign === "NONNEGATIVE" && number < 0 || definition.sign === "POSITIVE" && number <= 0)) return false;
  return !checkSign || definition.maximum === undefined || number <= definition.maximum;
}

/** Runtime boundary for serialized DSL. References are exact registry keys, never traversed paths. */
export function validateCondition(condition:unknown):PredicateValidationResult {
  const errors:PredicateValidationIssue[] = [];
  let nodes = 0;
  function visit(node:unknown,path:string,depth:number):void {
    if (++nodes > 256 || depth > 32) { issue(errors,"PREDICATE_LIMIT",path,"Predicate exceeds the minimal DSL limits."); return; }
    if (!record(node)) { issue(errors,"INVALID_CONDITION",path,"Expected a condition object."); return; }
    if (node.kind === "exists" || node.kind === "missing") {
      if (!ownKeys(node,["kind","ref"])) issue(errors,"UNDECLARED_AST_FIELD",path,"Unexpected condition field.");
      if (!isRegisteredValueRef(node.ref)) issue(errors,"UNKNOWN_VALUE_REF",`${path}.ref`,"Reference is absent from ValueRefRegistry.");
      return;
    }
    if (node.kind === "not") {
      if (!ownKeys(node,["kind","condition"])) issue(errors,"UNDECLARED_AST_FIELD",path,"Unexpected condition field.");
      visit(node.condition,`${path}.condition`,depth+1); return;
    }
    if (node.kind === "logical") {
      if (!ownKeys(node,["kind","operator","conditions"])) issue(errors,"UNDECLARED_AST_FIELD",path,"Unexpected condition field.");
      if (node.operator !== "AND" && node.operator !== "OR") issue(errors,"INVALID_LOGICAL_OPERATOR",path,"Only AND or OR is supported.");
      if (!Array.isArray(node.conditions) || node.conditions.length === 0) issue(errors,"EMPTY_LOGICAL_CONDITION",path,"A logical condition needs operands.");
      else node.conditions.forEach((child,index) => visit(child,`${path}.conditions[${index}]`,depth+1));
      return;
    }
    if (node.kind !== "comparison") { issue(errors,"INVALID_CONDITION_KIND",path,"Unsupported condition kind."); return; }
    if (!ownKeys(node,["kind","left","operator","right"])) issue(errors,"UNDECLARED_AST_FIELD",path,"Unexpected comparison field.");
    if (!isRegisteredValueRef(node.left)) { issue(errors,"UNKNOWN_VALUE_REF",`${path}.left`,"Reference is absent from ValueRefRegistry."); return; }
    const left = valueRefRegistry[node.left];
    if (!["EQ","NE","GT","GTE","LT","LTE"].includes(String(node.operator))) issue(errors,"INVALID_COMPARISON_OPERATOR",path,"Unsupported comparison operator.");
    if (left.valueType === "boolean" && node.operator !== "EQ" && node.operator !== "NE") issue(errors,"INVALID_ORDERED_TYPE",path,"Boolean state only supports equality.");
    if (!record(node.right)) { issue(errors,"INVALID_OPERAND",`${path}.right`,"Expected a ref or literal operand."); return; }
    if (node.right.kind === "ref") {
      if (!ownKeys(node.right,["kind","ref"])) issue(errors,"UNDECLARED_AST_FIELD",`${path}.right`,"Unexpected operand field.");
      if (!isRegisteredValueRef(node.right.ref)) issue(errors,"UNKNOWN_VALUE_REF",`${path}.right.ref`,"Reference is absent from ValueRefRegistry.");
      else {
        const right = valueRefRegistry[node.right.ref];
        if (left.valueType !== right.valueType || left.unit !== right.unit || left.timeBasis !== right.timeBasis || left.currency !== right.currency) issue(errors,"INCOMPATIBLE_REF_UNITS",path,"Compared refs must have equal type, currency, unit and period.");
      }
    } else if (node.right.kind === "literal") {
      if (!ownKeys(node.right,["kind","value"])) issue(errors,"UNDECLARED_AST_FIELD",`${path}.right`,"Unexpected operand field.");
      // A bare numeric literal is explicitly interpreted in the left reference's declared unit.
      if (!validScalar(node.right.value,left,false)) issue(errors,"INCOMPATIBLE_LITERAL_TYPE",`${path}.right.value`,"Literal must match the registered type and be finite.");
    } else issue(errors,"INVALID_OPERAND_KIND",`${path}.right`,"Only ref or literal is supported.");
  }
  visit(condition,"condition",0);
  return {valid:errors.length === 0,errors};
}

export function validateContext(context:unknown,partial=false):PredicateValidationResult {
  const errors:PredicateValidationIssue[] = [];
  if (!record(context)) return {valid:false,errors:[{code:"INVALID_CONTEXT",path:"context",message:"Expected a direct-key context record."}]};
  for (const key of Object.keys(context)) {
    if (!isRegisteredValueRef(key)) { issue(errors,"UNKNOWN_VALUE_REF",key,"Context key is absent from ValueRefRegistry."); continue; }
    const entry = context[key];
    if (!record(entry)) { issue(errors,"INVALID_DOMAIN_VALUE",key,"A value must have an explicit domain status."); continue; }
    if (entry.status === "UNKNOWN" || entry.status === "NOT_APPLICABLE") {
      if (!ownKeys(entry,["status","reasonCode"]) || typeof entry.reasonCode !== "string" || entry.reasonCode.trim().length === 0) issue(errors,"INVALID_DOMAIN_REASON",key,"Unknown and inapplicable values require a reason code only.");
      continue;
    }
    if (entry.status !== "KNOWN" || !ownKeys(entry,["status","data"]) || !record(entry.data)) { issue(errors,"INVALID_DOMAIN_VALUE",key,"KNOWN requires a DataPoint."); continue; }
    if (!ownKeys(entry.data,["value","source","updatedAt"]) || !validScalar(entry.data.value,valueRefRegistry[key])) issue(errors,"INVALID_REGISTERED_VALUE",key,"Known value violates type, finite amount, sign, or bounds.");
    if (!["USER_REPORTED","CALCULATED","VERIFIED","IMPORTED"].includes(String(entry.data.source)) || typeof entry.data.updatedAt !== "string" || !Number.isFinite(Date.parse(entry.data.updatedAt))) issue(errors,"INVALID_DATA_PROVENANCE",key,"Known value requires a supported source and valid timestamp.");
  }
  if (!partial) for (const key of valueRefs) if (!Object.prototype.hasOwnProperty.call(context,key)) issue(errors,"MISSING_CONTEXT_REF",key,"Every registered value needs KNOWN, UNKNOWN, or NOT_APPLICABLE.");
  return {valid:errors.length === 0,errors};
}
export class PredicateContractError extends Error {
  readonly issues:PredicateValidationIssue[];
  constructor(issues:PredicateValidationIssue[]) { super(issues.map(({code,path}) => `${code}:${path}`).join("; ")); this.name="PredicateContractError"; this.issues=issues; }
}
export function assertValidContext(context:unknown,partial=false):asserts context is NormalizedDecisionContext {
  const result=validateContext(context,partial); if (!result.valid) throw new PredicateContractError(result.errors);
}
export function collectConditionRefs(condition:Condition):ValueRef[] {
  const validation=validateCondition(condition); if (!validation.valid) throw new PredicateContractError(validation.errors);
  const refs=new Set<ValueRef>();
  function visit(node:Condition):void {
    if (node.kind === "exists" || node.kind === "missing") refs.add(node.ref);
    else if (node.kind === "comparison") { refs.add(node.left); if (node.right.kind === "ref") refs.add(node.right.ref); }
    else if (node.kind === "not") visit(node.condition);
    else node.conditions.forEach(visit);
  }
  visit(condition); return [...refs].sort();
}
export function evaluateCondition(condition:Condition,context:NormalizedDecisionContext):TruthValue {
  const validation=validateCondition(condition); if (!validation.valid) throw new PredicateContractError(validation.errors);
  assertValidContext(context);
  function evaluate(node:Condition):TruthValue {
    if (node.kind === "exists") return context[node.ref].status === "KNOWN" ? "TRUE" : "FALSE";
    if (node.kind === "missing") return context[node.ref].status === "UNKNOWN" ? "TRUE" : "FALSE";
    if (node.kind === "not") return invert(evaluate(node.condition));
    if (node.kind === "logical") {
      const values=node.conditions.map(evaluate);
      return node.operator === "AND" ? values.includes("FALSE") ? "FALSE" : values.includes("UNKNOWN") ? "UNKNOWN" : "TRUE" : values.includes("TRUE") ? "TRUE" : values.includes("UNKNOWN") ? "UNKNOWN" : "FALSE";
    }
    const left=context[node.left];
    const right:DomainValue<Scalar>=node.right.kind === "ref" ? context[node.right.ref] : {status:"KNOWN",data:{value:node.right.value,source:"CALCULATED",updatedAt:"2026-10-01"}};
    if (left.status !== "KNOWN" || right.status !== "KNOWN") return "UNKNOWN";
    return compare(left.data.value,right.data.value,node.operator) ? "TRUE" : "FALSE";
  }
  return evaluate(condition);
}
function invert(value:TruthValue):TruthValue { return value === "TRUE" ? "FALSE" : value === "FALSE" ? "TRUE" : "UNKNOWN"; }
function compare(left:LiteralValue,right:LiteralValue,operator:"EQ"|"NE"|"GT"|"GTE"|"LT"|"LTE") {
  if (operator === "EQ") return left === right;
  if (operator === "NE") return left !== right;
  if (typeof left !== "number" || typeof right !== "number") return false;
  if (operator === "GT") return left > right;
  if (operator === "GTE") return left >= right;
  if (operator === "LT") return left < right;
  return left <= right;
}
