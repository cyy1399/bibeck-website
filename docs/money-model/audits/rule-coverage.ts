export interface RuleCoverageRecord { ruleId:string; failureModes:string[] }
export const ruleCoverage: RuleCoverageRecord[] = [
  {ruleId:"R-001",failureModes:["未知欄位被猜測","unknown 未沿模型傳播","未知目標被轉成投資報酬要求"]},
  {ruleId:"R-002",failureModes:["逾期被成長 claim 排擠","忽略基本生活所需資源"]},
  {ruleId:"R-003",failureModes:["高收入掩蓋負現金流","同一支出重複扣除","期間不一致"]},
  {ruleId:"R-004",failureModes:["高淨值掩蓋近期缺口","保留資金誤算為可用"]},
  {ruleId:"R-005",failureModes:["工作假設洩漏成財務事實","建流動性時忽略最低還款"]},
  {ruleId:"R-006",failureModes:["通用高成本門檻","忽略促銷到期與提前清償成本"]},
  {ruleId:"R-007",failureModes:["保留資本同時算安全資本","期間保留範圍不明"]},
  {ruleId:"R-008",failureModes:["不同 ID 指向同一資產","收入與 future resource 重複","目標 funding 與資產重複"]},
  {ruleId:"R-009",failureModes:["目標資金同時計入長期資本","未顯示選擇投資造成的目標缺口"]},
  {ruleId:"R-010",failureModes:["系統替使用者決定人生目標","不可行目標靠提高投資風險解決"]},
  {ruleId:"R-011",failureModes:["可支配消費被道德化","沒有資源衝突仍製造任務"]},
  {ruleId:"R-012",failureModes:["負淨值單獨觸發危急","忽略同時存在的逾期或現金流問題"]},
  {ruleId:"R-013",failureModes:["零收入自動 SURVIVAL","未分辨投資提款、家人支持與現金覆蓋"]},
  {ruleId:"R-014",failureModes:["健康狀態製造假任務","尚有未解決 claim 卻錯誤輸出無任務"]},
  {ruleId:"R-015",failureModes:["矛盾資料仍產生高信心配置","material contradiction 沒有定義"]},
];
