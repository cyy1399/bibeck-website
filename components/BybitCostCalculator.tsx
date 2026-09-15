"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink } from "@/components/ExternalLink";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";
import { useCurrency, usePreferences } from "@/components/PreferencesProvider";
import { BYBIT_VIP_TIERS, type BybitVipTier } from "@/config/bybit-vip-tiers";
import { COMPARISON_ROWS, type ComparisonPlan, type ComparisonValues } from "@/config/comparison-rows";
import { exchangeRatePolicy } from "@/config/currencies";
import { BYBIT_FEE_STRUCTURE, LINE_OFFICIAL_URL, REBATE_APPLICATION_URL } from "@/config/links";
import { BIBECK_REBATE_ELIGIBILITY_NOTICE, formatBibeckRebateRate, getStandardBibeckRebateRate } from "@/lib/bibeck-rebate";
import { isHighVolumeLead } from "@/lib/high-volume";
import { convertCurrency, formatConvertedCurrency } from "@/lib/currency";
import { estimateBybitVipTier, resolveBybitVipTier } from "@/lib/bybit-tiers";
import { calculateCostComparisonBars, calculateTierProgress, calculateTradingCostComparison } from "@/lib/trading-cost";
import { formatVolume } from "@/lib/volume";

type ProductId = "spot" | "usdtPerpetual" | "usdcContract";
type OrderRole = "maker" | "taker";
type Mode = "auto" | "manual";
type RebateMode = "standard" | "custom";

const planMeta: Record<ComparisonPlan, { code: string; title: string; featured?: boolean }> = {
  baseline: { code: "A", title: "一般狀況" }, vip: { code: "B", title: "VIP" }, bibeck: { code: "C", title: "VIP＋返傭", featured: true },
};
const planOrder: ComparisonPlan[] = ["baseline", "vip", "bibeck"];

function rateFor(tier: BybitVipTier, product: ProductId, role: OrderRole): number { return tier.fees[product][role] ?? 0; }
function percent(rate: number): string { return `${(rate * 100).toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}%`; }
function nextVipTier(tier: BybitVipTier): BybitVipTier | null { const index = BYBIT_VIP_TIERS.findIndex((item) => item.id === tier.id); return BYBIT_VIP_TIERS[index + 1] ?? null; }

export function BybitCostCalculator({ compact = false }: { compact?: boolean }) {
  const { currency } = useCurrency();
  const { t } = usePreferences();
  const [product, setProduct] = useState<ProductId>("usdtPerpetual");
  const [role, setRole] = useState<OrderRole>("taker");
  const [volume, setVolume] = useState(1_000_000);
  const [vipMode, setVipMode] = useState<Mode>("auto");
  const [manualVipId, setManualVipId] = useState("vip-0");
  const [rebateMode, setRebateMode] = useState<RebateMode>("standard");
  const [customRebatePercent, setCustomRebatePercent] = useState(35);
  const [customFeeEnabled, setCustomFeeEnabled] = useState(false);
  const [customFeePercent, setCustomFeePercent] = useState(0.055);

  const estimatedVip = estimateBybitVipTier(volume);
  const selectedVip = resolveBybitVipTier(compact ? "auto" : vipMode, volume, manualVipId);
  const upcomingVip = nextVipTier(estimatedVip);
  const vipProgress = calculateTierProgress(volume, estimatedVip.minThirtyDayVolume, upcomingVip?.minThirtyDayVolume ?? null);
  const rebateRate = rebateMode === "standard" ? getStandardBibeckRebateRate() : Math.min(1, Math.max(0, customRebatePercent / 100));
  const baselineRate = rateFor(BYBIT_VIP_TIERS[0], product, role);
  const vipRate = customFeeEnabled && !compact ? Math.max(0, customFeePercent) / 100 : rateFor(selectedVip, product, role);
  const result = calculateTradingCostComparison({ thirtyDayVolume: volume, baselineFeeRate: baselineRate, vipFeeRate: vipRate, rebateRate });
  const bars = calculateCostComparisonBars(result);
  const displayMoney = (amount: number) => formatConvertedCurrency(amount, currency);
  const displayVolume = convertCurrency(volume, "USDT", currency) ?? 0;
  const na = "—";

  const plans: Record<ComparisonPlan, ComparisonValues> = {
    baseline: { plan:"一般狀況", vipTier:"無 VIP", feeRate:percent(baselineRate), vipSavings:na, rebateRate:na, rebateAmount:na, actualCost:displayMoney(result.baselineFee), totalSavings:na, annualCost:displayMoney(result.annualBaselineCost), annualSavings:na, effectiveRate:percent(baselineRate), costReduction:na },
    vip: { plan:"VIP", vipTier:selectedVip.label, feeRate:percent(vipRate), vipSavings:displayMoney(result.vipSavings), rebateRate:na, rebateAmount:na, actualCost:displayMoney(result.vipFee), totalSavings:displayMoney(result.vipSavings), annualCost:displayMoney(result.annualVipCost), annualSavings:displayMoney(result.annualVipSavings), effectiveRate:percent(vipRate), costReduction:result.baselineFee ? percent(result.vipSavings/result.baselineFee) : "0%" },
    bibeck: { plan:`VIP＋返傭（${percent(rebateRate)}｜${rebateMode === "standard" ? "BiBeck 標準" : "自訂情境"}）`, vipTier:selectedVip.label, feeRate:percent(vipRate), vipSavings:displayMoney(result.vipSavings), rebateRate:percent(rebateRate), rebateAmount:displayMoney(result.rebateAmount), actualCost:displayMoney(result.netTradingCost), totalSavings:displayMoney(result.totalSavings), annualCost:displayMoney(result.annualNetCost), annualSavings:displayMoney(result.annualTotalSavings), effectiveRate:percent(result.effectiveFeeRate), costReduction:percent(result.totalSavingsPercent) },
  };

  return <div className="bybit-calculator">
    {currency !== "USDT" ? <p className="mb-6 border border-gold/25 bg-gold/[0.04] px-4 py-3 text-xs leading-5 text-white/58"><strong className="text-gold">{t("settings.rateNotice")}</strong> · {exchangeRatePolicy.updatedAt} · 計算基準為 USDT，結果換算為 {currency}。</p> : null}
    <div className="mb-8 border-l-2 border-gold bg-black/20 px-4 py-3"><strong>Bybit 交易成本試算</strong><p className="mt-1 text-xs text-white/48">依 Bybit 費率、VIP 與 BiBeck 返傭計算</p></div>
    <div className="grid gap-8 xl:grid-cols-[0.88fr_1.12fr]">
      <fieldset className="grid content-start gap-5"><legend className="sr-only">Bybit 交易成本計算器輸入欄位</legend>
        <div className="grid gap-5 sm:grid-cols-2"><Select label="交易商品" value={product} onChange={(value)=>setProduct(value as ProductId)}><option value="spot">現貨</option><option value="usdtPerpetual">USDT 永續與交割合約</option><option value="usdcContract">USDC 永續與交割合約</option></Select><Select label="下單方式" value={role} onChange={(value)=>setRole(value as OrderRole)}><option value="maker">掛單 Maker</option><option value="taker">吃單 Taker</option></Select></div>
        <label><span className="flex justify-between text-sm font-medium text-white">最近 30 日交易量 <span className="text-xs text-white/42">{currency}</span></span><FormattedNumberInput key={currency} ariaLabel="最近 30 日交易量" placeholder="例如 10,000,000、10M 或 1B" value={displayVolume} onChange={(value)=>setVolume(convertCurrency(value,currency,"USDT")??0)}/><span className="mt-2 block text-xs leading-6 text-white/44">可輸入數字、千分位、M 或 B；10M＝10,000,000，1B＝1,000,000,000。</span></label>
        {!compact ? <><ModeField title="Bybit VIP 等級" mode={vipMode} setMode={setVipMode}><p className="text-sm text-white/72">依交易量推估：<strong className="text-gold">{estimatedVip.label}</strong></p>{vipMode === "manual" ? <Select label="選擇 VIP 等級" value={manualVipId} onChange={setManualVipId}>{BYBIT_VIP_TIERS.map((tier)=><option key={tier.id} value={tier.id}>{tier.label}</option>)}</Select> : null}<TierProgress label="Bybit VIP 下一級進度" current={`${estimatedVip.label}｜${formatVolume(volume)} USDT`} next={upcomingVip ? `${upcomingVip.label}｜門檻 ${formatVolume(upcomingVip.minThirtyDayVolume)} USDT｜尚差 ${formatVolume(vipProgress.remaining)} USDT` : "已達目前推估的最高 VIP 等級"} percentage={vipProgress.percentage}/><p className="text-xs leading-6 text-white/42">Bybit VIP 為依輸入資料推估，實際等級以 Bybit 帳戶顯示為準。</p></ModeField>
        <div className="mode-field"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold">返傭比例 <span className="ml-2 border border-gold/35 px-2 py-1 text-[10px] text-gold">BiBeck 標準</span></p><button type="button" className="text-xs text-gold underline" onClick={()=>setRebateMode((mode)=>mode==="standard"?"custom":"standard")} aria-expanded={rebateMode==="custom"}>{rebateMode === "custom" ? "使用標準比例" : "自訂情境"}</button></div>{rebateMode === "custom" ? <div className="mt-4"><NumberInput label="模擬返傭比例（%）" value={customRebatePercent} setValue={setCustomRebatePercent}/><p className="mt-3 text-xs leading-6 text-white/44">此功能僅供比較不同返傭比例下的交易成本，不代表帳戶實際核准比例。</p></div> : <div className="mt-4"><p className="text-3xl font-semibold text-gold">{formatBibeckRebateRate()}</p><p className="mt-3 text-xs leading-6 text-white/48">{BIBECK_REBATE_ELIGIBILITY_NOTICE}</p></div>}</div>
        <ModeField title="手續費率" mode={customFeeEnabled?"manual":"auto"} setMode={(mode)=>setCustomFeeEnabled(mode==="manual")}>{customFeeEnabled ? <NumberInput label="自訂 VIP 費率（%）" value={customFeePercent} setValue={setCustomFeePercent}/> : <p className="text-sm">目前套用：<strong className="text-gold">{percent(vipRate)}</strong></p>}</ModeField></> : <div className="border-l-2 border-gold bg-black/20 p-4 text-sm leading-7 text-white/72"><p>推估 VIP：<strong className="text-gold">{estimatedVip.label}</strong></p><p>BiBeck 標準返傭：<strong className="text-gold">{formatBibeckRebateRate()}</strong></p></div>}
      </fieldset>
      <section className="comparison-results min-w-0" aria-live="polite"><p className="eyebrow">交易成本比較</p>{compact ? <><div className="mt-5 grid gap-px bg-white/10 sm:grid-cols-3">{planOrder.map((plan)=><article key={plan} className={`bg-[#141414] p-5 ${plan==="bibeck"?"border border-gold/50":""}`}><p className="text-xs text-gold">{planMeta[plan].code}</p><h3 className="mt-2 font-semibold">{planMeta[plan].title}</h3><p className="mt-4 text-xs text-white/44">30 日預估成本</p><p className="mt-2 break-words font-mono text-lg">{plans[plan].actualCost}</p></article>)}</div><CostBars bars={bars} displayMoney={displayMoney}/><SavingsSummary result={result} displayMoney={displayMoney}/></> : <><p className="comparison-swipe-hint mt-3 text-xs text-white/48">左右滑動比較三種成本</p><ComparisonMatrix plans={plans}/><MobileComparisonCards plans={plans}/><CostBars bars={bars} displayMoney={displayMoney}/><SavingsSummary result={result} displayMoney={displayMoney}/></>}{isHighVolumeLead(volume) ? <HighVolumeCallout volume={volume}/> : null}{!compact ? <><Link href={REBATE_APPLICATION_URL} className="cta-button button-primary mt-6 w-full" aria-label="申請 BiBeck 35% 返傭">申請 35% 返傭</Link><p className="mt-3 text-xs leading-6 text-white/44">{BIBECK_REBATE_ELIGIBILITY_NOTICE}</p></> : null}</section>
    </div>
    {compact ? <div className="mt-7 text-center"><Link href="/calculator" className="button-primary">算算我能拿回多少</Link></div> : <div className="mt-8 border-t border-white/10 pt-7 text-xs leading-6 text-white/44"><details className="mb-6 border border-white/10 bg-black/20 p-4"><summary className="cursor-pointer font-semibold text-white">計算公式與年度推估方式</summary><div className="mt-3 grid gap-1"><p>原始手續費＝交易量 × VIP 0 基準費率</p><p>VIP 後手續費＝交易量 × 實際 VIP 費率</p><p>BiBeck 返傭＝VIP 後符合資格手續費 × {formatBibeckRebateRate()}</p><p>返傭後成本＝VIP 後手續費 − BiBeck 返傭</p><p>合計節省＝原始手續費 − 返傭後成本</p><p>年度推估＝30 日結果 × 12</p></div></details><p>本試算依輸入資料與公開費率估算；實際結果可能受商品、地區、帳戶資格、活動、有效手續費及 Bybit 最終紀錄影響。</p><p className="mt-2">BiBeck 為獨立第三方平台，並非 Bybit 官方網站或代表。返傭不是投資收益，也不保證所有帳戶或交易都適用。</p><p className="mt-2">費率來源：<ExternalLink href={BYBIT_FEE_STRUCTURE} variant="ghost" className="!min-h-0 !px-0 !py-0 !tracking-normal">Bybit Trading Fee Structure</ExternalLink></p></div>}
  </div>;
}

function ComparisonMatrix({plans}:{plans:Record<ComparisonPlan,ComparisonValues>}) { return <div className="comparison-matrix mt-5" role="table" aria-label="交易成本方案比較"><div className="comparison-matrix-corner" role="columnheader">比較項目</div>{planOrder.map((plan)=><div key={plan} className={`comparison-matrix-head ${plan==="bibeck"?"featured":""}`} role="columnheader"><span className="comparison-badge-slot">{planMeta[plan].featured?<span>推薦</span>:null}</span><small>{planMeta[plan].code}</small><strong>{planMeta[plan].title}</strong></div>)}{COMPARISON_ROWS.map((row)=><div className="comparison-matrix-row" role="row" key={row.key}><div role="rowheader" className="comparison-label">{row.label}</div>{planOrder.map((plan)=><div role="cell" key={plan} className={`comparison-value ${plan==="bibeck"?"featured":""}`} data-comparison-row={row.key} data-comparison-plan={plan}>{plans[plan][row.key]}</div>)}</div>)}</div>; }
function MobileComparisonCards({plans}:{plans:Record<ComparisonPlan,ComparisonValues>}) { return <div className="scenario-comparison mt-5" role="region" tabIndex={0} aria-label="交易成本方案比較">{planOrder.map((plan)=><article key={plan} className={`scenario-card ${plan==="bibeck"?"scenario-card-featured":""}`}><div className="comparison-badge-slot">{planMeta[plan].featured?<span>推薦</span>:null}</div><span className="font-mono text-xs text-gold">{planMeta[plan].code}</span><h3 className="scenario-card-title mt-3 font-semibold text-white">{planMeta[plan].title}</h3><dl className="mt-5 divide-y divide-white/8">{COMPARISON_ROWS.map((row)=><div key={row.key} className="scenario-row grid grid-cols-[1fr_auto] items-center gap-3 py-3" data-comparison-row={row.key} data-comparison-plan={plan}><dt className="text-xs leading-5 text-white/44">{row.label}</dt><dd className="text-right font-mono text-xs leading-5 text-white">{plans[plan][row.key]}</dd></div>)}</dl></article>)}</div>; }
function CostBars({bars,displayMoney}:{bars:ReturnType<typeof calculateCostComparisonBars>;displayMoney:(value:number)=>string}) { const labels={baseline:"A｜一般狀況",vip:"B｜VIP",bibeck:"C｜VIP＋返傭"} as const; return <section className="cost-bars mt-7" aria-label="30 日實際交易成本比較"><h3 className="text-lg font-semibold text-white">30 日實際交易成本比較</h3><p className="mt-2 text-xs leading-5 text-white/44">以一般狀況為基準，比較 VIP 與返傭後的實際成本。</p><div className="mt-5 grid gap-5">{bars.map((bar)=><div key={bar.id} className={`cost-bar cost-bar-${bar.id}`}><div className="flex flex-wrap justify-between gap-2 text-xs"><strong>{labels[bar.id]}</strong><span>{displayMoney(bar.cost)}｜{bar.id==="baseline"?"基準 100%":`降低 ${bar.reductionPercent.toFixed(2)}%`}</span></div><div className="cost-bar-track"><span style={{width:`${bar.widthPercent}%`}}/></div></div>)}</div></section>; }
function SavingsSummary({result,displayMoney}:{result:ReturnType<typeof calculateTradingCostComparison>;displayMoney:(value:number)=>string}) { return <div className="savings-summary"><p className="text-sm text-secondary">按照目前輸入條件</p><dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-white/46">原始手續費</dt><dd className="mt-1 font-mono text-lg">{displayMoney(result.baselineFee)}</dd></div><div><dt className="text-xs text-white/46">VIP 後手續費</dt><dd className="mt-1 font-mono text-lg">{displayMoney(result.vipFee)}</dd></div><div><dt className="text-xs text-white/46">返傭金額</dt><dd className="mt-1 break-words font-mono text-3xl font-semibold text-gold">{displayMoney(result.rebateAmount)}</dd></div><div><dt className="text-xs text-white/46">返傭後實際交易成本</dt><dd className="mt-1 font-mono text-lg">{displayMoney(result.netTradingCost)}</dd></div></dl><p className="mt-5 text-sm text-white/68">30 日總節省 {displayMoney(result.totalSavings)}；年度預估可降低成本 {displayMoney(result.annualTotalSavings)}</p></div>; }
function HighVolumeCallout({volume}:{volume:number}) { return <aside className="mt-7 border border-gold/40 bg-gold/[0.05] p-6"><p className="eyebrow">高交易量交易者</p><h3 className="mt-3 text-xl font-semibold">你的交易量，值得進一步評估交易成本。</h3><p className="mt-4 text-sm leading-7 text-secondary">你輸入的最近 30 日交易量為 <strong className="text-white">{formatVolume(volume)} USDT</strong>。在這個交易量級，Maker / Taker、VIP 與實際有效費率的微小差異，都可能產生明顯的成本影響。</p><p className="mt-3 text-sm leading-7 text-secondary">高交易量交易者可透過 LINE 進一步洽談合作條件；實際條件由 BiBeck 個別確認。</p><a href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="cta-button button-secondary mt-5">LINE 洽談高交易量方案</a></aside>; }
function TierProgress({label,current,next,percentage}:{label:string;current:string;next:string;percentage:number}) { const safe=Math.min(100,Math.max(0,Number.isFinite(percentage)?percentage:0)); return <div className="tier-progress"><div className="flex justify-between gap-3 text-xs"><span>{current}</span><span className="tabular-nums">{safe.toFixed(0)}%</span></div><div className="tier-progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(safe.toFixed(0))}><span style={{width:`${safe}%`}}/></div><p className="mt-2 text-xs leading-5 text-white/48">{next}</p></div>; }
function ModeField({title,mode,setMode,children}:{title:string;mode:Mode;setMode:(mode:Mode)=>void;children:React.ReactNode}) { return <div className="mode-field"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold">{title}</p><div className="mode-toggle" role="group" aria-label={`${title}模式`}><button type="button" aria-pressed={mode==="auto"} onClick={()=>setMode("auto")}>自動推估</button><button type="button" aria-pressed={mode==="manual"} onClick={()=>setMode("manual")}>手動調整</button></div></div><div className="mt-4 grid gap-3">{children}</div></div>; }
function Select({label,value,onChange,children}:{label:string;value:string;onChange:(value:string)=>void;children:React.ReactNode}) { return <label><span className="text-sm font-medium text-white">{label}</span><select value={value} onChange={(event)=>onChange(event.target.value)} className="calculator-input mt-2 w-full">{children}</select></label>; }
function NumberInput({label,value,setValue}:{label:string;value:number;setValue:(value:number)=>void}) { return <label><span className="text-sm text-white">{label}</span><input type="number" min="0" max="100" step="0.0001" inputMode="decimal" value={value} onChange={(event)=>setValue(Number(event.target.value))} className="calculator-input mt-2 w-full"/></label>; }
