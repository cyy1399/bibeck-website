"use client";

import { useMemo, useState } from "react";
import { formatVolume, getBiBeckRebateTier } from "@/config/bibeck-rebate-tiers";
import { buildTradingCostChartPoints } from "@/lib/trading-cost";

type Props = { currentVolume: number; baselineFeeRate: number; vipFeeRate: number; customRebateRate?: number; formatMoney: (value: number) => string };
const width = 760;
const height = 330;
const padding = { left: 74, right: 24, top: 26, bottom: 58 };

export function TradingCostChart(props: Props) {
  const points = useMemo(() => buildTradingCostChartPoints({ currentVolume: props.currentVolume, baselineFeeRate: props.baselineFeeRate, vipFeeRate: props.vipFeeRate, customRebateRate: props.customRebateRate, resolveTier: getBiBeckRebateTier }), [props.currentVolume, props.baselineFeeRate, props.vipFeeRate, props.customRebateRate]);
  const currentIndex = Math.max(0, points.findIndex((point) => point.isCurrent));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = points[selectedIndex ?? currentIndex] ?? points[0];
  const maxX = points.at(-1)?.volume || 1;
  const maxY = Math.max(1, ...points.map((point) => point.baselineCost));
  const x = (value: number) => padding.left + (value / maxX) * (width - padding.left - padding.right);
  const y = (value: number) => height - padding.bottom - (value / maxY) * (height - padding.top - padding.bottom);
  const path = (key: "baselineCost" | "vipCost" | "rebateCost") => points.map((point, index) => `${index ? "L" : "M"}${x(point.volume).toFixed(2)},${y(point[key]).toFixed(2)}`).join(" ");

  return <section className="cost-chart mt-7" aria-labelledby="cost-chart-title">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">成本曲線</p><h3 id="cost-chart-title" className="mt-2 text-lg font-semibold text-white">交易量與 30 日交易成本</h3></div><p className="text-xs leading-5 text-white/44">自動模式會在公開級距門檻重新計算方案 C</p></div>
    <div className="cost-chart-legend mt-4" aria-label="圖例"><span className="line-a">A 一般狀況</span><span className="line-b">B VIP</span><span className="line-c">C VIP＋BiBeck 返傭</span></div>
    <div className="cost-chart-scroll mt-4" role="region" tabIndex={0} aria-label="交易成本曲線圖，可左右捲動">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="一般狀況、VIP、VIP 加 BiBeck 返傭的 30 日交易成本曲線">
        {[0, .25, .5, .75, 1].map((ratio) => <g key={ratio}><line x1={padding.left} y1={y(maxY * ratio)} x2={width-padding.right} y2={y(maxY * ratio)} className="chart-grid"/><text x={padding.left-10} y={y(maxY * ratio)+4} textAnchor="end" className="chart-label">{props.formatMoney(maxY * ratio)}</text></g>)}
        <path d={path("baselineCost")} className="chart-line chart-line-a"/><path d={path("vipCost")} className="chart-line chart-line-b"/><path d={path("rebateCost")} className="chart-line chart-line-c"/>
        {points.map((point,index) => <g key={point.volume} onMouseEnter={() => setSelectedIndex(index)} onFocus={() => setSelectedIndex(index)} onClick={() => setSelectedIndex(index)} role="button" tabIndex={0} aria-label={`${formatVolume(point.volume)} USDT，方案 C 成本 ${props.formatMoney(point.rebateCost)}`}><line x1={x(point.volume)} y1={padding.top} x2={x(point.volume)} y2={height-padding.bottom} className={point.isCurrent ? "chart-current" : "chart-hit-line"}/><circle cx={x(point.volume)} cy={y(point.rebateCost)} r={point.isCurrent ? 6 : 4} className="chart-point"/><text x={x(point.volume)} y={height-padding.bottom+24} textAnchor="middle" className="chart-label">{formatVolume(point.volume)}</text></g>)}
      </svg>
    </div>
    <div className="cost-chart-tooltip" aria-live="polite"><strong>{selected.isCurrent ? "目前輸入 · " : ""}{formatVolume(selected.volume)} USDT</strong><span>A {props.formatMoney(selected.baselineCost)}</span><span>B {props.formatMoney(selected.vipCost)}</span><span>C {props.formatMoney(selected.rebateCost)}</span><span>{selected.tierName} · {(selected.rebateRate*100).toFixed(0)}%</span></div>
  </section>;
}
