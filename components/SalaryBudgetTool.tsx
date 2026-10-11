"use client";
import { useEffect, useRef, useState } from "react";
import { allocationSummary, analyzeSalaryBudget, BUDGET_KEY, createSalaryBudget, decodeSalaryBudget, emergencyTarget, encodeSalaryBudget, foodEstimate, proposeSalaryBudget, type BudgetAllocation, type BudgetExpense, type SalaryBudget } from "@/lib/salary-budget";
import { parseMoney } from "@/lib/financial-inventory";
const fmt = (n: number) => (n / 100).toLocaleString("zh-TW", { maximumFractionDigits: 2 });
const field = "focus-ring w-full min-w-0 rounded border border-white/15 bg-[#080808] px-3 py-2 text-sm text-white";
const button = "focus-ring rounded border border-white/20 px-3 py-2 text-xs text-secondary hover:border-gold/50";
function MoneyInput({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return <label className="block min-w-0 text-xs text-secondary">{label}<input aria-label={label} inputMode="decimal" autoComplete="off" maxLength={30} value={value} onChange={(e) => onChange(e.target.value)} placeholder="沒有請填 0" className={`${field} mt-2 text-right`} />{hint ? <span className="mt-1 block text-[11px] leading-5 text-white/45">{hint}</span> : null}</label>;
}
export function SalaryBudgetTool() {
  const [s, setS] = useState(createSalaryBudget);
  const [remember, setRemember] = useState(false), [ready, setReady] = useState(false);
  const [notice, setNotice] = useState(""), [showIssues, setShowIssues] = useState(false), [confirmed, setConfirmed] = useState(false), [stale, setStale] = useState(false), [clearPrompt, setClearPrompt] = useState(false);
  const reserveDialog = useRef<HTMLDialogElement>(null);
  const a = analyzeSalaryBudget(s), total = allocationSummary(s), target = emergencyTarget(s);
  const hasAllocation = s.allocations.some((row) => parseMoney(row.amount) !== null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BUDGET_KEY);
      // Browser-only restore after hydration; financial inputs never reach the server.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) { setS(decodeSalaryBudget(saved)); setRemember(true); setStale(true); }
    } catch { setNotice("無法讀取本機資料；可重新填寫。請先備份需要保留的資料。"); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || !remember) return;
    try { localStorage.setItem(BUDGET_KEY, encodeSalaryBudget(s)); }
    catch { queueMicrotask(() => setNotice("此瀏覽器無法儲存，請匯出分配表。本次仍可填寫。")); }
  }, [s, ready, remember]);
  function change(patch: Partial<SalaryBudget>) { setS((current) => ({ ...current, ...patch })); setConfirmed(false); if (hasAllocation) setStale(true); }
  function expenseChange(id: string, patch: Partial<BudgetExpense>) { change({ expenses: s.expenses.map((row) => row.id === id ? { ...row, ...patch } : row) }); }
  function allocationChange(id: string, patch: Partial<BudgetAllocation>) {
    setS((current) => ({ ...current, allocations: current.allocations.map((row) => row.id === id ? { ...row, ...patch } : row) })); setConfirmed(false);
  }
  function generate() {
    const proposed = proposeSalaryBudget(s);
    setShowIssues(true); setConfirmed(false);
    if (!proposed) { setNotice("請先補齊目前金額、支出需求與備用金設定。其他分配項目若已新增，也需填金額。"); return; }
    setS((current) => ({ ...current, allocations: proposed })); setStale(false);
    setNotice("已依填寫需求產生建議，可直接修改。既有資金不重複加入薪資；不足會另外提醒。");
  }
  function addExpense() {
    if (s.expenses.length >= 50) return;
    change({ expenses: [...s.expenses, { id: crypto.randomUUID(), name: "自訂支出", amount: "", enabled: true, destination: "bank" }] });
  }
  function addAllocation(name: string) {
    if (s.allocations.length >= 30) return;
    setS((current) => ({ ...current, allocations: [...current.allocations, { id: crypto.randomUUID(), name, amount: "0", destination: "自行填寫放置位置" }] })); setConfirmed(false);
  }
  function exportPlan() {
    const url = URL.createObjectURL(new Blob([encodeSalaryBudget(s)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "bibeck-salary-budget.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("已匯出填寫資料與分配計畫；檔案含財務資料，請妥善保管。");
  }
  return <section aria-labelledby="salary-budget-title" className="rounded-xl border border-white/15 bg-[#111111] p-5 sm:p-6">
    <h2 id="salary-budget-title" className="text-2xl font-semibold text-white">薪資分配工具</h2>
    <p className="mt-2 text-sm text-secondary">先看目前配置，再分配這次薪資。</p>
    <p className="mt-2 text-xs leading-6 text-white/45">金額以新台幣填寫。本工具獨立使用，不連動財務盤點。</p>
    <h3 className="mt-6 text-sm font-semibold text-gold">01　目前配置</h3>
    <p className="mt-2 text-xs leading-6 text-white/55">不含本次薪資，同一筆錢只填一次。現金、銀行只填可供本期使用的錢；不含備用金或其他已保留用途。</p>
    <div className="mt-3 grid grid-cols-2 gap-3">
      <MoneyInput label="目前現金" value={s.cash} onChange={(cash) => change({ cash })} />
      <MoneyInput label="目前銀行" value={s.bank} onChange={(bank) => change({ bank })} />
    </div>
    <button type="button" onClick={() => reserveDialog.current?.showModal()} aria-haspopup="dialog" className="focus-ring mt-3 flex w-full items-center justify-between gap-3 rounded-lg border border-gold/30 px-3 py-3 text-left text-sm"><span className="text-white">緊急備用金<span className="mt-1 block text-xs text-white/50">點選計算目標與填寫已存金額</span></span><span className="text-right text-gold">{a.emergency === null ? "尚未填寫" : `${fmt(a.emergency)} 元`}<span className="mt-1 block text-xs text-white/50">{target === null ? "目標未設定" : `目標 ${fmt(target)} 元`}</span></span></button>
    <label className="mt-3 flex items-center gap-2 text-xs leading-6 text-secondary"><input type="checkbox" checked={s.buildEmergency} onChange={(e) => change({ buildEmergency: e.target.checked })} />本次依目標缺口補入緊急備用金</label>
    {!s.buildEmergency ? <p className="mt-1 text-xs text-white/45">本次建議不補入；仍需填目前備用金，沒有請填 0。</p> : null}
    <dialog ref={reserveDialog} aria-labelledby="reserve-title" className="m-auto max-h-[85svh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-xl border border-gold/30 bg-[#111111] p-6 text-white backdrop:bg-black/80">
      <div className="flex items-start justify-between gap-4"><h3 id="reserve-title" className="text-xl font-semibold">緊急備用金</h3><button type="button" aria-label="關閉緊急備用金窗格" className={button} onClick={() => reserveDialog.current?.close()}>✕</button></div>
      <p className="mt-3 text-xs leading-6 text-secondary">目標＝（每月必要生活費＋必要還款）×保障月數。必要生活費不含下方另填的還款。</p>
      <div className="mt-4 space-y-4">
        <MoneyInput label="每月必要生活費" value={s.emergencyLiving} onChange={(emergencyLiving) => change({ emergencyLiving })} hint="包含必要住房、餐飲、交通等，不含娛樂或儲蓄。" />
        <MoneyInput label="每月必要還款" value={s.emergencyDebt} onChange={(emergencyDebt) => change({ emergencyDebt })} hint="填每月必須支付的金額，不是剩餘總欠款。" />
        <label className="block text-xs text-secondary">保障月數<input aria-label="保障月數" inputMode="numeric" maxLength={2} className={`${field} mt-2`} value={s.emergencyMonths} onChange={(e) => change({ emergencyMonths: e.target.value })} /><span className="mt-1 block text-[11px] leading-5 text-white/45">可設定 1–36 個月。3 個月僅為起始值，依收入穩定性與家庭責任調整。</span></label>
        <MoneyInput label="目前已存緊急備用金" value={s.emergency} onChange={(emergency) => change({ emergency })} hint="這筆錢不要再列入目前現金或銀行。" />
      </div>
      <div className="mt-5 rounded-lg border border-gold/25 p-3 text-sm"><p className="flex justify-between gap-3 text-secondary">目標金額<span className="text-gold">{target === null ? "待填參數" : `${fmt(target)} 元`}</span></p><p className="mt-3 flex justify-between gap-3 text-secondary">尚需補足<span className="text-gold">{a.gap === null ? "待填金額" : a.gap === 0 ? "已達標" : `${fmt(a.gap)} 元`}</span></p></div>
      <p className="mt-3 text-xs leading-6 text-white/45">目標缺口不代表本次必須補滿。工具先考慮本期需求，再提出可調整的補入建議。</p>
      <button type="button" className="focus-ring mt-4 w-full rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-black" onClick={() => reserveDialog.current?.close()}>完成設定</button>
    </dialog>
    <h3 className="mt-6 text-sm font-semibold text-gold">02　本次薪資與需求</h3>
    <div className="mt-3"><MoneyInput label="本次實領薪資" value={s.salary} onChange={(salary) => change({ salary })} hint="只填已收到的金額；如果薪資已入帳，上面的目前銀行請先扣除這次薪資。" /></div>
    <label className="mt-3 block text-xs text-secondary">下次領薪日（選填）<input aria-label="下次領薪日" type="date" value={s.nextPayday} onChange={(e) => change({ nextPayday: e.target.value })} className={`${field} mt-2`} /><span className="mt-1 block text-[11px] leading-5 text-white/45">支出填到下次領薪前需支付的金額；日期僅作提醒，餐飲天數請自行確認。</span></label>
    <div className="mt-4 space-y-2">{s.expenses.map((row) => {
      const amount = row.id === "food" && s.foodMode === "formula" ? foodEstimate(s) : parseMoney(row.amount);
      return <details key={row.id} className="rounded-lg border border-white/12"><summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-sm"><span className="text-white">{row.name || "自訂支出"}</span><span className="text-gold">{!row.enabled ? "本期不需要" : amount === null ? "待填金額" : `${fmt(amount)} 元`} <span aria-hidden="true">⌄</span></span></summary><div className="border-t border-white/10 p-3">
        <label className="flex items-center gap-2 text-xs text-secondary"><input type="checkbox" checked={row.enabled} onChange={(e) => expenseChange(row.id, { enabled: e.target.checked })} />本期需要支付</label>
        {row.enabled ? <div className="mt-3 space-y-3">
          <label className="block text-xs text-secondary">項目名稱<input aria-label={`${row.name}支出名稱`} maxLength={100} className={`${field} mt-2`} value={row.name} onChange={(e) => expenseChange(row.id, { name: e.target.value })} /></label>
          {row.id === "food" ? <label className="block text-xs text-secondary">餐飲計算方式<select aria-label="餐飲計算方式" className={`${field} mt-2`} value={s.foodMode} onChange={(e) => change({ foodMode: e.target.value as SalaryBudget["foodMode"] })}><option value="direct">直接填總金額</option><option value="formula">餐數 × 單價 × 天數</option></select></label> : null}
          {row.id === "food" && s.foodMode === "formula" ? <div className="space-y-3"><label className="block text-xs text-secondary">每天幾餐<input aria-label="每天幾餐" inputMode="numeric" maxLength={2} className={`${field} mt-2`} value={s.meals} onChange={(e) => change({ meals: e.target.value })} /></label><MoneyInput label="每餐多少錢" value={s.mealCost} onChange={(mealCost) => change({ mealCost })} /><label className="block text-xs text-secondary">支撐天數<input aria-label="支撐天數" inputMode="numeric" maxLength={3} className={`${field} mt-2`} value={s.days} onChange={(e) => change({ days: e.target.value })} /></label><p className="text-xs text-gold">餐飲預算：{amount === null ? "請填有效參數（1–10 餐、1–366 天）" : `${fmt(amount)} 元`}</p></div> : <MoneyInput label={`${row.name}本期金額`} value={row.amount} onChange={(amount) => expenseChange(row.id, { amount })} />}
          <label className="block text-xs text-secondary">付款方式<select aria-label={`${row.name}付款方式`} className={`${field} mt-2`} value={row.destination} onChange={(e) => expenseChange(row.id, { destination: e.target.value as BudgetExpense["destination"] })}><option value="cash">現金支付</option><option value="bank">銀行／電子支付</option></select></label>
          {row.id === "loan" ? <p className="text-xs leading-6 text-white/45">填本期應繳，不填總欠款。信用卡帳款與其中已含的餐飲等支出不要重複預留。</p> : null}
        </div> : <p className="mt-3 text-xs leading-6 text-white/45">本期不納入需求。原有數字保留，重新勾選可恢復。</p>}
      </div></details>;
    })}</div>
    <button type="button" className="focus-ring mt-3 text-xs text-gold" onClick={addExpense}>＋新增支出</button>
    <p className="mt-3 text-xs leading-6 text-white/45">餐飲可用公式估算。沒有的項目請填 0 或取消勾選；空白不視為已確認的零。預算尚未包含的年繳費、保險等可自行新增。</p>
    <button type="button" onClick={generate} className="focus-ring mt-4 w-full rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-black">產生／重新計算分配建議</button>
    <h3 className="mt-6 text-sm font-semibold text-gold">03　本次分配</h3>
    <p className="mt-2 text-xs leading-6 text-white/50">只分配本次薪資。現金、銀行先補本期需求；剩餘可補備用金，其他目標由你指定。</p>
    <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg border border-gold/25 p-3" aria-live="polite"><div><p className="text-xs text-secondary">本次薪資</p><p className="mt-1 text-lg text-white">{a.salary === null ? "待填金額" : fmt(a.salary)}</p></div><div><p className="text-xs text-secondary">{total.remaining !== null && total.remaining < 0 ? "超出金額" : "尚未分配"}</p><p className={`mt-1 text-lg ${total.remaining !== null && total.remaining < 0 ? "text-red-400" : "text-gold"}`}>{!hasAllocation || total.remaining === null ? "待分配" : fmt(Math.abs(total.remaining))}</p></div></div>
    {stale ? <p role="status" className="mt-3 text-xs leading-6 text-gold">需求或目前配置已更新。現有分配保留，請重新計算建議或自行調整後確認。</p> : null}
    <div className="mt-4 space-y-2">{s.allocations.map((row) => <details key={row.id} className="rounded-lg border border-white/12"><summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-sm"><span className="text-white">{row.name || "其他用途"}</span><span className="text-gold">{parseMoney(row.amount) === null ? "待分配" : `${fmt(parseMoney(row.amount)!)} 元`} <span aria-hidden="true">⌄</span></span></summary><div className="space-y-3 border-t border-white/10 p-3">
      <MoneyInput label={`本次分配：${row.name}`} value={row.amount} onChange={(amount) => allocationChange(row.id, { amount })} />
      {!["cash", "bank", "emergency"].includes(row.id) ? <label className="block text-xs text-secondary">用途名稱<input aria-label={`${row.name}用途名稱`} maxLength={100} className={`${field} mt-2`} value={row.name} onChange={(e) => allocationChange(row.id, { name: e.target.value })} /></label> : null}
      <label className="block text-xs text-secondary">放置位置<input aria-label={`${row.name}放置位置`} maxLength={100} className={`${field} mt-2`} value={row.destination} onChange={(e) => allocationChange(row.id, { destination: e.target.value })} /></label>
      {row.id === "emergency" ? <p className="text-xs leading-6 text-white/50">{a.gap === null ? "目標未設定；本次金額可自行安排。" : `目前距目標 ${fmt(a.gap)} 元。達標時建議為 0，可自行調整。`}</p> : null}
      {!["cash", "bank", "emergency"].includes(row.id) ? <button type="button" className="focus-ring text-xs text-red-400" onClick={() => { setS((current) => ({ ...current, allocations: current.allocations.filter((e) => e.id !== row.id) })); setConfirmed(false); }}>移除此分配</button> : null}
    </div></details>)}</div>
    <div className="mt-3 flex flex-wrap gap-2">{["其他儲蓄", "定存", "額外還款", "投資", "自訂用途"].map((name) => <button key={name} type="button" className={button} onClick={() => addAllocation(name)}>＋{name}</button>)}</div>
    {showIssues || hasAllocation ? <div className="mt-4 rounded-lg border border-white/12 p-3" aria-live="polite"><h4 className="text-xs font-semibold text-white">{total.issues.length ? "需要確認" : "分配檢查"}</h4>{total.issues.length ? <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-6 text-secondary">{total.issues.map((issue, i) => <li key={`${i}-${issue}`}>{issue}</li>)}</ul> : <p className="mt-2 text-xs leading-6 text-secondary">分配未超出薪資，本期現金與銀行需求已涵蓋。{total.remaining ? `還有 ${fmt(total.remaining)} 元可另行安排。` : "本次薪資已全部分配。"}</p>}</div> : null}
    <p className="mt-3 text-xs leading-6 text-white/45">現金、銀行是付款位置；餐費、娛樂等是其用途，不另外重複加算。調低分配會釋出餘額；若需求未降低，仍會提醒缺口。</p>
    <button type="button" className="focus-ring mt-4 w-full rounded-lg border border-gold/50 px-4 py-3 text-sm font-semibold text-gold" onClick={() => { setShowIssues(true); setConfirmed(!total.issues.length && hasAllocation); setStale(false); setNotice(total.issues.length || !hasAllocation ? "請先處理需要確認的項目。" : "本次分配計畫已確認，請依清單自行放置資金。"); }}>確認本次分配</button>
    {confirmed ? <div className="mt-4 rounded-lg border border-gold/30 p-3"><h4 className="text-sm text-white">本次放置清單</h4><ul className="mt-3 space-y-3 text-xs">{s.allocations.map((row) => <li key={row.id} className="flex justify-between gap-3"><span className="break-words text-secondary">{row.name} → {row.destination}</span><span className="shrink-0 text-gold">{fmt(parseMoney(row.amount) ?? 0)} 元</span></li>)}</ul></div> : null}
    <p className="mt-3 text-xs leading-6 text-white/45">這是分配計畫，不代表已付款或轉帳，也不會更新盤點餘額。下次使用請重新核對目前配置。</p>
    <div className="mt-5 border-t border-white/12 pt-4"><label className="flex items-center gap-2 text-sm text-secondary"><input type="checkbox" disabled={!ready} checked={remember} onChange={(e) => { try { if (!e.target.checked) localStorage.removeItem(BUDGET_KEY); setRemember(e.target.checked); setNotice(e.target.checked ? "已選擇保留於此瀏覽器。" : "已停止保留，目前填寫仍可使用。"); } catch { setNotice("無法變更本機儲存，請檢查瀏覽器設定。"); } }} />記住此裝置</label><p className="mt-2 text-xs leading-6 text-white/45">預設不保留。啟用後只存於此瀏覽器，不上傳、不跨裝置同步；共用電腦請勿保留。</p><div className="mt-3 flex gap-5 text-xs"><button type="button" className="focus-ring text-gold" onClick={exportPlan}>匯出分配表</button><button type="button" className="focus-ring text-white/50" onClick={() => setClearPrompt(true)}>清除工具資料</button></div>
      {clearPrompt ? <div className="mt-3 rounded border border-red-400/30 p-3"><p className="text-xs leading-6 text-secondary">清除此工具填寫與本機備份？需要的資料請先匯出。</p><div className="mt-2 flex gap-4"><button type="button" className="focus-ring text-xs text-red-400" onClick={() => { try { localStorage.removeItem(BUDGET_KEY); setS(createSalaryBudget()); setRemember(false); setConfirmed(false); setStale(false); setShowIssues(false); setClearPrompt(false); setNotice("本工具資料已清除。"); } catch { setNotice("無法清除本機資料。"); } }}>確認清除</button><button type="button" className="focus-ring text-xs text-secondary" onClick={() => setClearPrompt(false)}>取消</button></div></div> : null}
    </div>
    {notice ? <p role="status" className="mt-3 text-xs leading-6 text-gold">{notice}</p> : null}
  </section>;
}
