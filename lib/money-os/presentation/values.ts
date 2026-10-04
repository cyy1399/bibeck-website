import { fromDomainNumber } from "../adapters/money-codec.ts";
import type { DomainValue } from "../../money-model/index.ts";
import type { InputState, ConfidenceAssessment } from "../../money-model/contracts/provenance.schema.ts";
import type { DisplayValue, ConfidenceDto } from "../contracts/read-dto.ts";
import type { Localizer } from "../../../messages/money-os/index.ts";
import { zhTW } from "../../../messages/money-os/zh-TW.ts";
import type { MessageKey } from "../../../messages/money-os/keys.ts";
import { isCurrencyCode } from "../contracts/source.ts";

/** No calculations, FX, percentage multiplication, or rounded operands. */
export function displayValue(value: DomainValue<number | string | boolean | null>, l: Localizer, maskRecordReference = false, currencyField = false): DisplayValue {
  if (value.status !== "KNOWN") return { status: value.status, text: l.text(value.status === "UNKNOWN" ? "moneyOs.input.unknown" : "moneyOs.input.notApplicable") };
  const raw = value.data.value;
  let canonical: string | boolean | null, text: string;
  if (maskRecordReference) { canonical = null; text = l.text("moneyOs.input.linkedRecord"); }
  else if (typeof raw === "number") {
    const encoded = fromDomainNumber(raw);
    // Frozen ratio/months may exceed SOURCE decimal scale. Preserve finite canonical
    // number notation rather than rejecting a valid domain ratio or rounding to zero.
    canonical = encoded.ok ? encoded.value : String(raw);
    const grouped = new Intl.NumberFormat(l.locale, { maximumFractionDigits: 20 }).format(raw);
    text = grouped.replaceAll(",", "") === canonical ? grouped : canonical;
  } else if (typeof raw === "boolean") { canonical = raw; text = l.text(raw ? "moneyOs.input.yes" : "moneyOs.input.no"); }
  else if (raw === null) { canonical = null; text = l.text("moneyOs.input.enum.NONE"); }
  else if (currencyField && isCurrencyCode(raw) || /^\d{4}-\d{2}(?:-\d{2})?$/u.test(raw) || ["TWD", "USD", "USDT", "USDC", "JPY", "EUR", "TW", "US", "JP"].includes(raw)) { canonical = raw; text = raw; }
  else {
    const key = ("moneyOs.input.enum." + raw) as MessageKey;
    canonical = null; text = Object.hasOwn(zhTW, key) ? l.text(key) : l.text("moneyOs.input.classification");
  }
  return { status: "KNOWN", canonical, text, source: l.text(("moneyOs.input.source." + value.data.source) as MessageKey), updatedAt: value.data.updatedAt };
}
export function displayInput(state: InputState, l: Localizer, mask = false, currencyField = false): DisplayValue {
  return displayValue(state.status === "KNOWN" ? { status: "KNOWN", data: { value: state.value ?? null, source: state.source!, updatedAt: state.updatedAt! } }
    : { status: state.status, reasonCode: state.reasonCode! }, l, mask, currencyField);
}
export function projectConfidence(confidence: ConfidenceAssessment, l: Localizer): ConfidenceDto {
  const reasons = confidence.reasonCodes.map(code => l.text(
    code === "USER_REPORTED_INPUT" ? "moneyOs.limits.userReported" : code === "ESTIMATED_VALUATION" ? "moneyOs.limits.estimated"
      : code === "MISSING_REQUIRED_DATA" ? "moneyOs.limits.missing" : code.startsWith("WORKING_MODEL:") ? "moneyOs.limits.working"
        : code.startsWith("RESEARCH_REQUIRED:") ? "moneyOs.limits.research" : code === "UNVERSIONED_REFERENCE_INPUTS" ? "moneyOs.limits.reference"
          : code === "DECLARED_RULE_AND_INPUT_SUPPORT" ? "moneyOs.limits.declared" : "moneyOs.entry.fallback"));
  return { level: confidence.level, label: l.text(("moneyOs.why." + confidence.level) as MessageKey), reasons };
}
