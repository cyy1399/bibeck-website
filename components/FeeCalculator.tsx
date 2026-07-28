"use client";

import { useState } from "react";

type FeeCalculatorProps = {
  compact?: boolean;
};

const usd = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function safeNumber(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function FeeCalculator({ compact = false }: FeeCalculatorProps) {
  const [monthlyVolume, setMonthlyVolume] = useState(100000);
  const [makerShare, setMakerShare] = useState(0);
  const [makerFeeRate, setMakerFeeRate] = useState(0.02);
  const [takerFeeRate, setTakerFeeRate] = useState(0.055);
  const [rebatePercentage, setRebatePercentage] = useState(20);
  const [monthlyFundingCost, setMonthlyFundingCost] = useState(0);

  const volume = safeNumber(monthlyVolume);
  const makerRatio = compact ? 0 : Math.min(100, Math.max(0, safeNumber(makerShare))) / 100;
  const takerRatio = 1 - makerRatio;
  const makerFees = volume * makerRatio * (safeNumber(makerFeeRate) / 100);
  const takerFees = volume * takerRatio * (safeNumber(takerFeeRate) / 100);
  const monthlyTradingFees = makerFees + takerFees;
  const monthlyFees = monthlyTradingFees + (compact ? 0 : safeNumber(monthlyFundingCost));
  const estimatedRebate = monthlyTradingFees * (Math.min(100, safeNumber(rebatePercentage)) / 100);
  const annualSavings = estimatedRebate * 12;
  const effectiveMonthlyCost = Math.max(0, monthlyFees - estimatedRebate);

  return (
    <div className={`calculator-shell ${compact ? "calculator-compact" : ""}`}>
      <div className={`grid gap-8 ${compact ? "lg:grid-cols-[1fr_0.9fr]" : "lg:grid-cols-[1.05fr_0.95fr]"}`}>
        <fieldset className="grid content-start gap-5">
          <legend className="sr-only">交易成本計算器輸入欄位</legend>
          <NumberField label="每月交易量" hint="USD" value={monthlyVolume} min={0} step={1000} onChange={setMonthlyVolume} />
          {!compact ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField label="Maker 成交占比" hint="%" value={makerShare} min={0} max={100} step={1} onChange={setMakerShare} />
              <NumberField label="Maker 手續費率" hint="%" value={makerFeeRate} min={0} step={0.001} onChange={setMakerFeeRate} />
            </div>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField label="Taker 手續費率" hint="%" value={takerFeeRate} min={0} step={0.001} onChange={setTakerFeeRate} />
            <NumberField label="預估返傭比例" hint="%" value={rebatePercentage} min={0} max={100} step={1} onChange={setRebatePercentage} />
          </div>
          {!compact ? (
            <NumberField label="每月預估資金費用" hint="USD" value={monthlyFundingCost} min={0} step={10} onChange={setMonthlyFundingCost} />
          ) : null}
          <p className="text-xs leading-6 text-white/40">預設返傭比例僅供試算，不代表實際方案。實際費率、返傭資格與可返還項目以 Bybit 帳戶、合作條款及返傭後台為準。</p>
        </fieldset>

        <div className="calculator-results" aria-live="polite">
          <p className="eyebrow">使用 BiBeck 的預估節省</p>
          <div className="mt-5 border-b border-gold/24 pb-6">
            <p className="text-sm text-secondary">預估年度節省</p>
            <p className="mt-2 text-4xl font-semibold text-gold sm:text-5xl">{usd.format(annualSavings)}</p>
          </div>
          <dl className="mt-2 divide-y divide-white/10">
            <ResultRow label="預估每月總成本" value={usd.format(monthlyFees)} />
            <ResultRow label="預估每月返傭" value={usd.format(estimatedRebate)} highlight />
            <ResultRow label="返傭後預估成本" value={usd.format(effectiveMonthlyCost)} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max?: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-white">
        {label}
        <span className="text-xs font-normal text-white/38">{hint}</span>
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="calculator-input mt-2 w-full"
      />
    </label>
  );
}

function ResultRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <dt className="text-sm text-secondary">{label}</dt>
      <dd className={`font-mono text-base ${highlight ? "text-gold" : "text-white"}`}>{value}</dd>
    </div>
  );
}
