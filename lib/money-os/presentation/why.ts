import type { DecisionOutput, RuntimeBundle } from "../../money-model/index.ts";
import type { ConfidenceAssessment, DecisionProvenance } from "../../money-model/contracts/provenance.schema.ts";
import type { MetricDto, WhyDto } from "../contracts/read-dto.ts";
import type { SourceBasis } from "../contracts/source.ts";
import type { Localizer } from "../../../messages/money-os/index.ts";
import type { MessageKey } from "../../../messages/money-os/keys.ts";
import { zhTW } from "../../../messages/money-os/zh-TW.ts";
import { displayInput, projectConfidence } from "./values.ts";

const sourceDescriptor = (path: string, l: Localizer): { label: string; unit: string; mask: boolean } => {
  const field = path.split(".").at(-1)!;
  const aliases: Record<string, string> = {
    primaryCurrency: "currency", country: "country", primaryCurrencyConfirmed: "currencyBasis", netMonthlyBasisConfirmed: "monthlyBasis",
    stockAsOfConfirmed: "stockBasis", monthlyPeriodId: "monthlyPeriodId", aggregatesExcludeDebtAndObligations: "paymentBasis",
    averageMonthlyNetIncome: "metric.netMonthlyIncome", reportedMonthlySavings: "metric.reportedMonthlySavings",
  };
  const mask = /^inventory\.[^.]+\.\d+$/u.test(path) || /(?:Id|Ids)$/u.test(field) || ["restriction", "partitionAssignmentIds"].includes(field);
  const key = ("moneyOs." + (aliases[field]?.startsWith("metric.") ? aliases[field] : "input." + (aliases[field] ?? field))) as MessageKey;
  const label = path.startsWith("completeness.") || path.startsWith("inventory.") ? l.text("moneyOs.input.coverage")
    : Object.hasOwn(zhTW, key) ? l.text(key) : l.text("moneyOs.input.classification");
  const unit = ["averageMonthlyNetIncome", "minimumMonthlyPayment", "necessaryMonthly", "otherMonthlyRequired", "discretionaryMonthly", "reportedMonthlySavings"].includes(field) ? "MONEY_PER_MONTH"
    : ["currentValue", "availableEconomicValue", "balance", "amount", "reservedAmount", "targetAmount", "currentFunding", "fundedAmount"].includes(field) ? "MONEY"
      : ["dueDate", "availableFrom", "targetDate"].includes(field) ? "DATE"
        : ["apr", "nominalRate", "promotionalRate"].includes(field) ? "APR_PERCENT"
          : ["remainingTermMonths", "minimumViableLiquidityMonths"].includes(field) ? "MONTHS" : field === "length" || field === "dependents" ? "COUNT" : "BOOLEAN";
  return { label, unit, mask };
};
/** Receives one already validated bundle/output; never combines current/historical registries. */
export function projectWhy(output: DecisionOutput, p: DecisionProvenance, confidence: ConfidenceAssessment, metrics: MetricDto[], basis: SourceBasis, bundle: RuntimeBundle, l: Localizer): WhyDto {
  const records = output.evaluation.inputRecords ?? {};
  const allPaths = Object.keys(records);
  const sources = p.sourceInputRefs.map(path => {
    const d = sourceDescriptor(path, l), state = records[path];
    return { key: "source-" + allPaths.indexOf(path), label: d.label, value: displayInput(state, l, d.mask, path === "profile.primaryCurrency"),
      unit: l.text(("moneyOs.input.unit." + (d.unit === "BOOLEAN" && typeof state.value === "string" ? "CLASSIFICATION" : d.unit)) as MessageKey),
      timeBasis: l.text(d.unit === "MONEY_PER_MONTH" ? "moneyOs.input.basis.MONTHLY" : "moneyOs.input.basis.AS_OF"),
      currency: d.unit.startsWith("MONEY") ? basis.primaryCurrency : null };
  });
  const selectedMetrics = metrics.filter(metric => p.metricRefs.includes(metric.key as DecisionProvenance["metricRefs"][number]));
  const findingKeys = output.findings.filter(f => p.findingIds.includes(f.id)).map(f => f.id);
  const findings = output.findings.filter(f => p.findingIds.includes(f.id) || f.provenance.ruleRefs.some(rule => p.ruleRefs.some(r => r.id === rule.id && r.version === rule.version)));
  const assumptions = p.assumptionRefs.map(ref => {
    const record = bundle.assumptions.find(a => a.id === ref.id && a.revision === ref.revision)!;
    return { text: l.text(("moneyOs.limits.assumption." + ref.id.replace("-", "")) as MessageKey),
      status: l.text(("moneyOs.limits.status." + record.status) as MessageKey), revision: ref.revision };
  });
  const missing = p.inputRefs.filter(ref => output.evaluation.inputStates[ref]?.status !== "KNOWN").map((ref, index) => ({
    key: "dependency-" + index, label: l.semantic("MISSING_VALUE_REF", { ref }),
    status: output.evaluation.inputStates[ref]!.status as "UNKNOWN" | "NOT_APPLICABLE",
  }));
  return {
    sources: { title: l.text("moneyOs.why.sources"), items: sources },
    metrics: { title: l.text("moneyOs.why.metrics"), items: selectedMetrics, emptyText: selectedMetrics.length ? null : l.text("moneyOs.why.noMetrics") },
    mechanism: { title: l.text("moneyOs.why.mechanism"), items: findings.map(f => l.semantic(f.code)) },
    assumptions: { title: l.text("moneyOs.why.assumptions"), items: assumptions, emptyText: assumptions.length ? null : l.text("moneyOs.why.noAssumptions") },
    missing: { title: l.text("moneyOs.why.missing"), items: missing, emptyText: missing.length ? null : l.text("moneyOs.why.noMissing") },
    limits: { title: l.text("moneyOs.why.limits"), confidence: projectConfidence(confidence, l),
      changeConditions: l.text("moneyOs.why.change"), text: l.text("moneyOs.limits.general") },
    support: { findingKeys, rules: p.ruleRefs.length, models: p.modelRefs.length, evidence: p.evidenceRefs.length, assumptions: p.assumptionRefs.length },
  };
}
