/**
 * S00 portable seam for the frozen v1 decimalSum/decimalProduct implementation.
 * Operands are already validated finite numbers in the frozen domain contract,
 * NOT raw user/API strings or tagged KNOWN/UNKNOWN/NOT_APPLICABLE values.
 * Arithmetic uses String(number)'s canonical decimal coefficients and exponent;
 * internal BigInt never leaves this module. No epsilon or rounding is inferred.
 * A finite result must round-trip to the same decimal value; otherwise it is NaN.
 * Overflow retains the frozen nonfinite sentinel. Callers MUST reject nonfinite
 * results or propagate UNKNOWN before JSON serialization (which would lose them).
 *
 * This primitive is currency/unit agnostic: its caller must validate matching
 * currency, period and field sign rules. Signed derived values are supported;
 * this does NOT authorize negative source amounts or mixed-currency addition.
 * Source decimal-string validation, currency/minor-unit bounds, tagged-state
 * codecs and serialization are S02, not implemented here. Display formatting
 * is downstream only; formatted strings must never become arithmetic operands.
 * The body below is unchanged from frozen commit cfff3150fb5e6a258596fa54caa745023bcde894.
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
