import type { AppResult, PreparedAnalysis } from "../../lib/money-os/contracts/commands.ts";
import { command, prepare } from "../../tests/money-os/service-fixtures.mjs";

/** Fixture intent is review metadata, not a financial conclusion or alternate DTO. */
export const scenarios = [
  { id: "A", label: "A · 核心收支缺口", note: "合成情境：每月實拿 30,000 元，核心必要支出 35,000 元。" },
  { id: "B", label: "B · 流動性與債務", note: "合成情境：資金較少並有債務。高成本分類政策尚未核准，不會製造還款建議。" },
  { id: "C", label: "C · 年利率尚未確認", note: "合成情境：債務年利率未知；資訊探索不等於已完成成本分類。" },
  { id: "D", label: "D · 無優先任務", note: "合成情境：受支持範圍內無優先主張；不宣稱所有財務風險已排除。" },
  { id: "E", label: "E · 高收入、每月剩餘為零", note: "合成情境：每月實拿 200,000 元，扣除列出的支出後剩餘為零；不另造資本形成任務。" },
  { id: "F", label: "F · 近期目標、能力受限", note: "合成情境：目標日期為 2026-10-22。目標主張與衝突映射未核准，保留未知，不生成投資比例。" },
  { id: "FAILURE", label: "失敗 · 支出資料未完整", note: "合成負例：沿用既有支出資料不完整的分析失敗；不以成功卡片取代錯誤。" },
] as const;
export type Scenario = typeof scenarios[number];
export function findScenario(id: string): Scenario | undefined { return scenarios.find(s => s.id === id); }

/** Local TEST harness only. Real S04 service, test-only ports, fresh synthetic source. */
export async function analyzeScenario(id: Scenario["id"]): Promise<AppResult<PreparedAnalysis>> {
  const cmd = command(id === "FAILURE" ? "A" : id);
  if (id === "F") {
    const goal = cmd.source.envelope.collections.goals?.[0];
    if (!goal) throw new Error("Synthetic goal fixture missing");
    goal.values.targetDate.value = {
      status: "KNOWN", data: { value: "2026-10-22", source: "USER_REPORTED", updatedAt: "2026-10-02" },
    };
  }
  if (id === "FAILURE") {
    const expenses = cmd.source.inventories.expenses;
    if (!expenses) throw new Error("Synthetic expenses fixture missing");
    expenses.state = "PARTIAL";
  }
  return prepare(cmd);
}
