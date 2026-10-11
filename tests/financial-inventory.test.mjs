import test from "node:test";
import assert from "node:assert/strict";
import { createInventory, parseMoney, summarizeInventory, encodeInventory, decodeInventory } from "../lib/financial-inventory.ts";
const empty = () => createInventory().map((g) => ({ ...g, status: "no" }));
const entry = (name, amount, available = true, reserved = "") => ({ id: name, name, amount, available, reserved, verification: "confirmed" });
test("includes all loan balances without allocation affecting inventory", () => {
  const g = empty();
  g[0] = { ...g[0], status: "yes", entries: [entry("錢包", "1,000"), entry("家中", "9,000")] };
  g[1] = { ...g[1], status: "yes", entries: [entry("銀行", "30,000", true, "10,000")] };
  g[3] = { ...g[3], status: "yes", entries: [entry("投資", "10000", false)] };
  g[6] = { ...g[6], status: "yes", entries: [entry("信用卡", "5000", false)] };
  g[7] = { ...g[7], status: "yes", entries: [entry("貸款一", "20000", false), entry("貸款二", "35000", false)] };
  const t = summarizeInventory(g);
  assert.equal(t.assets, 5000000); assert.equal(t.liabilities, 6000000); assert.equal(t.net, -1000000);
  assert.equal(t.available, 4000000); assert.equal(t.assetsKnown, true); assert.equal(t.liabilitiesKnown, true); assert.equal(t.issues.length, 0);
});
test("unknown, blank, invalid and estimated amounts never pass as complete", () => {
  assert.equal(summarizeInventory(createInventory()).issues.length, 9);
  for (const text of ["", "-1", "NaN", "1e6", "12.345", "99999999999"]) assert.equal(parseMoney(text), null);
  assert.equal(parseMoney("0"), 0); assert.equal(parseMoney("0.29"), 29);
  const g = empty(); g[0] = { ...g[0], status: "yes", entries: [entry("現金", ""), { ...entry("家中", "100"), verification: "estimated" }] };
  assert.equal(summarizeInventory(g).issues.length, 2);
});
test("locked assets remain separate and legacy reservations do not block inventory", () => {
  const g = empty(); g[0] = { ...g[0], status: "yes", entries: [entry("現金", "100", true, "101"), entry("鎖定存款", "900", false, "900")] };
  const t = summarizeInventory(g); assert.equal(t.assets, 100000); assert.equal(t.available, 10000); assert.equal(t.issues.length, 0);
});
test("backup validates shape and restores trusted debt classification", () => {
  const g = empty(); assert.deepEqual(decodeInventory(encodeInventory(g)), g);
  const tampered = JSON.parse(encodeInventory(g)); tampered.groups[7].debt = false;
  assert.equal(decodeInventory(JSON.stringify(tampered))[7].debt, true);
  tampered.groups[0].entries[0].available = "yes"; assert.throws(() => decodeInventory(JSON.stringify(tampered)));
  assert.throws(() => decodeInventory('{"version":99}')); assert.throws(() => decodeInventory("not-json"));
});

test("unfilled balances differ from confirmed absence and explicit zero", () => {
  const unknown = summarizeInventory(createInventory());
  assert.equal(unknown.assetsKnown, false); assert.equal(unknown.liabilitiesKnown, false);
  const absent = summarizeInventory(empty());
  assert.equal(absent.assetsKnown, true); assert.equal(absent.liabilitiesKnown, true); assert.equal(absent.net, 0);
  const g = createInventory(); g[0] = { ...g[0], status: "yes", entries: [entry("現金", "")] };
  assert.equal(summarizeInventory(g).assetsKnown, false);
  g[0].entries[0].amount = "0";
  assert.equal(summarizeInventory(g).assetsKnown, true); assert.equal(summarizeInventory(g).liabilitiesKnown, false);
  assert.equal(decodeInventory(encodeInventory(g))[0].entries[0].amount, "0");
});
