"use client";

import { useState } from "react";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";
import { BIBECK_REBATE_TIERS, formatRebateVolumeRange } from "@/config/bibeck-rebate-tiers";
import { BYBIT_VIP_TIERS, type BybitVipTier } from "@/config/bybit-vip-tiers";
import { calculateTierProgress, calculateTradingCostComparison } from "@/lib/trading-cost";
import { professionalPartnershipMailto } from "@/config/brand";
import { estimateBybitVipTier, negotiatedRebateRate, recommendBiBeckTier, resolveBybitVipTier } from "@/lib/bybit-tiers";
import { useCurrency, usePreferences } from "@/components/PreferencesProvider";
import { convertCurrency, formatConvertedCurrency } from "@/lib/currency";
import { exchangeRatePolicy } from "@/config/currencies";

type ProductId = "spot" | "usdtPerpetual" | "usdcContract";
type OrderRole = "maker" | "taker";
type Mode = "auto" | "manual";

const volumeNumber = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 });

function rateFor(tier: BybitVipTier, product: ProductId, role: OrderRole): number {
  return tier.fees[product][role] ?? 0;
}

function percent(rate: number): string {
  return (rate * 100).toFixed(4).replace(/0+$/, "").replace(/\.$/, "") + "%";
}

export function BybitCostCalculator() {
  const { currency } = useCurrency();
  const { t } = usePreferences();
  const [product, setProduct] = useState<ProductId>("usdtPerpetual");
  const [role, setRole] = useState<OrderRole>("taker");
  const [volume, setVolume] = useState(1_000_000);
  const [vipMode, setVipMode] = useState<Mode>("auto");
  const [manualVipId, setManualVipId] = useState("vip-0");
  const [rebateMode, setRebateMode] = useState<Mode>("auto");
  const [manualRebateId, setManualRebateId] = useState("standard");
  const [negotiatedPercent, setNegotiatedPercent] = useState(40);
  const [customFeeEnabled, setCustomFeeEnabled] = useState(false);
  const [customFeePercent, setCustomFeePercent] = useState(0.055);

  const estimatedVip = estimateBybitVipTier(volume);
  const selectedVip = resolveBybitVipTier(vipMode, volume, manualVipId);
  const recommendedRebate = recommendBiBeckTier(volume);
  const selectedRebate = rebateMode === "auto" ? recommendedRebate : BIBECK_REBATE_TIERS.find((tier) => tier.id === manualRebateId) ?? BIBECK_REBATE_TIERS[0];
  const baselineRate = rateFor(BYBIT_VIP_TIERS[0], product, role);
  const vipRate = customFeeEnabled ? Math.max(0, customFeePercent) / 100 : rateFor(selectedVip, product, role);
  const rebateRate = selectedRebate.isNegotiated ? negotiatedRebateRate(negotiatedPercent, true) : selectedRebate.rebateRate;
  const result = calculateTradingCostComparison({ thirtyDayVolume: volume, baselineFeeRate: baselineRate, vipFeeRate: vipRate, rebateRate });

  const vipIndex = BYBIT_VIP_TIERS.findIndex((tier) => tier.id === estimatedVip.id);
  const nextVip = BYBIT_VIP_TIERS[vipIndex + 1] ?? null;
  const vipProgress = calculateTierProgress(volume, estimatedVip.minThirtyDayVolume, nextVip?.minThirtyDayVolume ?? null);
  const rebateIndex = BIBECK_REBATE_TIERS.findIndex((tier) => tier.id === recommendedRebate.id);
  const nextRebate = BIBECK_REBATE_TIERS[rebateIndex + 1] ?? null;
  const rebateProgress = calculateTierProgress(volume, recommendedRebate.minThirtyDayVolume, nextRebate?.minThirtyDayVolume ?? null);

  const bars = [
    ["無 VIP、無返傭", result.baselineFee],
    ["有 VIP、無返傭", result.vipFee],
    ["有 VIP、有 BiBeck 返傭", result.actualCost],
  ] as const;
  const maxCost = Math.max(1, result.baselineFee, result.vipFee, result.actualCost);
  const displayMoney = (amount: number) => formatConvertedCurrency(amount, currency);
  const displayVolume = convertCurrency(volume, "USDT", currency);

  return (
    <div className="bybit-calculator">
      {currency !== "USDT" ? <p className="mb-6 border border-gold/25 bg-gold/[0.04] px-4 py-3 text-xs leading-5 text-white/58"><strong className="text-gold">{t("settings.rateNotice")}</strong> · {exchangeRatePolicy.updatedAt} · 計算基準仍為 USDT，顯示結果已換算為 {currency}。</p> : null}
      <div className="mb-8 grid gap-4 border-b border-white/10 pb-7 sm:grid-cols-[minmax(0,22rem)_1fr] sm:items-end">
        <Select label={t("common.exchange")} value="bybit" onChange={() => undefined}>
          <option value="bybit">Bybit</option>
          <option value="binance" disabled>Binance — 即將開放</option>
          <option value="bitget" disabled>Bitget — 即將開放</option>
          <option value="bingx" disabled>BingX — 即將開放</option>
          <option value="okx" disabled>OKX — 即將開放</option>
        </Select>
        <div className="border-l-2 border-gold bg-black/20 px-4 py-3"><p className="text-sm font-semibold text-white">Bybit</p><p className="mt-1 text-xs leading-5 text-white/48">完整費率、VIP 與 BiBeck 返傭計算 · <span className="text-gold">返傭支援</span></p></div>
      </div>
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid content-start gap-6">
          <fieldset className="grid gap-5">
            <legend className="sr-only">Bybit 手續費與返傭計算器輸入欄位</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Select label={t("calculator.product")} value={product} onChange={(value) => setProduct(value as ProductId)}>
                <option value="spot">{t("calculator.spot")}</option><option value="usdtPerpetual">{t("calculator.usdtContract")}</option><option value="usdcContract">{t("calculator.usdcContract")}</option>
              </Select>
              <Select label={t("calculator.orderRole")} value={role} onChange={(value) => setRole(value as OrderRole)}>
                <option value="maker">{t("common.maker")}</option><option value="taker">{t("common.taker")}</option>
              </Select>
            </div>
            <label className="block">
              <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-white">{t("common.volume")} <span className="text-xs font-normal text-white/42">{currency}</span></span>
              <FormattedNumberInput key={currency} ariaLabel={t("common.volume")} placeholder="1,000,000" value={displayVolume} onChange={(value) => setVolume(convertCurrency(value, currency, "USDT"))} />
              <span className="mt-2 block text-xs leading-6 text-white/44">{t("calculator.volumeHelp")}</span>
            </label>

            <ModeField title={`Bybit ${t("calculator.vip")}`} mode={vipMode} setMode={setVipMode} autoLabel={t("calculator.auto")} manualLabel={t("calculator.manual")}>
              {vipMode === "manual" ? <Select label="選擇 VIP 等級" value={manualVipId} onChange={setManualVipId}>{BYBIT_VIP_TIERS.map((tier) => <option key={tier.id} value={tier.id}>{tier.label}</option>)}</Select> : <p className="text-sm text-white/72">依 30 日交易量推估：<strong className="text-gold">{estimatedVip.label}</strong></p>}
              <p className="text-xs leading-6 text-white/42">實際 VIP 等級仍可能受到資產條件、平台政策與每日系統更新影響，請以 Bybit 帳戶顯示為準。</p>
            </ModeField>

            <ModeField title={t("calculator.rebateMode")} mode={rebateMode} setMode={setRebateMode} autoLabel={t("calculator.estimated")} manualLabel={t("calculator.scenario")}>
              {rebateMode === "manual" ? <Select label="選擇返傭方案" value={manualRebateId} onChange={setManualRebateId}>{BIBECK_REBATE_TIERS.map((tier) => <option key={tier.id} value={tier.id}>{tier.name} {Math.round(tier.rebateRate * 100)}%{tier.isNegotiated ? "+" : ""}</option>)}</Select> : <p className="text-sm text-white/72">依目前交易量推估：<strong className="text-gold">{recommendedRebate.name} {Math.round(recommendedRebate.rebateRate * 100)}%{recommendedRebate.isNegotiated ? " 或以上" : ""}</strong></p>}
              <p className="text-xs leading-6 text-white/52">適用交易量：{formatRebateVolumeRange(selectedRebate)}</p>
              {selectedRebate.isNegotiated ? <div className="grid gap-3 rounded-sm border border-gold/25 bg-black/20 p-4"><NumberInput label="協商返傭比例" value={negotiatedPercent} setValue={setNegotiatedPercent} min={40} max={100} step={1} suffix="%" /><p className="text-xs text-gold">僅供試算，不代表正式核准比例。</p><a href={professionalPartnershipMailto} className="button-secondary w-full">洽談專業合作方案</a><p className="text-xs leading-6 text-white/42">40% 或以上方案僅提供給符合條件的高額交易量個體戶、專業交易者、代理或合作夥伴，實際比例須經人工評估與專業協商。</p></div> : null}
              <p className="text-xs leading-6 text-white/42">{rebateMode === "manual" ? "此功能僅供比較不同返傭比例下的交易成本，不代表帳戶實際核准比例。" : "一般申請帳戶初始仍為標準交易者 20%，實際級距會在每月 1 日依前一完整月份交易量審核後生效。"}</p>
            </ModeField>

            <ModeField title={t("calculator.feeRate")} mode={customFeeEnabled ? "manual" : "auto"} setMode={(mode) => setCustomFeeEnabled(mode === "manual")} autoLabel={t("calculator.auto")} manualLabel={t("calculator.manual")}>
              {customFeeEnabled ? <><NumberInput label="自訂 VIP 費率" value={customFeePercent} setValue={setCustomFeePercent} min={0} step={0.0001} suffix="%" /><p className="text-xs leading-6 text-white/42">自訂費率僅供試算，不會改變實際 Bybit 帳戶費率。</p></> : <p className="text-sm text-white/72">目前套用費率：<strong className="font-mono text-gold">{percent(vipRate)}</strong></p>}
            </ModeField>
          </fieldset>

          <div className="tier-analysis">
            <p className="eyebrow">等級分析</p>
            <Progress label="Bybit VIP" current={`依目前交易量推估：${estimatedVip.label}`} next={nextVip ? `距離 ${nextVip.label} 還差：${volumeNumber.format(vipProgress.remaining)} USDT` : "目前已達可推估的最高 VIP 等級"} percentage={vipProgress.percentage} />
            <Progress label="BiBeck 返傭" current={`依交易量推估級距：${recommendedRebate.name} ${Math.round(recommendedRebate.rebateRate * 100)}%${recommendedRebate.isNegotiated ? "+" : ""}`} next={nextRebate ? nextRebate.isNegotiated ? "下一級為專業合作方案，須人工協商與確認。" : `距離下一個參考級距還差：${volumeNumber.format(rebateProgress.remaining)} USDT` : "最高級距仍須人工評估，不會自動取得 40% 或以上。"} percentage={rebateProgress.percentage} reference />
          </div>
          <p className="text-xs leading-6 text-white/42">不同商品、掛單與吃單可能適用不同費率。若交易同時包含多種商品或下單方式，建議分開試算後加總。</p>
        </div>

        <section className="comparison-results" aria-live="polite">
          <p className="eyebrow">{t("calculator.results")}</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <ScenarioCard code="A" title={t("calculator.planA")} badge={t("calculator.noVip")} rows={[[t("calculator.feeRate"), percent(baselineRate)], [t("common.volume"), formatConvertedCurrency(Math.max(0, volume), currency)], [t("common.fee"), displayMoney(result.baselineFee)], [t("common.result"), displayMoney(result.annualBaselineCost)]]} />
            <ScenarioCard code="B" title={t("calculator.planB")} badge={t("calculator.vipNoRebate")} rows={[[t("calculator.vip"), selectedVip.label], [t("calculator.feeRate"), percent(vipRate)], [t("common.fee"), displayMoney(result.vipFee)], [t("common.result"), displayMoney(result.annualVipCost)]]} />
            <ScenarioCard featured code="C" title={t("calculator.planC")} badge={t("calculator.withRebate")} rows={[[t("calculator.vip"), selectedVip.label], [t("common.rebate"), (rebateRate * 100).toFixed(0) + "%"], [t("common.rebate"), displayMoney(result.rebate)], [t("common.result"), displayMoney(result.actualCost)], [t("calculator.feeRate"), percent(result.effectiveFeeRate)]]} />
          </div>

          <div className="savings-summary">
            <p className="text-sm text-secondary">{t("calculator.savings")}</p>
            <p className="mt-2 break-words text-4xl font-semibold text-gold sm:text-5xl">{displayMoney(result.totalSavings)}</p>
            <p className="mt-5 text-sm text-white/68">其中 BiBeck 預估返傭回饋 <strong className="text-white">{displayMoney(result.rebate)}</strong></p>
            <p className="mt-2 text-sm text-white/68">若維持目前交易量，年度預估共省下 <strong className="text-white">{displayMoney(result.annualTotalSavings)}</strong></p>
            <p className="mt-5 text-xs leading-6 text-white/42">依目前輸入條件，30 日預估共省下 {displayMoney(result.totalSavings)}，其中包含 {displayMoney(result.rebate)} 的 BiBeck 返傭回饋。</p>
          </div>

          <div className="mt-7 grid gap-5" aria-label="交易成本水平比較圖">
            {bars.map(([label, value], index) => <div key={label}><div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm"><span className="text-white/72">{label}</span><strong className="font-mono text-white">{displayMoney(value)}</strong></div><div className="h-2 overflow-hidden bg-white/8"><div className={index === 2 ? "h-full bg-gold" : "h-full bg-white/35"} style={{ width: `${Math.max(value > 0 ? 3 : 0, (value / maxCost) * 100)}%` }} /></div></div>)}
          </div>
        </section>
      </div>

      <div className="mt-8 border-t border-white/10 pt-7 text-xs leading-6 text-white/44">
        <p>{t("calculator.disclaimer")}</p>
        <p className="mt-2">返傭是部分交易手續費的回饋，不代表交易獲利，也不會降低交易本身的市場風險。依 30 日交易量顯示的 VIP 與 BiBeck 方案僅為推估或建議，實際資格可能受到資產條件、平台政策、帳戶狀態與人工審核影響。</p>
        <p className="mt-2">40% 或以上返傭方案僅適用於符合條件的高額交易量個體戶、專業交易者、代理或合作夥伴，實際比例須經人工評估與確認。BiBeck 為獨立第三方平台，並非由 Bybit 擁有、營運或官方背書；不保管使用者資產、不代替使用者下單，也不保證任何投資收益。</p>
      </div>
    </div>
  );
}

function ModeField({ title, mode, setMode, autoLabel, manualLabel, children }: { title: string; mode: Mode; setMode: (mode: Mode) => void; autoLabel: string; manualLabel: string; children: React.ReactNode }) {
  return <div className="mode-field"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-white">{title}</p><div className="mode-toggle" role="group" aria-label={`${title}模式`}><button type="button" aria-pressed={mode === "auto"} onClick={() => setMode("auto")}>{autoLabel}</button><button type="button" aria-pressed={mode === "manual"} onClick={() => setMode("manual")}>{manualLabel}</button></div></div><div className="mt-4 grid gap-3">{children}</div></div>;
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium text-white">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="calculator-input mt-2 w-full">{children}</select></label>;
}

function NumberInput({ label, value, setValue, min, max, step, suffix }: { label: string; value: number; setValue: (value: number) => void; min: number; max?: number; step: number; suffix: string }) {
  return <label><span className="flex items-baseline justify-between gap-3 text-sm text-white">{label}<span className="text-xs text-white/42">{suffix}</span></span><input type="number" inputMode="decimal" value={value} min={min} max={max} step={step} onChange={(event) => setValue(Number(event.target.value))} className="calculator-input mt-2 w-full" /></label>;
}

function Progress({ label, current, next, percentage, reference = false }: { label: string; current: string; next: string; percentage: number; reference?: boolean }) {
  return <div className="border-t border-white/10 py-5"><div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-white">{label}</strong>{reference ? <span className="text-xs text-gold">參考</span> : null}</div><p className="mt-2 text-sm text-white/72">{current}</p><p className="mt-1 text-xs leading-5 text-white/44">{next}</p><div className="mt-3 h-1.5 overflow-hidden bg-white/8"><div className="h-full bg-gold" style={{ width: `${percentage}%` }} /></div><p className="mt-2 text-right font-mono text-xs text-white/42">目前進度：{Math.round(percentage)}%</p></div>;
}

function ScenarioCard({ code, title, badge, rows, featured = false }: { code: string; title: string; badge: string; rows: [string, string][]; featured?: boolean }) {
  return <article className={`scenario-card ${featured ? "scenario-card-featured" : ""}`}><div className="flex items-center justify-between gap-3"><p className="font-mono text-xs text-gold">{code}</p>{featured ? <span className="border border-gold/40 px-2 py-1 text-[0.68rem] font-semibold text-gold">推薦</span> : null}</div><h3 className="mt-3 text-lg font-semibold leading-7 text-white">{title}</h3><p className="mt-2 text-xs text-white/42">{badge}</p><dl className="mt-5 divide-y divide-white/8">{rows.map(([label, value]) => <div key={label} className="grid gap-1 py-3"><dt className="text-xs text-secondary">{label}</dt><dd className="break-words font-mono text-sm text-white">{value}</dd></div>)}</dl></article>;
}
