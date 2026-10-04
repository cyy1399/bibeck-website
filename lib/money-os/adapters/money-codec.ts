import { decimalSum } from "../../money-model/arithmetic/decimal-arithmetic.ts";
import { accepted, rejected, plainRecord, exactKeys, type CodecResult } from "../contracts/errors.ts";
import { SOURCE_LIMITS, isCurrencyCode } from "../contracts/source.ts";

export type DecimalSign = "SOURCE" | "DERIVED";
export interface DecimalParts { coefficient: bigint; scale: number }
export interface MinorUnitContract { currency: string; unit: "MONEY" | "MONEY_PER_MONTH"; declaredScale: number }

/** Literal codec only. No financial sum, policy, epsilon, locale inference or rounding. */
export function canonicalDecimal(input: unknown, sign: DecimalSign = "SOURCE"): CodecResult<string> {
  if (typeof input !== "string" || !["SOURCE", "DERIVED"].includes(sign)) return rejected("INVALID_DECIMAL_LITERAL");
  const token = input.trim();
  if (token.length > SOURCE_LIMITS.numericTokenCharacters) return rejected("NUMERIC_TOKEN_LIMIT");
  const match = (sign === "DERIVED" ? /^(-?)([0-9]+)(?:\.([0-9]+))?$/u : /^()([0-9]+)(?:\.([0-9]+))?$/u).exec(token);
  if (!match) return rejected("INVALID_DECIMAL_LITERAL");
  if (match[2].length > SOURCE_LIMITS.integerDigits) return rejected("INTEGER_DIGIT_LIMIT");
  const fraction = match[3] ?? "";
  if (fraction.length > SOURCE_LIMITS.decimalScale) return rejected("DECIMAL_SCALE_LIMIT");
  const integer = match[2].replace(/^0+(?=[0-9])/u, "");
  const decimals = fraction.replace(/0+$/u, "");
  const magnitude = integer + (decimals ? "." + decimals : "");
  return accepted((magnitude !== "0" ? match[1] : "") + magnitude);
}

export function decimalParts(input: unknown, sign: DecimalSign = "SOURCE"): CodecResult<DecimalParts> {
  const parsed = canonicalDecimal(input, sign);
  if (!parsed.ok) return parsed;
  const [integer, fraction = ""] = parsed.value.split(".");
  return accepted({ coefficient: BigInt(integer + fraction), scale: fraction.length });
}

export function decimalFromParts(input: DecimalParts, sign: DecimalSign = "SOURCE"): CodecResult<string> {
  if (!plainRecord(input) || !exactKeys(input, ["coefficient", "scale"]) || typeof input.coefficient !== "bigint"
    || !Number.isInteger(input.scale) || input.scale < 0 || input.scale > SOURCE_LIMITS.decimalScale) return rejected("INVALID_DECIMAL_PARTS");
  const negative = input.coefficient < BigInt(0);
  const digits = (negative ? -input.coefficient : input.coefficient).toString();
  if (digits.length > SOURCE_LIMITS.integerDigits + input.scale) return rejected("INTEGER_DIGIT_LIMIT");
  const padded = digits.padStart(input.scale + 1, "0");
  const raw = (negative ? "-" : "") + (input.scale ? padded.slice(0, -input.scale) + "." + padded.slice(-input.scale) : padded);
  return canonicalDecimal(raw, sign);
}

/** Expand only String(finite number), never a submitted exponent token. */
function numberLiteral(value: number): string {
  const match = /^(-?)([0-9]+)(?:\.([0-9]+))?(?:e([+-]?[0-9]+))?$/u.exec(String(value))!;
  const digits = match[2] + (match[3] ?? "");
  const position = match[2].length + Number(match[4] ?? 0);
  return match[1] + (position <= 0 ? "0." + "0".repeat(-position) + digits
    : position >= digits.length ? digits + "0".repeat(position - digits.length)
    : digits.slice(0, position) + "." + digits.slice(position));
}

/** The sole raw decimal→Number seam: syntax/bounds then exact canonical round-trip. */
export function toDomainNumber(input: unknown, sign: DecimalSign = "SOURCE"): CodecResult<number> {
  const parsed = canonicalDecimal(input, sign);
  if (!parsed.ok) return parsed;
  const number = Number(parsed.value);
  if (!Number.isFinite(number)) return rejected("NUMBER_PRECISION_LOSS");
  // Use S00's existing monetary representability seam, not a second arithmetic implementation.
  const checked = decimalSum([number]);
  const back = canonicalDecimal(numberLiteral(checked), sign);
  return back.ok && back.value === parsed.value ? accepted(checked) : rejected("NUMBER_PRECISION_LOSS");
}

export function fromDomainNumber(input: unknown): CodecResult<string> {
  if (typeof input !== "number" || !Number.isFinite(input)) return rejected("INVALID_DOMAIN_NUMBER");
  const checked = decimalSum([input]);
  if (!Number.isFinite(checked)) return rejected("NUMBER_PRECISION_LOSS");
  return canonicalDecimal(numberLiteral(checked), "DERIVED");
}

function validMinorContract(contract: unknown): contract is MinorUnitContract {
  return plainRecord(contract) && exactKeys(contract, ["currency", "unit", "declaredScale"])
    && isCurrencyCode(contract.currency) && ["MONEY", "MONEY_PER_MONTH"].includes(contract.unit as string)
    && typeof contract.declaredScale === "number" && Number.isInteger(contract.declaredScale)
    && contract.declaredScale >= 0 && contract.declaredScale <= SOURCE_LIMITS.decimalScale;
}

/** Caller must supply a separately reviewed currency/unit scale. No built-in minor-unit policy. */
export function toMinorUnits(input: unknown, contract: MinorUnitContract): CodecResult<bigint> {
  if (!validMinorContract(contract)) return rejected("INVALID_MINOR_UNIT_CONTRACT");
  const parsed = decimalParts(input);
  if (!parsed.ok) return parsed;
  if (parsed.value.scale > contract.declaredScale) return rejected("MINOR_UNIT_PRECISION_LOSS");
  return accepted(parsed.value.coefficient * BigInt(10) ** BigInt(contract.declaredScale - parsed.value.scale));
}
export function fromMinorUnits(input: unknown, contract: MinorUnitContract): CodecResult<string> {
  if (!validMinorContract(contract) || typeof input !== "bigint" || input < BigInt(0)) return rejected("INVALID_MINOR_UNIT_CONTRACT");
  return decimalFromParts({ coefficient: input, scale: contract.declaredScale });
}

export interface DecimalDisplay { text: string; canonical: string; fullPrecision: string; rounded: boolean; roundedToZero: boolean }
/** Terminal display projection. Callers retain canonical, never submit formatted text. */
export function formatDecimalForDisplay(input: unknown, maximumFractionDigits = SOURCE_LIMITS.decimalScale): CodecResult<DecimalDisplay> {
  const canonical = canonicalDecimal(input, "DERIVED");
  if (!canonical.ok) return canonical;
  if (!Number.isInteger(maximumFractionDigits) || maximumFractionDigits < 0 || maximumFractionDigits > SOURCE_LIMITS.decimalScale) return rejected("INVALID_DISPLAY_PRECISION");
  const number = toDomainNumber(canonical.value, "DERIVED");
  if (!number.ok) return number;
  const display = new Intl.NumberFormat("en-US", { useGrouping: false, maximumFractionDigits }).format(number.value);
  const roundedToZero = number.value !== 0 && /^-?0(?:\.0+)?$/u.test(display);
  return accepted({ text: roundedToZero ? canonical.value : display, canonical: canonical.value,
    fullPrecision: canonical.value, rounded: display !== canonical.value, roundedToZero });
}
