"use client";

import { useState } from "react";
import { FormattedNumberInput } from "@/components/FormattedNumberInput";
import { ExternalLink } from "@/components/ExternalLink";
import { formatVolume, getBiBeckRebateTier, getNextBiBeckRebateTier } from "@/config/bibeck-rebate-tiers";
import { BYBIT_VIP_TIERS, type BybitVipTier } from "@/config/bybit-vip-tiers";
import { REBATE_APPLICATION_URL, BYBIT_FEE_STRUCTURE } from "@/config/links";
import { calculateTierProgress, calculateTradingCostComparison } from "@/lib/trading-cost";
import { estimateBybitVipTier, resolveBybitVipTier } from "@/lib/bybit-tiers";
import { useCurrency, usePreferences } from "@/components/PreferencesProvider";
import { convertCurrency, formatConvertedCurrency } from "@/lib/currency";
import { exchangeRatePolicy } from "@/config/currencies";
import { TradingCostChart } from "@/components/TradingCostChart";

type ProductId = "spot" | "usdtPerpetual" | "usdcContract";
type OrderRole = "maker" | "taker";
type Mode = "auto" | "manual";
type RebateMode = "auto" | "custom";

function rateFor(tier: BybitVipTier, product: ProductId, role: OrderRole): number { return tier.fees[product][role] ?? 0; }
function percent(rate: number): string { return `${(rate * 100).toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}%`; }

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
  const estimatedTier = getBiBeckRebateTier(volume);
  const nextTier = getNextBiBeckRebateTier(estimatedTier.id);
  const rebateRate = rebateMode === "auto" ? estimatedTier.rebateRate ?? 0 : Math.min(1, Math.max(0, customRebatePercent / 100));
  const baselineRate = rateFor(BYBIT_VIP_TIERS[0], product, role);
  const vipRate = customFeeEnabled ? Math.max(0, customFeePercent) / 100 : rateFor(selectedVip, product, role);
  const result = calculateTradingCostComparison({ thirtyDayVolume: volume, baselineFeeRate: baselineRate, vipFeeRate: vipRate, rebateRate });
  const nextProgress = calculateTierProgress(volume, estimatedTier.minVolume ?? 0, nextTier?.minVolume ?? null);
  const displayMoney = (amount: number) => formatConvertedCurrency(amount, currency);
  const displayVolume = convertCurrency(volume, "USDT", currency) ?? 0;
  const na = "—";

  const rowsA: [string, string][] = [["方案", "一般狀況"], ["VIP 等級", "無 VIP"], ["BiBeck 級距", na], ["手續費率", percent(baselineRate)], ["VIP 節省", na], ["BiBeck 返傭比例", na], ["30 日返傭金額", na], ["30 日實際交易成本", displayMoney(result.baselineFee)], ["30 日合計節省", na], ["年度預估成本", displayMoney(result.annualBaselineCost)], ["年度預估節省", na], ["實際有效費率", percent(baselineRate)], ["總成本降低比例", na]];
  const rowsB: [string, string][] = [["方案", "VIP"], ["VIP 等級", selectedVip.label], ["BiBeck 級距", na], ["手續費率", percent(vipRate)], ["VIP 節省", displayMoney(result.vipSavings)], ["BiBeck 返傭比例", na], ["30 日返傭金額", na], ["30 日實際交易成本", displayMoney(result.vipFee)], ["30 日合計節省", displayMoney(result.vipSavings)], ["年度預估成本", displayMoney(result.annualVipCost)], ["年度預估節省", displayMoney(result.annualVipSavings)], ["實際有效費率", percent(vipRate)], ["總成本降低比例", result.baselineFee ? percent(result.vipSavings / result.baselineFee) : "0%"]];
  const rowsC: [string, string][] = [["方案", "VIP＋BiBeck 返傭"], ["VIP 等級", selectedVip.label], ["BiBeck 級距", rebateMode === "auto" ? estimatedTier.name : "自訂情境"], ["手續費率", percent(vipRate)], ["VIP 節省", displayMoney(result.vipSavings)], ["BiBeck 返傭比例", percent(rebateRate)], ["30 日返傭金額", displayMoney(result.rebateAmount)], ["30 日實際交易成本", displayMoney(result.netTradingCost)], ["30 日合計節省", displayMoney(result.totalSavings)], ["年度預估成本", displayMoney(result.annualNetCost)], ["年度預估節省", displayMoney(result.annualTotalSavings)], ["實際有效費率", percent(result.effectiveFeeRate)], ["總成本降低比例", percent(result.totalSavingsPercent)]];

  return <div className="bybit-calculator">
    {currency !== "USDT" ? <p className="mb-6 border border-gold/25 bg-gold/[0.04] px-4 py-3 text-xs leading-5 text-white/58"><strong className="text-gold">{t("settings.rateNotice")}</strong> · {exchangeRatePolicy.updatedAt} · 計算基準為 USDT，結果換算為 {currency}。</p> : null}
    <div className="mb-8 grid gap-4 border-b border-white/10 pb-7 sm:grid-cols-[minmax(0,22rem)_1fr] sm:items-end"><Select label="交易所" value="bybit" onChange={() => undefined}><option value="bybit">Bybit</option>{["Binance", "Bitget", "BingX", "OKX"].map((name) => <option key={name} disabled>{name} — 即將開放</option>)}</Select><div className="border-l-2 border-gold bg-black/20 px-4 py-3"><strong>Bybit</strong><p className="mt-1 text-xs text-white/48">完整費率、VIP 與 BiBeck 返傭試算</p></div></div>
    <div className="grid gap-8 xl:grid-cols-[0.88fr_1.12fr]">
      <fieldset className="grid content-start gap-5"><legend className="sr-only">Bybit 交易成本計算器輸入欄位</legend>
        <div className="grid gap-5 sm:grid-cols-2"><Select label="交易商品" value={product} onChange={(v) => setProduct(v as ProductId)}><option value="spot">現貨</option><option value="usdtPerpetual">USDT 永續與交割合約</option><option value="usdcContract">USDC 永續與交割合約</option></Select><Select label="下單方式" value={role} onChange={(v) => setRole(v as OrderRole)}><option value="maker">掛單 Maker</option><option value="taker">吃單 Taker</option></Select></div>
        <label><span className="flex justify-between text-sm font-medium text-white">最近 30 日交易量 <span className="text-xs text-white/42">{currency}</span></span><FormattedNumberInput key={currency} ariaLabel="最近 30 日交易量" placeholder="例如 10,000,000、10M 或 1B" value={displayVolume} onChange={(v) => setVolume(convertCurrency(v, currency, "USDT") ?? 0)} /><span className="mt-2 block text-xs leading-6 text-white/44">可輸入數字、千分位、M 或 B；10M＝10,000,000，1B＝1,000,000,000。</span></label>
        <ModeField title="Bybit VIP 等級" mode={vipMode} setMode={setVipMode}><p className="text-sm text-white/72">依交易量推估：<strong className="text-gold">{estimatedVip.label}</strong></p>{vipMode === "manual" ? <Select label="選擇 VIP 等級" value={manualVipId} onChange={setManualVipId}>{BYBIT_VIP_TIERS.map((tier) => <option key={tier.id} value={tier.id}>{tier.label}</option>)}</Select> : null}<p className="text-xs leading-6 text-white/42">Bybit VIP 為獨立推估，最終以 Bybit 帳戶顯示為準。</p></ModeField>
        <div className="mode-field"><p className="text-sm font-semibold">BiBeck 返傭</p><div className="mode-toggle mt-3" role="group" aria-label="BiBeck 返傭試算模式"><button type="button" aria-pressed={rebateMode === "auto"} onClick={() => setRebateMode("auto")}>依交易量自動推估</button><button type="button" aria-pressed={rebateMode === "custom"} onClick={() => setRebateMode("custom")}>自訂情境試算</button></div>{rebateMode === "custom" ? <div className="mt-4"><Select label="模擬返傭比例" value={String(customRebatePercent)} onChange={(v) => setCustomRebatePercent(Number(v))}>{[0,20,25,30,35,40].map((rate) => <option key={rate} value={rate}>{rate}%</option>)}</Select><NumberInput label="自訂比例" value={customRebatePercent} setValue={setCustomRebatePercent} /><p className="mt-3 text-xs leading-6 text-gold">特殊合作的 40% 以上比例僅供情境試算，須個別評估與協商，不代表 BiBeck 實際可提供或核准。</p></div> : <div className="mt-4 text-sm leading-7 text-white/72"><p>目前推估級距：<strong className="text-gold">{estimatedTier.name}</strong></p><p>推估返傭比例：<strong className="text-gold">{percent(estimatedTier.rebateRate ?? 0)}</strong></p><p>適用交易量：{estimatedTier.volumeLabel}</p><p>{nextTier ? <>下一級：{nextTier.name}｜{percent(nextTier.rebateRate ?? 0)}；距離下一級：{formatVolume(nextProgress.remaining)} USDT</> : "已達最高公開交易量級距"}</p><p className="mt-2 text-xs text-white/42">此為級距推估，實際比例須完成返傭申請及資料核對後，以通知結果為準。</p></div>}</div>
        <ModeField title="手續費率" mode={customFeeEnabled ? "manual" : "auto"} setMode={(m) => setCustomFeeEnabled(m === "manual")}>{customFeeEnabled ? <NumberInput label="自訂 VIP 費率（%）" value={customFeePercent} setValue={setCustomFeePercent} /> : <p className="text-sm">目前套用：<strong className="text-gold">{percent(vipRate)}</strong></p>}</ModeField>
      </fieldset>
      <section className="comparison-results min-w-0" aria-live="polite"><p className="eyebrow">交易成本比較</p><p className="comparison-swipe-hint mt-3 text-xs text-white/48">左右滑動比較三種成本</p><div className="scenario-comparison mt-5" role="region" tabIndex={0} aria-label="交易成本方案比較"><ScenarioCard code="A" title="一般狀況" rows={rowsA}/><ScenarioCard code="B" title="VIP" rows={rowsB}/><ScenarioCard code="C" title="VIP＋BiBeck 返傭" rows={rowsC} featured/></div><TradingCostChart currentVolume={volume} baselineFeeRate={baselineRate} vipFeeRate={vipRate} customRebateRate={rebateMode === "custom" ? rebateRate : undefined} formatMoney={displayMoney}/><div className="savings-summary"><p className="text-sm text-secondary">30 日預估合計節省</p><p className="mt-2 break-words text-4xl font-semibold text-gold sm:text-5xl">{displayMoney(result.totalSavings)}</p><p className="mt-4 text-sm text-white/68">年度預估合計節省 {displayMoney(result.annualTotalSavings)}</p></div><ExternalLink href={REBATE_APPLICATION_URL} sponsored className="mt-6 w-full" aria-label="前往 BiBeck Bybit 返傭申請頁">取得 Bybit 返傭帳號</ExternalLink><p className="mt-3 text-xs leading-6 text-white/44">公開返傭級距為 20%～40%；特殊合作 40% 以上須個別評估與協商。實際結果以資料核對與通知為準。</p></section>
    </div>
    <div className="mt-8 border-t border-white/10 pt-7 text-xs leading-6 text-white/44"><details className="mb-6 border border-white/10 bg-black/20 p-4"><summary className="cursor-pointer font-semibold text-white">計算公式與年度推估方式</summary><div className="mt-3 grid gap-1"><p>原始手續費＝交易量 × VIP 0 基準費率</p><p>VIP 後手續費＝交易量 × 實際 VIP 費率</p><p>BiBeck 返傭＝VIP 後實際手續費 × 返傭比例</p><p>返傭後成本＝VIP 後手續費 − 返傭</p><p>合計節省＝原始手續費 − 返傭後成本</p><p>年度推估＝30 日結果 × 12</p></div></details><p>本試算依輸入的最近 30 日交易量、交易商品、Maker／Taker 類型、VIP 費率及 BiBeck 公開返傭級距估算。實際結果可能受商品、地區、帳戶條件、活動、有效手續費與資料核對結果影響。</p><p className="mt-2">BiBeck 為獨立第三方平台，並非 Bybit 官方網站或代表。返傭是部分交易手續費回饋，不是投資收益，也不保證返傭、節省或級距核准。</p><p className="mt-2">費率來源：<ExternalLink href={BYBIT_FEE_STRUCTURE} variant="ghost" className="!min-h-0 !px-0 !py-0 !tracking-normal">Bybit Trading Fee Structure</ExternalLink></p></div>
  </div>;
}

function ModeField({ title, mode, setMode, children }: { title: string; mode: Mode; setMode: (mode: Mode) => void; children: React.ReactNode }) { return <div className="mode-field"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold">{title}</p><div className="mode-toggle" role="group" aria-label={`${title}模式`}><button type="button" aria-pressed={mode === "auto"} onClick={() => setMode("auto")}>自動推估</button><button type="button" aria-pressed={mode === "manual"} onClick={() => setMode("manual")}>手動調整</button></div></div><div className="mt-4 grid gap-3">{children}</div></div>; }
function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) { return <label><span className="text-sm font-medium text-white">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="calculator-input mt-2 w-full">{children}</select></label>; }
function NumberInput({ label, value, setValue }: { label: string; value: number; setValue: (value: number) => void }) { return <label><span className="text-sm text-white">{label}</span><input type="number" min="0" max="100" step="0.0001" inputMode="decimal" value={value} onChange={(e) => setValue(Number(e.target.value))} className="calculator-input mt-2 w-full" /></label>; }
function ScenarioCard({ code, title, rows, featured = false }: { code: string; title: string; rows: [string,string][]; featured?: boolean }) { return <article className={`scenario-card ${featured ? "scenario-card-featured" : ""}`} tabIndex={0}><div className="flex items-center justify-between gap-3"><span className="font-mono text-xs text-gold">{code}</span>{featured ? <span className="border border-gold/50 px-2 py-1 text-[0.68rem] text-gold">推薦</span> : null}</div><h3 className="scenario-card-title mt-4 font-semibold text-white">{title}</h3><dl className="mt-5 divide-y divide-white/8">{rows.map(([label,value]) => <div key={label} className="scenario-row grid grid-cols-[1fr_auto] items-center gap-3 py-3"><dt className="text-xs leading-5 text-white/44">{label}</dt><dd className="break-words text-right font-mono text-xs leading-5 text-white">{value}</dd></div>)}</dl></article>; }
