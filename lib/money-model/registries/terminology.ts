import type { TerminologyRecord } from "../contracts/index.ts";
export const terminology: TerminologyRecord[] = [
  ["financial_state","Financial State","財務狀態","目前最高優先問題所在的領域。"],
  ["financial_runway","Financial Runway","財務續航","現有安全流動性可支撐核心支出的期間。"],
  ["primary_bottleneck","Primary Bottleneck","目前最重要的財務瓶頸","當下最需要處理、且會限制後續選擇的問題。"],
  ["main_quest","Main Quest","主要任務","目前最值得優先完成的一項財務行動。"],
  ["side_mission","Side Mission","次要任務","可協助主要任務或補足資訊的輔助行動。"],
  ["need_more_information","Need More Information","需要更多資訊","目前資料不足，無法做出高信心判斷。"],
  ["allocation_conflict","Allocation Conflict","資金配置衝突","可用資源不足以同時滿足多項主張。"],
  ["funding_conflict","Funding Conflict","資金需求衝突","多項目標競爭同一筆可持續資金。"],
  ["available_safety_liquidity","Available Safety Liquidity","可用安全流動性","扣除已保留資金後，可用於承受風險的流動資源。"],
  ["minimum_viable_liquidity","Minimum Viable Liquidity","最低可行流動性","債務加速前暫時保留的最低流動性工作里程碑。"],
].map(([key,internalName,zhTW,descriptionZhTW]) => ({ key, internalName, zhTW, descriptionZhTW, status:"DRAFT", notes:"需經台灣使用者研究與法遵審閱後才能標記 APPROVED。" })) as TerminologyRecord[];
