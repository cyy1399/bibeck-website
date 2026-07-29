"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ExchangeData, ExchangeProductFee, VipTier } from "@/config/exchanges";
import { calculateTradingCost } from "@/lib/trading-cost";

const usd = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function toDisplayPercent(rate: number | null | undefined): number {
  return rate === null || rate === undefined ? 0 : Number((rate * 100).toFixed(6));
}

function resolveTierRate(product: ExchangeProductFee, tier: VipTier | undefined, role: "maker" | "taker"): number | null {
  if (!tier) return product.fee[role];
  if (product.category === "spot") {
    return role === "maker" ? tier.spotMaker ?? product.fee.maker : tier.spotTaker ?? product.fee.taker;
  }
  if (product.category === "futures") {
    return role === "maker" ? tier.futuresMaker ?? product.fee.maker : tier.futuresTaker ?? product.fee.taker;
  }
  return product.fee[role];
}

export function PlatformFeeCalculator({ exchange }: { exchange: ExchangeData }) {
  const initialProduct = exchange.products.find((product) => product.id === exchange.futuresSummaryProductId) ?? exchange.products[0];
  const [productId, setProductId] = useState(initialProduct.id);
  const [orderRole, setOrderRole] = useState<"maker" | "taker">("taker");
  const [monthlyVolume, setMonthlyVolume] = useState(100000);
  const [feePercent, setFeePercent] = useState(toDisplayPercent(initialProduct.fee.taker));
  const [vipLevel, setVipLevel] = useState(exchange.vipTiers[0]?.level ?? "");
  const [rebatePercent, setRebatePercent] = useState(toDisplayPercent(exchange.serviceStatus === "rebate-supported" ? exchange.rebateRate : 0));

  const selectedProduct = exchange.products.find((product) => product.id === productId) ?? initialProduct;
  const selectedTier = exchange.vipTiers.find((tier) => tier.level === vipLevel);

  function handleProductChange(nextProductId: string) {
    const nextProduct = exchange.products.find((product) => product.id === nextProductId) ?? initialProduct;
    setProductId(nextProductId);
    setFeePercent(toDisplayPercent(resolveTierRate(nextProduct, selectedTier, orderRole)));
  }

  function handleOrderRoleChange(nextRole: "maker" | "taker") {
    setOrderRole(nextRole);
    setFeePercent(toDisplayPercent(resolveTierRate(selectedProduct, selectedTier, nextRole)));
  }

  function handleVipLevelChange(nextLevel: string) {
    const nextTier = exchange.vipTiers.find((tier) => tier.level === nextLevel);
    setVipLevel(nextLevel);
    setFeePercent(toDisplayPercent(resolveTierRate(selectedProduct, nextTier, orderRole)));
  }

  const result = useMemo(
    () =>
      calculateTradingCost({
        monthlyVolume,
        feeRate: feePercent / 100,
        rebateRate: rebatePercent / 100,
      }),
    [feePercent, monthlyVolume, rebatePercent],
  );

  return (
    <div className="calculator-shell">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <fieldset className="grid content-start gap-5">
          <legend className="sr-only">{exchange.name} 實際交易成本輸入欄位</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="交易商品" value={productId} onChange={handleProductChange}>
              {exchange.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </SelectField>
            <SelectField label="下單方式" value={orderRole} onChange={(value) => handleOrderRoleChange(value as "maker" | "taker")}>
              <option value="maker">掛單 Maker</option>
              <option value="taker">吃單 Taker</option>
            </SelectField>
          </div>

          <NumberField label="每月交易量" hint="USD" value={monthlyVolume} min={0} step={1000} onChange={setMonthlyVolume} />

          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField label="手續費率" hint="%" value={feePercent} min={0} step={0.001} onChange={setFeePercent} />
            <SelectField label="VIP 等級" value={vipLevel} onChange={handleVipLevelChange}>
              {exchange.vipTiers.length > 0 ? (
                exchange.vipTiers.map((tier) => <option key={tier.level} value={tier.level}>{tier.level}</option>)
              ) : (
                <option value="">VIP 資料整理中</option>
              )}
            </SelectField>
          </div>

          <NumberField label={exchange.serviceStatus === "rebate-supported" ? "BiBeck 返傭比例" : "返傭比例（自行輸入）"} hint="%" value={rebatePercent} min={0} max={100} step={1} onChange={setRebatePercent} />

          <p className="text-xs leading-6 text-white/44">
            {exchange.serviceStatus === "rebate-supported" && exchange.rebateRate === null
              ? "BiBeck 目前適用返傭比例尚未寫入設定，請輸入你實際確認的比例。"
              : exchange.serviceStatus === "information-only"
                ? "BiBeck 不會自動替此交易所加入返傭；預設為 0%，可依你的既有方案自行輸入。"
                : "返傭比例由集中設定檔帶入，實際資格與比例仍以合作方案紀錄為準。"}
          </p>
        </fieldset>

        <div className="calculator-results" aria-live="polite">
          <p className="eyebrow">依照輸入條件估算</p>
          <div className="mt-5 border-b border-gold/24 pb-6">
            <p className="text-sm text-secondary">每月實際成本</p>
            <p className="mt-2 text-4xl font-semibold text-gold sm:text-5xl">{usd.format(result.monthlyActualCost)}</p>
          </div>
          <dl className="mt-2 divide-y divide-white/10">
            <ResultRow label="每月原始手續費" value={usd.format(result.monthlyRawFee)} />
            <ResultRow label="每月預估返傭" value={usd.format(result.monthlyRebate)} highlight />
            <ResultRow label="每月實際成本" value={usd.format(result.monthlyActualCost)} />
            <ResultRow label="每年實際成本" value={usd.format(result.annualActualCost)} />
            <ResultRow label="有效手續費率" value={(result.effectiveFeeRate * 100).toFixed(4) + "%"} />
          </dl>
          <p className="mt-5 text-xs leading-6 text-white/42">以上結果僅為估算，實際費率、交易量與返傭金額以交易所及返傭系統紀錄為準。</p>
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-white">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="calculator-input mt-2 w-full">
        {children}
      </select>
    </label>
  );
}

function NumberField({ label, hint, value, min, max, step, onChange }: { label: string; hint: string; value: number; min: number; max?: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-white">
        {label}
        <span className="text-xs font-normal text-white/42">{hint}</span>
      </span>
      <input type="number" inputMode="decimal" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="calculator-input mt-2 w-full" />
    </label>
  );
}

function ResultRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-5 py-4">
      <dt className="text-sm text-secondary">{label}</dt>
      <dd className={"font-mono text-sm sm:text-base " + (highlight ? "text-gold" : "text-white")}>{value}</dd>
    </div>
  );
}