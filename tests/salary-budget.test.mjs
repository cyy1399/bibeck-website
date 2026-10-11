import test from "node:test";
import assert from "node:assert/strict";
import { createSalaryBudget, analyzeSalaryBudget, foodEstimate, emergencyTarget, proposeSalaryBudget, allocationSummary, encodeSalaryBudget, decodeSalaryBudget } from "../lib/salary-budget.ts";
const baseline = () => ({ ...createSalaryBudget(), cash: "3000", bank: "8000", emergency: "100000", salary: "60000", emergencyLiving: "20000", emergencyDebt: "5000", emergencyMonths: "4", expenses: [
 { id: "food", name: "生活費", amount: "15000", enabled: true, destination: "cash" },
 { id: "loan", name: "帳單與還款", amount: "20000", enabled: true, destination: "bank" },
], allocations: [...createSalaryBudget().allocations, { id: "saving", name: "其他儲蓄", amount: "15000", destination: "儲蓄帳戶" }] });
test("current balances cover needs once; completed reserve gets no new allocation", () => {
 const s = baseline(); s.allocations = proposeSalaryBudget(s);
 assert.deepEqual(s.allocations.map((r) => r.amount), ["12000.00", "12000.00", "0.00", "15000"]);
 const t = allocationSummary(s); assert.equal(t.remaining, 2100000); assert.equal(t.issues.length, 0); assert.equal(t.emergencyAfter, 10000000);
});
test("reserve top-up is bounded by both gap and salary remaining", () => {
 const s = baseline(); s.emergency = "90000"; s.allocations = proposeSalaryBudget(s);
 assert.equal(s.allocations[2].amount, "10000.00"); assert.equal(allocationSummary(s).remaining, 1100000);
 s.emergency = "0"; s.allocations = proposeSalaryBudget(s); assert.equal(s.allocations[2].amount, "21000.00"); assert.equal(allocationSummary(s).remaining, 0);
 s.buildEmergency = false; s.allocations = proposeSalaryBudget(s); assert.equal(s.allocations[2].amount, "0.00");
});
test("insufficient salary stays visible instead of inventing affordable budget", () => {
 const s = baseline(); s.salary = "10000"; s.allocations = proposeSalaryBudget(s);
 assert.equal(allocationSummary(s).remaining, -2900000); assert.ok(allocationSummary(s).issues.some((i) => i.includes("超出")));
 s.allocations[0].amount = "0"; assert.ok(allocationSummary(s).issues.some((i) => i.includes("現金用途仍不足")));
});
test("removing entertainment releases new salary after needs are recalculated", () => {
 const s = baseline(); s.expenses.push({ id: "fun", name: "娛樂", amount: "6000", enabled: true, destination: "cash" });
 s.allocations = proposeSalaryBudget(s); assert.equal(s.allocations[0].amount, "18000.00");
 s.expenses[2].enabled = false; s.allocations = proposeSalaryBudget(s); assert.equal(s.allocations[0].amount, "12000.00"); assert.equal(allocationSummary(s).remaining, 2100000);
});
test("blank is unknown, explicit zero is valid, estimates use integer cents", () => {
 const s = baseline(); s.cash = ""; assert.equal(proposeSalaryBudget(s), null); assert.ok(analyzeSalaryBudget(s).issues.length);
 s.cash = "0"; assert.ok(proposeSalaryBudget(s));
 s.foodMode = "formula"; s.meals = "3"; s.mealCost = "100.29"; s.days = "30"; assert.equal(foodEstimate(s), 902610);
 s.meals = "1e2"; assert.equal(foodEstimate(s), null);
 s.emergencyDebt = ""; assert.equal(emergencyTarget(s), null); s.buildEmergency = false; s.foodMode = "direct"; assert.ok(proposeSalaryBudget(s));
});
test("local data roundtrip validates shape and required allocation rows", () => {
 const s = baseline(); assert.deepEqual(decodeSalaryBudget(encodeSalaryBudget(s)), s);
 const raw = JSON.parse(encodeSalaryBudget(s)); raw.budget.allocations = []; assert.throws(() => decodeSalaryBudget(JSON.stringify(raw)));
 assert.throws(() => decodeSalaryBudget('{"version":1,"budget":{}}')); assert.throws(() => decodeSalaryBudget("not-json"));
});
