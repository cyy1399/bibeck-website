export type InventoryEntry = { id: string; name: string; amount: string; available: boolean; reserved: string; verification: "confirmed" | "estimated" | "pending" };
export type InventoryGroup = { id: string; title: string; debt: boolean; status: "yes" | "no" | "unknown"; entries: InventoryEntry[] };
export const INVENTORY_KEY = "bibeck-financial-inventory-v1";
export function createInventory(): InventoryGroup[] {
  return [
    ["cash", "現金", false, ["錢包現金", "家中現金"]],
    ["bank", "銀行存款", false, ["銀行帳戶"]],
    ["payment", "電子支付與儲值", false, ["電子支付／交通卡"]],
    ["investment", "投資資產", false, ["券商／交易所／錢包"]],
    ["receivable", "別人欠我的錢", false, ["借出款／應收款"]],
    ["other", "其他資產", false, ["押金／保單解約價值／房車"]],
    ["credit", "信用卡欠款", true, ["信用卡全部未清償欠款"]],
    ["loan", "貸款與分期", true, ["貸款剩餘本金"]],
    ["private", "私人借款", true, ["向他人借入款"]],
  ].map(([id, title, debt, names]) => ({ id: id as string, title: title as string, debt: debt as boolean, status: "unknown", entries: (names as string[]).map((name, index) => ({ id: `${id}-${index}`, name, amount: "", available: ["cash", "bank"].includes(id as string), reserved: "", verification: "pending" })) }));
}
// Integer cents avoid floating-point drift. Empty and invalid input remain unknown, never zero.
export function parseMoney(value: string): number | null {
  const clean = value.trim().replaceAll(",", "");
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(clean)) return null;
  const [whole, fraction = ""] = clean.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}
export function summarizeInventory(groups: InventoryGroup[]) {
  let assets = 0, liabilities = 0, available = 0, reserved = 0;
  const issues: string[] = [];
  for (const group of groups) {
    if (group.status === "unknown") { issues.push(`${group.title}：尚未確認有沒有`); continue; }
    if (group.status === "no") continue;
    if (!group.entries.length) issues.push(`${group.title}：尚未新增項目`);
    const names = new Set<string>();
    for (const entry of group.entries) {
      const label = entry.name.trim() || group.title;
      if (!entry.name.trim()) issues.push(`${group.title}：請填項目名稱`);
      if (names.has(label)) issues.push(`${label}：名稱重複，請確認是否同一筆`);
      names.add(label);
      const value = parseMoney(entry.amount);
      if (value === null) { issues.push(`${label}：請填有效金額（最多兩位小數）`); continue; }
      if (group.debt) liabilities += value;
      else assets += value;
      if (entry.verification !== "confirmed") issues.push(`${label}：${entry.verification === "estimated" ? "目前為估計值" : "尚未核對"}`);
      if (!group.debt && entry.available) {
        available += value;
        const allocated = entry.reserved.trim() === "" ? 0 : parseMoney(entry.reserved);
        if (allocated === null || allocated > value) issues.push(`${label}：已安排用途金額須介於 0 與餘額之間`);
        else reserved += allocated;
      }
    }
  }
  return { assets, liabilities, net: assets - liabilities, available, reserved, unallocated: available - reserved, issues };
}
export function encodeInventory(groups: InventoryGroup[]) { return JSON.stringify({ version: 1, groups }, null, 2); }
export function decodeInventory(raw: string): InventoryGroup[] {
  if (raw.length > 1_000_000) throw new Error("備份過大，請選擇此工具匯出的 JSON 檔。");
  const data = JSON.parse(raw);
  const template = createInventory();
  if (!data || data.version !== 1 || !Array.isArray(data.groups) || data.groups.length !== template.length) throw new Error("不支援的備份格式。");
  return template.map((base) => {
    const matches = data.groups.filter((g: { id?: unknown }) => g && g.id === base.id);
    if (matches.length !== 1) throw new Error("備份項目不完整或重複。");
    const group = matches[0];
    if (!["yes", "no", "unknown"].includes(group.status) || !Array.isArray(group.entries) || group.entries.length > 100) throw new Error("備份內容無效。");
    const ids = new Set<string>();
    const entries = group.entries.map((e: InventoryEntry) => {
      if (!e || typeof e.id !== "string" || e.id.length > 100 || ids.has(e.id) || typeof e.name !== "string" || e.name.length > 100 || typeof e.amount !== "string" || e.amount.length > 30 || typeof e.reserved !== "string" || e.reserved.length > 30 || typeof e.available !== "boolean" || !["confirmed", "estimated", "pending"].includes(e.verification)) throw new Error("備份欄位無效。");
      ids.add(e.id);
      return { id: e.id, name: e.name, amount: e.amount, reserved: e.reserved, available: e.available, verification: e.verification };
    });
    return { ...base, status: group.status, entries };
  });
}
