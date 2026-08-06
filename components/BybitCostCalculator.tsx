"use client";

import { useState } from "react";
import { ExternalLink } from "@/components/ExternalLink";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";
import { useCurrency, usePreferences } from "@/components/PreferencesProvider";
import { formatVolume, getBiBeckRebateTier, getNextBiBeckRebateTier } from "@/config/bibeck-rebate-tiers";
import { BYBIT_VIP_TIERS, type BybitVipTier } from "@/config/bybit-vip-tiers";
import { COMPARISON_ROWS, type ComparisonPlan, type ComparisonValues } from "@/config/comparison-rows";
import { exchangeRatePolicy } from "@/config/currencies";
import { BYBIT_FEE_STRUCTURE, REBATE_APPLICATION_URL } from "@/config/links";
import { rebateReviewPolicy } from "@/config/rebate-review-policy";
import { convertCurrency, formatConvertedCurrency } from "@/lib/currency";
import { estimateBybitVipTier, resolveBybitVipTier } from "@/lib/bybit-tiers";
import { calculateCostComparisonBars, calculateTierProgress, calculateTradingCostComparison } from "@/lib/trading-cost";

type ProductId = "spot" | "usdtPerpetual" | "usdcContract";
type OrderRole = "maker" | "taker";
type Mode = "auto" | "manual";
type RebateMode = "auto" | "custom";

const planMeta: Record<ComparisonPlan, { code: string; title: string; featured?: boolean }> = {
  baseline: { code: "A", title: "一般狀況" }, vip: { code: "B", title: "VIP" }, bibeck: { code: "C", title: "VIP＋BiBeck 返傭", featured: true },
};
const planOrder: ComparisonPlan[] = ["baseline", "vip", "bibeck"];

function rateFor(tier: BybitVipTier, product: ProductId, role: OrderRole): number { return tier.fees[product][role] ?? 0; }
function percent(rate: number): string { return `${(rate * 100).toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}%`; }
function nextVipTier(tier: BybitVipTier): BybitVipTier | null { const index = BYBIT_VIP_TIERS.findIndex((item) => item.id === tier.id); return BYBIT_VIP_TIERS[index + 1] ?? null; }

export function BybitCostCalculator() {
  const { currency } = useCurrency();
  const { t } = usePreferences();
  const [product, setProduct] = useState<ProductId>("usdtPerpetual");
  const [role, setRole] = useState<OrderRole>("taker");
  const [volume, setVolume] = useState(1_000_000);
  const [vipMode, setVipMode] = useState<Mode>("auto");
  const [manualVipId, setManualVipId] = useState("vip-0");
  const [rebateMode, setRebateMode] = useState<RebateMode>("auto");
  const [customRebatePercent, setCustomRebatePercent] = useState(20);
  const [customFeeEnabled, setCustomFeeEnabled] = useState(false);
  const [customFeePercent, setCustomFeePercent] = useState(0.055);

  const estimatedVip = estimateBybitVipTier(volume);
  const selectedVip = resolveBybitVipTier(vipMode, volume, manualVipId);
  const upcomingVip = nextVipTier(estimatedVip);
  const vipProgress = calculateTierProgress(volume, estimatedVip.minThirtyDayVolume, upcomingVip?.minThirtyDayVolume ?? null);
  const estimatedTier = getBiBeckRebateTier(volume);
  const nextTier = getNextBiBeckRebateTier(estimatedTier.id);
  const tierProgress = calculateTierProgress(volume, estimatedTier.minVolume ?? 0, nextTier?.minVolume ?? null);
  const rebateRate = rebateMode === "auto" ? estimatedTier.rebateRate ?? 0 : Math.min(1, Math.max(0, customRebatePercent / 100));
  const baselineRate = rateFor(BYBIT_VIP_TIERS[0], product, role);
  const vipRate = customFeeEnabled ? Math.max(0, customFeePercent) / 100 : rateFor(selectedVip, product, role);
  const result = calculateTradingCostComparison({ thirtyDayVolume: volume, baselineFeeRate: baselineRate, vipFeeRate: vipRate, rebateRate });
  const bars = calculateCostComparisonBars(result);
  const displayMoney = (amount: number) => formatConvertedCurrency(amount, currency);
  const displayVolume = convertCurrency(volume, "USDT", currency) ?? 0;
  const na = "—";

  const plans: Record<ComparisonPlan, ComparisonValues> = {
    baseline: { plan:"一般狀況", vipTier:"無 VIP", bibeckTier:na, feeRate:percent(baselineRate), vipSavings:na, rebateRate:na, rebateAmount:na, actualCost:displayMoney(result.baselineFee), totalSavings:na, annualCost:displayMoney(result.annualBaselineCost), annualSavings:na, effectiveRate:percent(baselineRate), costReduction:na },
    vip: { plan:"VIP", vipTier:selectedVip.label, bibeckTier:na, feeRate:percent(vipRate), vipSavings:displayMoney(result.vipSavings), rebateRate:na, rebateAmount:na, actualCost:displayMoney(result.vipFee), totalSavings:displayMoney(result.vipSavings), annualCost:displayMoney(result.annualVipCost), annualSavings:displayMoney(result.annualVipSavings), effectiveRate:percent(vipRate), costReduction:result.baselineFee ? percent(result.vipSavings/result.baselineFee) : "0%" },
    bibeck: { plan:"VIP＋BiBeck 返傭", vipTier:selectedVip.label, bibeckTier:rebateMode === "auto" ? estimatedTier.name : "自訂情境", feeRate:percent(vipRate), vipSavings:displayMoney(result.vipSavings), rebateRate:percent(rebateRate), rebateAmount:displayMoney(result.rebateAmount), actualCost:displayMoney(result.netTradingCost), totalSavings:displayMoney(result.totalSavings), annualCost:displayMoney(result.annualNetCost), annualSavings:displayMoney(result.annualTotalSavings), effectiveRate:percent(result.effectiveFeeRate), costReduction:percent(result.totalSavingsPercent) },
  };

  return <div className="bybit-calculator">
    {currency !== "USDT" ? <p className="mb-6 border border-gold/25 bg-gold/[0.04] px-4 py-3 text-xs leading-5 text-white/58"><strong className="text-gold">{t("settings.rateNotice")}</strong> · {exchangeRatePolicy.updatedAt} · 計算基準為 USDT，結果換算為 {currency}。</p> : null}
    <div className="mb-8 grid gap-4 border-b border-white/10 pb-7 sm:grid-cols-[minmax(0,22rem)_1fr] sm:items-end"><Select label="交易所" value="bybit" onChange={() => undefined}><option value="bybit">Bybit</option>{["Binance","Bitget","BingX","OKX"].map((name)=><option key={name} disabled>{name} — 即將開放</option>)}</Select><div className="border-l-2 border-gold bg-black/20 px-4 py-3"><strong>Bybit</strong><p className="mt-1 text-xs text-white/48">完整費率、VIP 與 BiBeck 返傭試算</p></div></div>
    <div className="grid gap-8 xl:grid-cols-[0.88fr_1.12fr]">
      <fieldset className="grid content-start gap-5"><legend className="sr-only">Bybit 交易成本計算器輸入欄位</legend>
        <div className="grid gap-5 sm:grid-cols-2"><Select label="交易商品" value={product} onChange={(value)=>setProduct(value as ProductId)}><option value="spot">現貨</option><option value="usdtPerpetual">USDT 永續與交割合約</option><option value="usdcContract">USDC 永續與交割合約</option></Select><Select label="下單方式" value={role} onChange={(value)=>setRole(value as OrderRole)}><option value="maker">掛單 Maker</option><option value="taker">吃單 Taker</option></Select></div>
        <label><span className="flex justify-between text-sm font-medium text-white">最近 30 日交易量 <span className="text-xs text-white/42">{currency}</span></span><FormattedNumberInput key={currency} ariaLabel="最近 30 日交易量" placeholder="例如 10,000,000、10M 或 1B" value={displayVolume} onChange={(value)=>setVolume(convertCurrency(value,currency,"USDT")??0)}/><span className="mt-2 block text-xs leading-6 text-white/44">可輸入數字、千分位、M 或 B；10M＝10,000,000，1B＝1,000,000,000。</span></label>
        <ModeField title="Bybit VIP 等級" mode={vipMode} setMode={setVipMode}><p className="text-sm text-white/72">依交易量推估：<strong className="text-gold">{estimatedVip.label}</strong></p>{vipMode === "manual" ? <Select label="選擇 VIP 等級" value={manualVipId} onChange={setManualVipId}>{BYBIT_VIP_TIERS.map((tier)=><option key={tier.id} value={tier.id}>{tier.label}</option>)}</Select> : null}<TierProgress label="Bybit VIP 下一級進度" current={`${estimatedVip.label}｜${formatVolume(volume)} USDT`} next={upcomingVip ? `${upcomingVip.label}｜門檻 ${formatVolume(upcomingVip.minThirtyDayVolume)} USDT｜尚差 ${formatVolume(vipProgress.remaining)} USDT` : "已達目前推估的最高 VIP 等級"} percentage={vipProgress.percentage}/><p className="text-xs leading-6 text-white/42">Bybit VIP 等級為依目前輸入資料推估，實際等級可能受交易商品、資產規模、帳戶條件及 Bybit 最新規則影響，最終以 Bybit 帳戶顯示為準。</p></ModeField>
        <div className="mode-field"><p className="text-sm font-semibold">BiBeck 返傭</p><div className="mode-toggle mt-3" role="group" aria-label="BiBeck 返傭試算模式"><button type="button" aria-pressed={rebateMode === "auto"} onClick={()=>setRebateMode("auto")}>依交易量自動推估</button><button type="button" aria-pressed={rebateMode === "custom"} onClick={()=>setRebateMode("custom")}>自訂情境試算</button></div>{rebateMode === "custom" ? <div className="mt-4"><Select label="模擬返傭比例" value={String(customRebatePercent)} onChange={(value)=>setCustomRebatePercent(Number(value))}>{[0,20,25,30,35,40].map((rate)=><option key={rate} value={rate}>{rate}%</option>)}</Select><NumberInput label="自訂比例" value={customRebatePercent} setValue={setCustomRebatePercent}/>{customRebatePercent>40 ? <p className="mt-3 text-xs leading-6 text-gold">此比例僅供特殊合作情境試算，不代表實際核准結果。40% 以上比例依合作條件個別審核。</p> : null}</div> : <div className="mt-4 grid gap-2 text-sm leading-7 text-white/72"><p>目前推估級距：<strong className="text-gold">{estimatedTier.name}</strong></p><p>推估返傭比例：<strong className="text-gold">{percent(estimatedTier.rebateRate??0)}</strong></p><p>適用交易量：{estimatedTier.volumeLabel}</p><TierProgress label="BiBeck 返傭下一級進度" current={`${estimatedTier.name}｜${percent(estimatedTier.rebateRate??0)}｜${formatVolume(volume)} USDT`} next={nextTier ? `${nextTier.name}｜${percent(nextTier.rebateRate??0)}｜門檻 ${formatVolume(nextTier.minVolume??0)} USDT｜尚差 ${formatVolume(tierProgress.remaining)} USDT` : "已達最高公開返傭級距"} percentage={tierProgress.percentage}/><p className="text-xs text-white/42">代理、社群、團隊或其他合作需求，可申請 40% 以上特殊合作方案。</p><p className="text-xs text-white/42">此為級距推估，實際比例須完成申請與資料核對後，以通知結果為準。</p></div>}</div>
        <ModeField title="手續費率" mode={customFeeEnabled?"manual":"auto"} setMode={(mode)=>setCustomFeeEnabled(mode==="manual")}>{customFeeEnabled ? <NumberInput label="自訂 VIP 費率（%）" value={customFeePercent} setValue={setCustomFeePercent}/> : <p className="text-sm">目前套用：<strong className="text-gold">{percent(vipRate)}</strong></p>}</ModeField>
      </fieldset>
      <section className="comparison-results min-w-0" aria-live="polite"><p className="eyebrow">交易成本比較</p><p className="comparison-swipe-hint mt-3 text-xs text-white/48">左右滑動比較三種成本</p><ComparisonMatrix plans={plans}/><MobileComparisonCards plans={plans}/><CostBars bars={bars} displayMoney={displayMoney}/><div className="savings-summary"><p className="text-sm text-secondary">30 日預估合計節省</p><p className="mt-2 break-words text-4xl font-semibold text-gold sm:text-5xl">{displayMoney(result.totalSavings)}</p><p className="mt-4 text-sm text-white/68">年度預估合計節省 {displayMoney(result.annualTotalSavings)}</p></div><ExternalLink href={REBATE_APPLICATION_URL} sponsored className="mt-6 w-full" aria-label="前往 BiBeck Bybit 返傭申請頁">取得 Bybit 返傭帳號</ExternalLink><p className="mt-3 text-xs leading-6 text-white/44">標準交易者可申請 20% 返傭；較高交易量可依公開級距申請 25%～40%。特殊合作可申請 40% 以上，實際結果以資料核對與通知為準。</p></section>
    </div>
    <div className="mt-8 border-t border-white/10 pt-7 text-xs leading-6 text-white/44"><details className="mb-6 border border-white/10 bg-black/20 p-4"><summary className="cursor-pointer font-semibold text-white">計算公式與年度推估方式</summary><div className="mt-3 grid gap-1"><p>原始手續費＝交易量 × VIP 0 基準費率</p><p>VIP 後手續費＝交易量 × 實際 VIP 費率</p><p>BiBeck 返傭＝VIP 後實際手續費 × 返傭比例</p><p>返傭後成本＝VIP 後手續費 − 返傭</p><p>合計節省＝原始手續費 − 返傭後成本</p><p>年度推估＝30 日結果 × 12</p></div></details><p>本試算依輸入的最近 30 日交易量、交易商品、Maker／Taker 類型、VIP 費率及 BiBeck 公開返傭級距估算。實際結果可能受商品、地區、帳戶條件、活動、有效手續費、BiBeck 級距審核結果及 Bybit 與合作系統最終紀錄影響。</p><p className="mt-2">計算器只提供級距推估。使用者可主動提交級距申請；若未主動申請，BiBeck 於{rebateReviewPolicy.reviewSchedule}統一檢視。所有變更以資料核對、返傭設定與完成通知為準。</p><p className="mt-2">BiBeck 為獨立第三方平台，並非 Bybit 官方網站或代表。返傭是部分交易手續費回饋，不是投資收益，也不保證返傭、節省或級距核准。</p><p className="mt-2">費率來源：<ExternalLink href={BYBIT_FEE_STRUCTURE} variant="ghost" className="!min-h-0 !px-0 !py-0 !tracking-normal">Bybit Trading Fee Structure</ExternalLink></p></div>
  </div>;
}

function ComparisonMatrix({plans}:{plans:Record<ComparisonPlan,ComparisonValues>}) { return <div className="comparison-matrix mt-5" role="table" aria-label="交易成本方案比較"><div className="comparison-matrix-corner" role="columnheader">比較項目</div>{planOrder.map((plan)=><div key={plan} className={`comparison-matrix-head ${plan==="bibeck"?"featured":""}`} role="columnheader"><span className="comparison-badge-slot">{planMeta[plan].featured?<span>推薦</span>:null}</span><small>{planMeta[plan].code}</small><strong>{planMeta[plan].title}</strong></div>)}{COMPARISON_ROWS.map((row)=><div className="comparison-matrix-row" role="row" key={row.key}><div role="rowheader" className="comparison-label">{row.label}</div>{planOrder.map((plan)=><div role="cell" key={plan} className={`comparison-value ${plan==="bibeck"?"featured":""}`} data-comparison-row={row.key} data-comparison-plan={plan}>{plans[plan][row.key]}</div>)}</div>)}</div>; }
function MobileComparisonCards({plans}:{plans:Record<ComparisonPlan,ComparisonValues>}) { return <div className="scenario-comparison mt-5" role="region" tabIndex={0} aria-label="交易成本方案比較">{planOrder.map((plan)=><article key={plan} className={`scenario-card ${plan==="bibeck"?"scenario-card-featured":""}`}><div className="comparison-badge-slot">{planMeta[plan].featured?<span>推薦</span>:null}</div><span className="font-mono text-xs text-gold">{planMeta[plan].code}</span><h3 className="scenario-card-title mt-3 font-semibold text-white">{planMeta[plan].title}</h3><dl className="mt-5 divide-y divide-white/8">{COMPARISON_ROWS.map((row)=><div key={row.key} className="scenario-row grid grid-cols-[1fr_auto] items-center gap-3 py-3" data-comparison-row={row.key} data-comparison-plan={plan}><dt className="text-xs leading-5 text-white/44">{row.label}</dt><dd className="text-right font-mono text-xs leading-5 text-white">{plans[plan][row.key]}</dd></div>)}</dl></article>)}</div>; }
function CostBars({bars,displayMoney}:{bars:ReturnType<typeof calculateCostComparisonBars>;displayMoney:(value:number)=>string}) { const labels={baseline:"A｜一般狀況",vip:"B｜VIP",bibeck:"C｜VIP＋BiBeck 返傭"} as const; return <section className="cost-bars mt-7" aria-label="30 日實際交易成本比較"><h3 className="text-lg font-semibold text-white">30 日實際交易成本比較</h3><p className="mt-2 text-xs leading-5 text-white/44">以一般狀況為基準，比較 VIP 與 BiBeck 返傭後的實際成本。</p><div className="mt-5 grid gap-5">{bars.map((bar)=><div key={bar.id} className={`cost-bar cost-bar-${bar.id}`}><div className="flex flex-wrap justify-between gap-2 text-xs"><strong>{labels[bar.id]}</strong><span>{displayMoney(bar.cost)}｜{bar.id==="baseline"?"基準 100%":`降低 ${bar.reductionPercent.toFixed(2)}%`}</span></div><div className="cost-bar-track"><span style={{width:`${bar.widthPercent}%`}}/></div></div>)}</div></section>; }
function TierProgress({label,current,next,percentage}:{label:string;current:string;next:string;percentage:number}) { const safe=Math.min(100,Math.max(0,Number.isFinite(percentage)?percentage:0)); return <div className="tier-progress"><div className="flex justify-between gap-3 text-xs"><span>{current}</span><span className="tabular-nums">{safe.toFixed(0)}%</span></div><div className="tier-progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(safe.toFixed(0))}><span style={{width:`${safe}%`}}/></div><p className="mt-2 text-xs leading-5 text-white/48">{next}</p></div>; }
function ModeField({title,mode,setMode,children}:{title:string;mode:Mode;setMode:(mode:Mode)=>void;children:React.ReactNode}) { return <div className="mode-field"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold">{title}</p><div className="mode-toggle" role="group" aria-label={`${title}模式`}><button type="button" aria-pressed={mode==="auto"} onClick={()=>setMode("auto")}>自動推估</button><button type="button" aria-pressed={mode==="manual"} onClick={()=>setMode("manual")}>手動調整</button></div></div><div className="mt-4 grid gap-3">{children}</div></div>; }
function Select({label,value,onChange,children}:{label:string;value:string;onChange:(value:string)=>void;children:React.ReactNode}) { return <label><span className="text-sm font-medium text-white">{label}</span><select value={value} onChange={(event)=>onChange(event.target.value)} className="calculator-input mt-2 w-full">{children}</select></label>; }
function NumberInput({label,value,setValue}:{label:string;value:number;setValue:(value:number)=>void}) { return <label><span className="text-sm text-white">{label}</span><input type="number" min="0" max="100" step="0.0001" inputMode="decimal" value={value} onChange={(event)=>setValue(Number(event.target.value))} className="calculator-input mt-2 w-full"/></label>; }
