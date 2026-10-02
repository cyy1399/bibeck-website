/** Decimal arithmetic on the canonical finite input-number representation.
 * No epsilon, currency precision, rounding policy or financial threshold is inferred.
 * BigInt coefficients are internal only; callers reject nonfinite/unrepresentable
 * results or normalize them to UNKNOWN before serializing a decision.
 */
function parts(value:number):{coefficient:bigint; exponent:number}|null {
  if (!Number.isFinite(value)) return null;
  const match=/^(-?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/u.exec(String(value));
  if (!match) return null;
  const fraction=match[3]??"";
  return {coefficient:BigInt((match[1]??"")+match[2]+fraction),exponent:Number(match[4]??0)-fraction.length};
}

function output(coefficient:bigint,exponent:number):number {
  const value=Number(`${coefficient}e${exponent}`);
  const represented=parts(value);
  if (!represented) return value;
  const common=Math.min(exponent,represented.exponent);
  return coefficient*BigInt(10)**BigInt(exponent-common)===represented.coefficient*BigInt(10)**BigInt(represented.exponent-common)?value:NaN;
}

export function decimalSum(values:readonly number[]):number {
  const parsed=values.map(parts);
  if (parsed.some(value=>value===null)) return NaN;
  if (parsed.length===0) return 0;
  const known=parsed as {coefficient:bigint; exponent:number}[];
  const exponent=known.reduce((minimum,value)=>Math.min(minimum,value.exponent),known[0].exponent);
  const coefficient=known.reduce((total,value)=>total+value.coefficient*BigInt(10)**BigInt(value.exponent-exponent),BigInt(0));
  return output(coefficient,exponent);
}

export function decimalProduct(left:number,right:number):number {
  const a=parts(left),b=parts(right);
  return a && b?output(a.coefficient*b.coefficient,a.exponent+b.exponent):NaN;
}
