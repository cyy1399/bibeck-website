import type { AppResult, PreparedAnalysis } from "../../lib/money-os/contracts/commands.ts";
import type { WorkspaceDto, WhyDto, MissionDto, MetricDto, ConfidenceDto, DisplayValue } from "../../lib/money-os/contracts/read-dto.ts";
import { scenarios, type Scenario } from "./scenarios.ts";

/** Rendering only: no source conversion, formatting, thresholds, or financial arithmetic. */
export const escapeHtml = (value: string): string => value.replace(/[&<>"']/gu, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
const text = escapeHtml;
const list = (items: readonly string[]): string => `<ul class="plain-list">${[...new Set(items)].map(item => `<li>${text(item)}</li>`).join("")}</ul>`;
const valueText = (value: DisplayValue): string => `<span class="value ${value.status === "KNOWN" ? "" : "unknown"}" data-value-status="${value.status}">${text(value.text)}</span>`;
export function ConfidenceNotice(confidence: ConfidenceDto): string {
  return `<aside class="confidence"><span class="small-label">判斷的支持程度</span><strong>${text(confidence.label)}</strong>${list(confidence.reasons)}</aside>`;
}
export function MetricSummary(metrics: MetricDto[]): string {
  return `<div class="metric-grid">${metrics.map(metric => `<article class="metric"><h3>${text(metric.label)}</h3><p>${valueText(metric.value)}</p><small>${metric.currency ? text(metric.currency) + " · " : ""}${text(metric.timeBasis)}</small></article>`).join("")}</div>`;
}
export function WhyPanel(why: WhyDto, id: string): string {
  const sources = why.sources.items.map(source => `<li><div><strong>${text(source.label)}</strong>${valueText(source.value)}</div><small>${source.currency ? text(source.currency) + " · " : ""}${text(source.unit)} · ${text(source.timeBasis)}${source.value.status === "KNOWN" ? " · " + text(source.value.source) + " · " + text(source.value.updatedAt) : ""}</small></li>`).join("");
  return `<details class="why-panel" id="${text(id)}"><summary>為什麼得到這個結果？<span>查看依據 <b aria-hidden="true">＋</b></span></summary><div class="why-body">
    <section><h3>${text(why.sources.title)}</h3><details class="source-details"><summary>查看全部來源（${why.sources.items.length} 項）</summary><ul class="source-list">${sources}</ul></details></section>
    <section><h3>${text(why.metrics.title)}</h3>${why.metrics.items.length ? MetricSummary(why.metrics.items) : `<p>${text(why.metrics.emptyText ?? "")}</p>`}</section>
    <section><h3>${text(why.mechanism.title)}</h3>${list(why.mechanism.items)}</section>
    <section><h3>${text(why.assumptions.title)}</h3>${why.assumptions.items.length ? list(why.assumptions.items.map(a => a.text + "（" + a.status + "）")) : `<p>${text(why.assumptions.emptyText ?? "")}</p>`}</section>
    <section><h3>${text(why.missing.title)}</h3>${why.missing.items.length ? list(why.missing.items.map(m => m.label)) : `<p>${text(why.missing.emptyText ?? "")}</p>`}</section>
    <section><h3>${text(why.limits.title)}</h3>${ConfidenceNotice(why.limits.confidence)}<p>${text(why.limits.changeConditions)}</p><p>${text(why.limits.text)}</p></section>
  </div></details>`;
}
export function MainQuestCard(mission: MissionDto): string {
  return `<article class="mission surface" data-mission-type="${text(mission.type)}"><div class="section-heading"><span class="small-label">${mission.type === "DISCOVER" ? "先確認資訊" : "一個優先事項"}</span><span class="quiet-tag">${text(mission.progress)}</span></div><h2>${text(mission.title)}</h2>
    <dl class="mission-steps"><div><dt>為什麼先處理</dt><dd>${text(mission.why)}</dd></div><div><dt>可以先做什麼</dt><dd>${text(mission.action)}</dd></div><div><dt>影響與界線</dt><dd>${text(mission.impact)}</dd></div><div><dt>如何再確認</dt><dd>${list(mission.verification)}</dd></div></dl>
    ${WhyPanel(mission.details, "mission-why")}<p class="preview-footnote">此頁只供檢視，沒有開始、保存或完成任務功能。</p></article>`;
}
export function NoActionState(workspace: WorkspaceDto): string {
  return `<article class="surface no-action" data-no-action="true"><span class="small-label">不需要製造一個任務</span><h2>目前沒有優先任務</h2><p>${text(workspace.summary)}</p><p class="muted">${text(workspace.bottleneck?.text ?? "")}</p></article>`;
}
export function MissingInformationCard(workspace: WorkspaceDto): string {
  return `<aside class="surface information"><span class="small-label">資訊與產品能力界線</span><h2>還有哪些不能確定？</h2>${list(workspace.missingInformation)}${list(workspace.producerLimitations)}<details class="research-values"><summary>查看尚未可計算的指標</summary>${MetricSummary(workspace.metrics.filter(m => m.value.status !== "KNOWN"))}</details></aside>`;
}
export function StageSummary(workspace: WorkspaceDto): string {
  return `<div class="stage"><span>目前領域</span><strong>${text(workspace.stage.label)}</strong></div>`;
}
export function PrimaryBottleneckCard(workspace: WorkspaceDto): string {
  const title = workspace.mainQuest?.title ?? (workspace.state === "NO_ACTION_REQUIRED" ? "目前沒有優先任務" : "先理解目前的狀況");
  return `<section class="priority" aria-labelledby="priority-title"><span class="small-label">目前最值得先關注</span><h1 id="priority-title">${text(title)}</h1><p class="priority-reason">${text(workspace.bottleneck?.text ?? workspace.summary)}</p><div class="priority-footer"><span>${text(workspace.confidence.label)}</span><a href="#why">看判斷依據 <span aria-hidden="true">↗</span></a></div></section>`;
}
function WorkspaceView(workspace: WorkspaceDto): string {
  // Display selection only; order/values/text and conclusions come from the DTO.
  const firstMetrics = workspace.metrics.slice(0, 3);
  const extraMetrics = workspace.metrics.filter(m => ["metrics.monthlySurplus", "metrics.availableSafetyLiquidity30d", "metrics.financialRunwayMonths", "metrics.netWorth"].includes(m.key));
  return `${StageSummary(workspace)}${PrimaryBottleneckCard(workspace)}<section class="snapshot" aria-labelledby="snapshot-title"><div class="section-heading"><h2 id="snapshot-title">財務快照</h2><span>${text(workspace.basis.primaryCurrency)} · ${text(workspace.basis.monthlyPeriodId)}</span></div>${MetricSummary(firstMetrics)}<details class="more-metrics"><summary>看資金與每月剩餘</summary>${MetricSummary(extraMetrics)}</details></section>
    <div class="content-grid"><div>${workspace.mainQuest ? MainQuestCard(workspace.mainQuest) : workspace.state === "NO_ACTION_REQUIRED" ? NoActionState(workspace) : `<article class="surface"><h2>目前未指派優先任務</h2><p>${text(workspace.summary)}</p></article>`}
    ${workspace.sideMissions.length ? `<section class="side-missions"><h2>其他可關注的事項</h2>${workspace.sideMissions.map(m => `<details class="surface"><summary>${text(m.title)}</summary><p>${text(m.why)}</p><p>${text(m.action)}</p>${ConfidenceNotice(m.confidence)}</details>`).join("")}</section>` : ""}</div><div>${ConfidenceNotice(workspace.confidence)}${MissingInformationCard(workspace)}</div></div>
    <section class="explain-section">${WhyPanel(workspace.bottleneck?.details ?? workspace.details, "why")}<details class="global-details"><summary>查看整份分析的依據</summary>${WhyPanel(workspace.details, "all-why")}</details></section>
    <p class="basis-note">觀測日 ${text(workspace.basis.asOf)} · 收支月份 ${text(workspace.basis.monthlyPeriodId)} · ${text(workspace.basis.financialCalendarZone)}<br>${text(workspace.publicationNotice)}</p>`;
}
export function renderPreview(result: AppResult<PreparedAnalysis>, scenario: Scenario): string {
  const failure = result.ok ? "" : `<section class="surface failure" role="status"><span class="small-label">分析未成功</span><h1>目前無法產生有效結果</h1><p>這份合成輸入未通過既有分析流程。沒有生成財務建議，也沒有保存任何資料。</p><p class="muted">預覽保留真實失敗，不替換成看似完整的結果。</p><details><summary>查看安全診斷</summary><code>${text(result.error.category)} / ${text(result.error.safeCode)}</code></details></section>`;
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>BiBeck Money OS · 本機視覺預覽</title><link rel="icon" href="data:,"><link rel="stylesheet" href="/styles.css"><script src="/interactions.js" defer></script></head><body>
    <a class="skip-link" href="#main">跳至目前狀況</a><header class="product-header"><div><a class="brand" href="/">BiBeck <span>Money OS</span></a><span class="review-tag">視覺預覽 V0</span></div></header>
    <div class="review-banner">僅限本機審閱 · 全部為合成資料 · 未登入、未保存、未發布</div>
    <main id="main" tabindex="-1"><div class="page-heading"><div><span class="eyebrow">把注意力放在重要的事</span><h2>目前狀況</h2></div><form class="scenario-control" method="get" action="/"><label for="scenario">合成情境切換</label><div><select name="scenario" id="scenario">${scenarios.map(s => `<option value="${s.id}"${s.id === scenario.id ? " selected" : ""}>${text(s.label)}</option>`).join("")}</select><button type="submit">切換</button></div></form></div>
    <p class="scenario-note">${text(scenario.note)}</p>${result.ok ? WorkspaceView(result.value.workspace) : failure}</main>
    <footer><strong>BiBeck Money OS</strong><p>這是產品視覺驗證，不是已上線服務。資料重整後可重設；沒有資料輸入、保存、銀行連結或自動追蹤功能。</p><span>正式實作順序維持 S05 → S06 → S07 → S08 → S09 → S10。</span></footer></body></html>`;
}
