"use client";
import { useEffect, useRef, useState } from "react";
import { createInventory, decodeInventory, encodeInventory, INVENTORY_KEY, parseMoney, summarizeInventory, type InventoryEntry, type InventoryGroup } from "@/lib/financial-inventory";
const format = (cents: number) => (cents / 100).toLocaleString("zh-TW", { maximumFractionDigits: 2 });
const fieldClass = "focus-ring w-full min-w-0 rounded border border-white/15 bg-[#080808] px-3 py-2 text-sm text-white";
const hints: Record<string, string> = {
  cash: "數一數實際現金。錢包與家中分開填。", bank: "打開銀行 App 查餘額。預備金若在此帳戶，用『已安排用途』標記，別再新增一次資產。",
  payment: "只填已儲值的餘額，信用額度與優惠點數不列入。", investment: "填目前市值，不填投入本金。交易所總資產與裡面的幣擇一記錄，勿重複。",
  receivable: "只有屬於你的款項才列入；未收到前不要勾選可立即動用。", other: "房車用合理現值、保單用可核對的解約價值，不填保額。估值請標記『估計』。",
  credit: "核對已出帳、未出帳與未到期分期的全部欠款；勿把已包含的分期再加一次，不填可用額度。", loan: "填剩餘本金，不填每月付款或全部未來本息。信用卡分期若已記入信用卡，不重複填。", private: "填仍欠他人的金額；與前面貸款若是同一筆，只記一次。",
};
export function FinancialInventoryTool() {
  const [groups, setGroups] = useState(createInventory);
  const [remember, setRemember] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [review, setReview] = useState(false);
  const [clearPrompt, setClearPrompt] = useState(false);
  const [imported, setImported] = useState<InventoryGroup[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_KEY);
      // Restore only after hydration; the server never reads financial data.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) { setGroups(decodeInventory(saved)); setRemember(true); }
    } catch { setNotice("無法讀取儲存資料。可重新填寫；啟用記住此裝置前請先確認。"); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      if (remember) localStorage.setItem(INVENTORY_KEY, encodeInventory(groups));

    } catch { queueMicrotask(() => setNotice("此瀏覽器無法儲存資料，請匯出備份。這次填寫仍可使用。")); }
  }, [groups, remember, ready]);
  const totals = summarizeInventory(groups);
  const updateGroup = (id: string, change: Partial<InventoryGroup>) => setGroups((current) => current.map((g) => g.id === id ? { ...g, ...change } : g));
  const updateEntry = (groupId: string, entryId: string, change: Partial<InventoryEntry>) => setGroups((current) => current.map((g) => g.id === groupId ? { ...g, entries: g.entries.map((e) => e.id === entryId ? { ...e, ...change } : e) } : g));
  function addEntry(group: InventoryGroup) {
    if (group.entries.length >= 100) { setNotice("每個類別最多 100 項。"); return; }
    updateGroup(group.id, { status: "yes", entries: [...group.entries, { id: crypto.randomUUID(), name: "", amount: "", available: ["cash", "bank"].includes(group.id), reserved: "", verification: "pending" }] });
  }
  function exportData() {
    const url = URL.createObjectURL(new Blob([encodeInventory(groups)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "bibeck-financial-inventory.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("已匯出備份，檔案含財務資料，請妥善保管。");
  }
  async function readImport(file: File | undefined) {
    if (!file) return;
    try { if (file.size > 1_000_000) throw new Error("檔案過大。"); setImported(decodeInventory(await file.text())); setNotice(""); }
    catch { setNotice("無法匯入：請選擇此工具匯出的有效 JSON 備份。"); }
    if (fileRef.current) fileRef.current.value = "";
  }
  return <section aria-labelledby="inventory-tool-title" className="rounded-xl border border-white/15 bg-[#111111] p-5 sm:p-6">
    <h2 id="inventory-tool-title" className="text-2xl font-semibold text-white">財務盤點工具</h2>
    <p className="mt-2 text-sm text-secondary">找到餘額，填入數字。</p><p className="mt-2 text-xs leading-6 text-white/45">金額以新台幣填寫，只填屬於你的部分。外幣請先換算，不同帳戶不要重複列入。</p>
    <div className="mt-5 grid grid-cols-3 gap-3 border-b border-gold/35 pb-5">
      {[{ label: "資產", value: totals.assets, color: "text-white" }, { label: "負債", value: totals.liabilities, color: "text-red-400" }, { label: "淨資產", value: totals.net, color: "text-gold" }].map((item) => <div key={item.label} className="min-w-0"><p className="text-xs text-secondary">{item.label}</p><p className={`mt-2 break-words text-lg font-semibold tabular-nums ${item.color}`}>{format(item.value)}</p></div>)}
    </div>
    <p className="mt-3 text-xs text-white/50">{totals.issues.length ? `暫計結果 · ${totals.issues.length} 項待確認` : "已填項目均已核對 · 請確認沒有遺漏"}</p>
    <div className="mt-4 space-y-2">{groups.map((group) => {
      const sum = group.status === "yes" ? group.entries.reduce((total, e) => total + (parseMoney(e.amount) ?? 0), 0) : 0;
      return <details key={group.id} className="rounded-lg border border-white/12">
        <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-sm"><span className="font-medium text-white">{group.title}</span><span className={group.debt ? "text-red-400" : "text-gold"}>{group.status === "no" ? "沒有" : group.status === "unknown" ? "待盤點" : format(sum)} <span aria-hidden="true">⌄</span></span></summary>
        <div className="border-t border-white/10 px-3 pb-4 pt-3"><div className="flex gap-2" role="group" aria-label={`${group.title}是否持有`}>{([{ value: "yes", label: "有" }, { value: "no", label: "沒有" }, { value: "unknown", label: "不確定" }] as const).map((choice) => <button type="button" key={choice.value} aria-pressed={group.status === choice.value} onClick={() => updateGroup(group.id, { status: choice.value })} className={`focus-ring rounded border px-3 py-2 text-xs ${group.status === choice.value ? "border-gold/60 bg-gold/10 text-gold" : "border-white/15 text-secondary"}`}>{choice.label}</button>)}</div>
        {group.status === "yes" ? <><p className="my-3 text-xs leading-6 text-white/50">{hints[group.id]}</p><div className="space-y-4">{group.entries.map((entry) => <div key={entry.id} className="border-t border-white/10 pt-3">
          <label className="block text-xs text-secondary">項目名稱<input aria-label={`${group.title}項目名稱`} maxLength={100} className={`${fieldClass} mt-2`} value={entry.name} placeholder="例如：薪轉帳戶" onChange={(e) => updateEntry(group.id, entry.id, { name: e.target.value })} /></label>
          <label className="mt-3 flex items-center gap-3 text-xs text-secondary"><span className="shrink-0">{group.debt ? "目前欠款" : "目前餘額"}</span><input aria-label={`${entry.name || group.title}${group.debt ? "欠款" : "餘額"}`} inputMode="decimal" autoComplete="off" maxLength={30} className={`${fieldClass} text-right`} placeholder="填金額" value={entry.amount} onChange={(e) => updateEntry(group.id, entry.id, { amount: e.target.value, verification: "pending" })} /></label>
          {!group.debt ? <><label className="mt-3 flex items-center gap-2 text-xs leading-6 text-secondary"><input type="checkbox" checked={entry.available} onChange={(e) => updateEntry(group.id, entry.id, { available: e.target.checked })} />現在可直接拿來付款（不用賣出或解約）</label>{entry.available ? <label className="mt-3 block text-xs leading-6 text-secondary">其中已留給帳單、生活費或預備金<input aria-label={`${entry.name || group.title}已安排用途`} inputMode="decimal" autoComplete="off" maxLength={30} className={`${fieldClass} mt-2 text-right`} placeholder="沒有可留白" value={entry.reserved} onChange={(e) => updateEntry(group.id, entry.id, { reserved: e.target.value })} /></label> : null}</> : null}
          <div className="mt-3 flex items-center justify-between gap-3"><label className="text-xs text-secondary"><span className="sr-only">{entry.name}核對狀態</span><select aria-label={`${entry.name || group.title}核對狀態`} value={entry.verification} onChange={(e) => updateEntry(group.id, entry.id, { verification: e.target.value as InventoryEntry["verification"] })} className="focus-ring rounded border border-white/15 bg-[#080808] px-2 py-2 text-xs text-white"><option value="pending">待核對</option><option value="confirmed">已查明細核對</option><option value="estimated">估計值</option></select></label><button type="button" aria-label={`移除${entry.name || "此項目"}`} onClick={() => updateGroup(group.id, { entries: group.entries.filter((e) => e.id !== entry.id) })} className="focus-ring text-xs text-white/50 hover:text-red-400">移除</button></div>
        </div>)}</div><button type="button" onClick={() => addEntry(group)} className="focus-ring mt-4 text-sm text-gold">＋新增{group.title}項目</button></> : <p className="mt-3 text-xs leading-6 text-white/50">{group.status === "no" ? "此類別不納入計算。原有填寫保留，選『有』可恢復。" : "請確認是否有此類資產或欠款；不確定不會視為零。"}</p>}
        </div>
      </details>;
    })}</div>
    <h3 className="mt-6 text-sm font-semibold text-white">這些錢，現在怎麼用？</h3><dl className="mt-3 space-y-3 text-sm">{[{ label: "可立即動用", value: totals.available }, { label: "已安排用途", value: totals.reserved }, { label: "尚未安排用途", value: totals.unallocated }].map((item) => <div key={item.label} className="flex justify-between gap-3"><dt className="text-secondary">{item.label}</dt><dd className="text-gold tabular-nums">{format(item.value)}</dd></div>)}</dl><p className="mt-3 text-xs leading-6 text-white/45">尚未安排用途不等於可以隨意花費。欠款不會自動扣除現金，請另預留到期還款。</p>
    <button type="button" onClick={() => setReview(true)} className="focus-ring mt-5 w-full rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-black">核對盤點結果</button>
    {review ? <div className="mt-4 rounded border border-white/15 p-3" aria-live="polite"><h3 className="text-sm font-medium text-white">{totals.issues.length ? "以下項目需要確認" : "已填資料核對完成"}</h3>{totals.issues.length ? <ul className="mt-2 list-disc space-y-2 pl-4 text-xs leading-6 text-secondary">{totals.issues.map((issue, i) => <li key={`${issue}-${i}`}>{issue}</li>)}</ul> : <p className="mt-2 text-xs leading-6 text-secondary">目前資產 {format(totals.assets)} 元，欠款 {format(totals.liabilities)} 元；尚未安排用途 {format(totals.unallocated)} 元。請再確認全部帳戶已列入，預備金、分期與跨帳戶轉帳沒有重複。</p>}<p className="mt-3 text-xs leading-6 text-white/45">系統無法直接查證你的帳戶，仍需你依明細核對。</p></div> : null}
    <div className="mt-6 border-t border-white/12 pt-4"><label className="flex items-center gap-2 text-sm text-secondary"><input type="checkbox" checked={remember} disabled={!ready} onChange={(e) => { if (!e.target.checked) { try { localStorage.removeItem(INVENTORY_KEY); } catch { setNotice("無法移除此瀏覽器備份，請檢查瀏覽器設定。"); return; } } setRemember(e.target.checked); setNotice(e.target.checked ? "已選擇保留於此瀏覽器。" : "已停止保留；目前填寫仍可使用，關閉後不再保留。"); }} />記住此裝置</label><p className="mt-2 text-xs leading-6 text-white/45">啟用後僅儲存在此瀏覽器，不上傳、不跨裝置同步。清除瀏覽器資料可能遺失；共用電腦請勿保留。</p><div className="mt-3 flex flex-wrap gap-5 text-xs text-gold"><button type="button" className="focus-ring" onClick={exportData}>匯出備份</button><button type="button" className="focus-ring" onClick={() => fileRef.current?.click()}>匯入備份</button><button type="button" className="focus-ring text-white/55" onClick={() => setClearPrompt(true)}>清除資料</button></div><input ref={fileRef} type="file" accept=".json,application/json" className="sr-only" aria-label="選擇財務盤點備份" onChange={(e) => void readImport(e.target.files?.[0])} />
    {imported ? <div className="mt-4 rounded border border-gold/30 p-3"><p className="text-xs leading-6 text-secondary">匯入將取代目前清單。建議先匯出目前資料。</p><div className="mt-2 flex gap-4"><button type="button" className="focus-ring text-xs text-gold" onClick={() => { setGroups(imported); setImported(null); setReview(false); setNotice("備份已匯入。"); }}>確認匯入</button><button type="button" className="focus-ring text-xs text-secondary" onClick={() => setImported(null)}>取消</button></div></div> : null}
    {clearPrompt ? <div className="mt-4 rounded border border-red-400/30 p-3"><p className="text-xs leading-6 text-secondary">清除本工具的填寫與此瀏覽器備份？請先匯出需要保留的資料。</p><div className="mt-2 flex gap-4"><button type="button" className="focus-ring text-xs text-red-400" onClick={() => { try { localStorage.removeItem(INVENTORY_KEY); setGroups(createInventory()); setRemember(false); setReview(false); setImported(null); setClearPrompt(false); setNotice("本工具資料已清除。"); } catch { setNotice("無法清除瀏覽器備份，請檢查瀏覽器設定。"); } }}>確認清除</button><button type="button" className="focus-ring text-xs text-secondary" onClick={() => setClearPrompt(false)}>取消</button></div></div> : null}
    {notice ? <p role="status" className="mt-3 text-xs leading-6 text-gold">{notice}</p> : null}</div>
  </section>;
}
