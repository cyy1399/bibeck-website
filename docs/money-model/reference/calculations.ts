import { known, unknown, type DomainValue } from "../schemas/index.ts";
const values = (items:DomainValue<number>[]) => items.every((item) => item.status === "KNOWN") ? items.map((item) => item.status === "KNOWN" ? item.data.value : 0) : null;
export function sumKnown(items:DomainValue<number>[]):DomainValue<number> { const resolved=values(items); return resolved ? known(resolved.reduce((sum,value)=>sum+value,0)) : unknown("SUM_INPUT_UNKNOWN"); }
export function subtractKnown(left:DomainValue<number>,right:DomainValue<number>):DomainValue<number> { return left.status === "KNOWN" && right.status === "KNOWN" ? known(left.data.value-right.data.value) : unknown("SUBTRACTION_INPUT_UNKNOWN"); }
export function ratioKnown(numerator:DomainValue<number>,denominator:DomainValue<number>):DomainValue<number> { return numerator.status === "KNOWN" && denominator.status === "KNOWN" && denominator.data.value !== 0 ? known(numerator.data.value/denominator.data.value) : unknown("RATIO_INPUT_UNKNOWN_OR_ZERO"); }
export function netWorth(assets:DomainValue<number>[],liabilities:DomainValue<number>[]):DomainValue<number> { return subtractKnown(sumKnown(assets),sumKnown(liabilities)); }
