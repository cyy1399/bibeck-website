import { parseMoney } from "./financial-inventory.ts";
export type BudgetExpense = { id: string; name: string; amount: string; enabled: boolean; destination: "cash" | "bank" };
export type BudgetAllocation = { id: string; name: string; amount: string; destination: string };
export type SalaryBudget = {
  cash: string; bank: string; emergency: string; salary: string; nextPayday: string;
  emergencyLiving: string; emergencyDebt: string; emergencyMonths: string; buildEmergency: boolean;
  foodMode: "direct" | "formula"; meals: string; mealCost: string; days: string;
  expenses: BudgetExpense[]; allocations: BudgetAllocation[];
};
export const BUDGET_KEY = "bibeck-salary-budget-v1";
export const defaultAllocations = (): BudgetAllocation[] => [
  { id: "cash", name: "現金", amount: "", destination: "錢包／家中現金" },
  { id: "bank", name: "銀行", amount: "", destination: "一般銀行帳戶" },
  { id: "emergency", name: "緊急備用金", amount: "", destination: "緊急備用金帳戶" },
];
export function createSalaryBudget(): SalaryBudget {
  return { cash: "", bank: "", emergency: "", salary: "", nextPayday: "", emergencyLiving: "", emergencyDebt: "", emergencyMonths: "3", buildEmergency: true, foodMode: "direct", meals: "", mealCost: "", days: "30", expenses: [
    ["food", "餐飲費", "cash"], ["transport", "交通費", "cash"], ["phone", "手機／網路費", "bank"],
    ["subscription", "訂閱費", "bank"], ["loan", "本期貸款／信用卡應繳", "bank"], ["housing", "房租／水電", "bank"], ["entertainment", "娛樂費", "cash"],
  ].map(([id, name, destination]) => ({ id, name, amount: "", enabled: true, destination: destination as "cash" | "bank" })), allocations: defaultAllocations() };
}
const moneyString = (cents: number) => (cents / 100).toFixed(2);
export function foodEstimate(s: SalaryBudget): number | null {
  const meals = Number(s.meals), days = Number(s.days), cost = parseMoney(s.mealCost);
  if (!/^\d+$/.test(s.meals) || !/^\d+$/.test(s.days) || meals < 1 || meals > 10 || days < 1 || days > 366 || cost === null) return null;
  const result = meals * days * cost;
  return Number.isSafeInteger(result) && result <= 999999999999 ? result : null;
}
export function emergencyTarget(s: SalaryBudget): number | null {
  const living = parseMoney(s.emergencyLiving), debt = parseMoney(s.emergencyDebt), months = Number(s.emergencyMonths);
  if (living === null || debt === null || !/^\d+$/.test(s.emergencyMonths) || months < 1 || months > 36) return null;
  const target = (living + debt) * months;
  return Number.isSafeInteger(target) && target <= 999999999999 ? target : null;
}
export function analyzeSalaryBudget(s: SalaryBudget) {
  const issues: string[] = [];
  const cash = parseMoney(s.cash), bank = parseMoney(s.bank), emergency = parseMoney(s.emergency), salary = parseMoney(s.salary);
  for (const [label, value] of [["目前現金", cash], ["目前銀行", bank], ["目前緊急備用金", emergency], ["本次實領薪資", salary]] as const) if (value === null) issues.push(`${label}：請填金額，沒有請填 0`);
  let cashNeed = 0, bankNeed = 0;
  for (const e of s.expenses) {
    if (!e.enabled) continue;
    const amount = e.id === "food" && s.foodMode === "formula" ? foodEstimate(s) : parseMoney(e.amount);
    if (amount === null) issues.push(`${e.name || "自訂項目"}：請填有效金額或選擇本期不需要`);
    else if (e.destination === "cash") cashNeed += amount;
    else bankNeed += amount;
    if (!e.name.trim()) issues.push("自訂支出：請填名稱");
  }
  const target = emergencyTarget(s);
  if (s.buildEmergency && target === null) issues.push("緊急備用金：請設定目標，或選擇本次不補入");
  const gap = target !== null && emergency !== null ? Math.max(0, target - emergency) : null;
  const cashTopUp = Math.max(0, cashNeed - (cash ?? 0)), bankTopUp = Math.max(0, bankNeed - (bank ?? 0));
  return { issues, cash, bank, emergency, salary, cashNeed, bankNeed, cashTopUp, bankTopUp, target, gap };
}
export function proposeSalaryBudget(s: SalaryBudget): BudgetAllocation[] | null {
  const a = analyzeSalaryBudget(s);
  if (a.issues.length || a.salary === null) return null;
  // Preserve user-set optional goals; never invent entertainment or investment budgets.
  const optional = s.allocations.filter((row) => !["cash", "bank", "emergency"].includes(row.id));
  if (optional.some((row) => parseMoney(row.amount) === null || !row.name.trim())) return null;
  const optionalTotal = optional.reduce((n, row) => n + (parseMoney(row.amount) ?? 0), 0);
  const spare = Math.max(0, a.salary - a.cashTopUp - a.bankTopUp - optionalTotal);
  const reserve = s.buildEmergency ? Math.min(a.gap ?? 0, spare) : 0;
  return [
    { ...s.allocations.find((row) => row.id === "cash")!, amount: moneyString(a.cashTopUp) },
    { ...s.allocations.find((row) => row.id === "bank")!, amount: moneyString(a.bankTopUp) },
    { ...s.allocations.find((row) => row.id === "emergency")!, amount: moneyString(reserve) }, ...optional,
  ];
}
export function allocationSummary(s: SalaryBudget) {
  const a = analyzeSalaryBudget(s), issues = [...a.issues];
  let allocated = 0;
  for (const row of s.allocations) {
    const amount = parseMoney(row.amount);
    if (amount === null) issues.push(`${row.name || "分配項目"}：請填分配金額`);
    else allocated += amount;
    if (!row.name.trim() || !row.destination.trim()) issues.push("分配項目：請填名稱與放置位置");
  }
  const allocation = (id: string) => parseMoney(s.allocations.find((row) => row.id === id)?.amount ?? "") ?? 0;
  const cashShortfall = Math.max(0, a.cashNeed - (a.cash ?? 0) - allocation("cash"));
  const bankShortfall = Math.max(0, a.bankNeed - (a.bank ?? 0) - allocation("bank"));
  const remaining = a.salary === null ? null : a.salary - allocated;
  if (remaining !== null && remaining < 0) issues.push(`分配超出薪資 ${(Math.abs(remaining) / 100).toLocaleString("zh-TW")} 元`);
  if (cashShortfall) issues.push(`現金用途仍不足 ${(cashShortfall / 100).toLocaleString("zh-TW")} 元`);
  if (bankShortfall) issues.push(`銀行用途仍不足 ${(bankShortfall / 100).toLocaleString("zh-TW")} 元`);
  return { ...a, issues, allocated, remaining, cashShortfall, bankShortfall, emergencyAfter: a.emergency === null ? null : a.emergency + allocation("emergency") };
}
export function encodeSalaryBudget(s: SalaryBudget) { return JSON.stringify({ version: 1, budget: s }, null, 2); }
export function decodeSalaryBudget(raw: string): SalaryBudget {
  if (raw.length > 200000) throw new Error("資料過大");
  const data = JSON.parse(raw), s = data?.budget;
  if (data?.version !== 1 || !s || typeof s !== "object") throw new Error("格式錯誤");
  const base = createSalaryBudget();
  for (const key of ["cash", "bank", "emergency", "salary", "nextPayday", "emergencyLiving", "emergencyDebt", "emergencyMonths", "meals", "mealCost", "days"] as const) if (typeof s[key] !== "string" || s[key].length > 30) throw new Error("欄位錯誤");
  if (typeof s.buildEmergency !== "boolean" || !["direct", "formula"].includes(s.foodMode) || !Array.isArray(s.expenses) || s.expenses.length > 50 || !Array.isArray(s.allocations) || s.allocations.length > 30) throw new Error("格式錯誤");
  const ids = new Set<string>();
  const expenses = s.expenses.map((e: BudgetExpense) => {
    if (!e || typeof e.id !== "string" || e.id.length > 100 || ids.has(e.id) || typeof e.name !== "string" || e.name.length > 100 || typeof e.amount !== "string" || e.amount.length > 30 || typeof e.enabled !== "boolean" || !["cash", "bank"].includes(e.destination)) throw new Error("支出格式錯誤");
    ids.add(e.id); return { id: e.id, name: e.name, amount: e.amount, enabled: e.enabled, destination: e.destination };
  });
  ids.clear();
  const allocations = s.allocations.map((e: BudgetAllocation) => {
    if (!e || typeof e.id !== "string" || e.id.length > 100 || ids.has(e.id) || typeof e.name !== "string" || e.name.length > 100 || typeof e.amount !== "string" || e.amount.length > 30 || typeof e.destination !== "string" || e.destination.length > 100) throw new Error("分配格式錯誤");
    ids.add(e.id); return { id: e.id, name: e.name, amount: e.amount, destination: e.destination };
  });
  if (!["cash", "bank", "emergency"].every((id) => ids.has(id))) throw new Error("缺少必要項目");
  return { ...base, ...Object.fromEntries(Object.keys(base).filter((key) => !["expenses", "allocations"].includes(key)).map((key) => [key, s[key]])), expenses, allocations };
}
