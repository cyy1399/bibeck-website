"use client";

import { useMemo, useState } from "react";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";
import { calculateTradingCost, compareAnnualCosts } from "@/lib/trading-cost";

const usd = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

type ExchangeComparisonCalculatorProps = {
  currentExchangeName: string;
  currentFeeRate: number | null;
  bybitFeeRate: number;
  bibeckRebateRate: number | null;
};

function displayPercent(rate: number | null): number {
  return rate === null ? 0 : Number((rate * 100).toFixed(6));
}

export function ExchangeComparisonCalculator({
  currentExchangeName,
  currentFeeRate,
  bybitFeeRate,
  bibeckRebateRate,
}: ExchangeComparisonCalculatorProps) {
  const [monthlyVolume, setMonthlyVolume] = useState(100000);
  const [currentFeePercent, setCurrentFeePercent] = useState(displayPercent(currentFeeRate));
  const [currentRebatePercent, setCurrentRebatePercent] = useState(0);
  const [bybitFeePercent, setBybitFeePercent] = useState(displayPercent(bybitFeeRate));
  const [bibeckRebatePercent, setBibeckRebatePercent] = useState(displayPercent(bibeckRebateRate));

  const current = useMemo(
    () => calculateTradingCost({ monthlyVolume, feeRate: currentFeePercent / 100, rebateRate: currentRebatePercent / 100 }),
    [currentFeePercent, currentRebatePercent, monthlyVolume],
  );
  const bybit = useMemo(
    () => calculateTradingCost({ monthlyVolume, feeRate: bybitFeePercent / 100, rebateRate: bibeckRebatePercent / 100 }),
    [bibeckRebatePercent, bybitFeePercent, monthlyVolume],
  );
  const outcome = compareAnnualCosts(current.annualActualCost, bybit.annualActualCost);

  const outcomeText =
    outcome === "bybit"
      ? "依照目前輸入條件，Bybit + BiBeck 的預估年度交易成本較低。"
      : outcome === "current"
        ? "依照目前輸入條件，你目前的方案成本較低。建議確認費率、返傭條件與其他交易成本後再決定。"
        : "依照目前輸入條件，兩個方案的預估交易成本相近。";

  return (
    <div className="calculator-shell">
      <fieldset>
        <legend className="sr-only">目前方案與 Bybit 加 BiBeck 比較輸入</legend>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-white">目前交易所</span>
            <input value={currentExchangeName} readOnly className="calculator-input mt-2 w-full text-white/72" />
          </label>
          <label className="block"><span className="flex items-baseline justify-between gap-3 text-sm font-medium text-white">每月交易量<span className="text-xs font-normal text-white/42">USD</span></span><FormattedNumberInput ariaLabel="每月交易量" value={monthlyVolume} onChange={setMonthlyVolume} /></label>
          <NumberField label="目前手續費率" value={currentFeePercent} min={0} step={0.001} onChange={setCurrentFeePercent} suffix="%" />
          <NumberField label="目前返傭比例" value={currentRebatePercent} min={0} max={100} step={1} onChange={setCurrentRebatePercent} suffix="%" />
          <NumberField label="Bybit 手續費率" value={bybitFeePercent} min={0} step={0.001} onChange={setBybitFeePercent} suffix="%" />
          <NumberField label="BiBeck 返傭比例" value={bibeckRebatePercent} min={0} max={100} step={1} onChange={setBibeckRebatePercent} suffix="%" />
        </div>
      </fieldset>

      <div className="table-scroll-shell mt-10 overflow-x-auto">
        <p className="table-scroll-hint">表格可左右滑動</p>
        <table className="fee-table w-full min-w-[660px] border-collapse text-left">
          <thead><tr><th>比較項目</th><th>目前方案</th><th>Bybit + BiBeck</th></tr></thead>
          <tbody>
            <ComparisonRow label="表面手續費率" current={currentFeePercent.toFixed(4) + "%"} bybit={bybitFeePercent.toFixed(4) + "%"} />
            <ComparisonRow label="返傭比例" current={currentRebatePercent.toFixed(2) + "%"} bybit={bibeckRebatePercent.toFixed(2) + "%"} />
            <ComparisonRow label="每月原始費用" current={usd.format(current.monthlyRawFee)} bybit={usd.format(bybit.monthlyRawFee)} />
            <ComparisonRow label="每月返傭" current={usd.format(current.monthlyRebate)} bybit={usd.format(bybit.monthlyRebate)} />
            <ComparisonRow label="每月實際成本" current={usd.format(current.monthlyActualCost)} bybit={usd.format(bybit.monthlyActualCost)} />
            <ComparisonRow label="每年實際成本" current={usd.format(current.annualActualCost)} bybit={usd.format(bybit.annualActualCost)} />
          </tbody>
        </table>
      </div>

      <div className="mt-8 border-l-2 border-gold bg-[#101010] p-6" aria-live="polite">
        <p className="text-base font-semibold leading-8 text-white">{outcomeText}</p>
        <p className="mt-2 text-xs leading-6 text-white/42">比較結果未計入資金費率、滑價、提領費用、平台幣價格波動或個別活動條件。</p>
      </div>
    </div>
  );
}

function NumberField({ label, value, min, max, step, onChange, suffix }: { label: string; value: number; min: number; max?: number; step: number; onChange: (value: number) => void; suffix: string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-white">
        {label}
        <span className="text-xs font-normal text-white/42">{suffix}</span>
      </span>
      <input type="number" inputMode="decimal" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="calculator-input mt-2 w-full" />
    </label>
  );
}

function ComparisonRow({ label, current, bybit }: { label: string; current: string; bybit: string }) {
  return <tr><td>{label}</td><td>{current}</td><td>{bybit}</td></tr>;
}
