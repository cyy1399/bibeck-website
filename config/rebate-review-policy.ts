export const rebateReviewPolicy = {
  reviewSchedule: "每月第一個星期二",
  upgrade: "符合較高級距並完成資料核對後調整",
  firstShortfall: "第一次低於目前級距時保留原級距並進入觀察期",
  secondShortfall: "連續兩次月度審查未達時調整至當期對應級距",
  recovery: "恢復達標後取消觀察狀態",
  special: "特殊合作方案依個別合作條件處理",
  effectiveTiming: "資料核對與返傭設定完成後生效，不回溯適用",
} as const;
