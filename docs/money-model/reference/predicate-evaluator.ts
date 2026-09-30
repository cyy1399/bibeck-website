import { valueRefs, type Condition, type DomainValue, type LiteralValue, type NormalizedDecisionContext, type Scalar, type TruthValue, type ValueRef } from "../schemas/index.ts";
export const approvedValueRefs = new Set<ValueRef>(valueRefs);

export function evaluateCondition(condition:Condition,context:NormalizedDecisionContext):TruthValue {
  if (condition.kind === "exists") return context[condition.ref].status === "KNOWN" ? "TRUE" : "FALSE";
  if (condition.kind === "missing") return context[condition.ref].status === "UNKNOWN" ? "TRUE" : "FALSE";
  if (condition.kind === "not") return invert(evaluateCondition(condition.condition,context));
  if (condition.kind === "logical") {
    const values = condition.conditions.map((item) => evaluateCondition(item,context));
    if (condition.operator === "AND") return values.includes("FALSE") ? "FALSE" : values.includes("UNKNOWN") ? "UNKNOWN" : "TRUE";
    return values.includes("TRUE") ? "TRUE" : values.includes("UNKNOWN") ? "UNKNOWN" : "FALSE";
  }
  const left = context[condition.left];
  const right:DomainValue<Scalar> = condition.right.kind === "ref" ? context[condition.right.ref] : {status:"KNOWN",data:{value:condition.right.value,source:"CALCULATED",updatedAt:"2026-10-01"}};
  if (left.status !== "KNOWN" || right.status !== "KNOWN") return "UNKNOWN";
  return compare(left.data.value,right.data.value,condition.operator) ? "TRUE" : "FALSE";
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
