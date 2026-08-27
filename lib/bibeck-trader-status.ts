import { BIBECK_STANDARD_REBATE_RATE, formatBibeckRebateRate } from "./bibeck-rebate.ts";

export type TraderStatusId = "member" | "pro" | "black" | "partner";

export interface TraderStatus {
  id: TraderStatusId;
  name: string;
  minVolume: number | null;
  maxVolume: number | null;
  rebateRate: number | null;
  description: string;
  benefits: readonly string[];
  isPartner: boolean;
  requiresConfirmation: boolean;
  order: number;
}

export const BIBECK_TRADER_STATUSES = [
  { id: "member", name: "Member", minVolume: 0, maxVolume: 50_000_000, rebateRate: BIBECK_STANDARD_REBATE_RATE, description: "一般 BiBeck 返傭帳戶。", benefits: [`BiBeck ${formatBibeckRebateRate()} 標準返傭`], isPartner: false, requiresConfirmation: false, order: 1 },
  { id: "pro", name: "Pro", minVolume: 50_000_000, maxVolume: 200_000_000, rebateRate: BIBECK_STANDARD_REBATE_RATE, description: "高交易量交易者。", benefits: ["高交易量活動資格評估", "額外獎勵資格評估", "較高優先級客服"], isPartner: false, requiresConfirmation: true, order: 2 },
  { id: "black", name: "Black", minVolume: 200_000_000, maxVolume: null, rebateRate: BIBECK_STANDARD_REBATE_RATE, description: "BiBeck 核心高價值交易者。", benefits: ["高交易量活動優先評估", "額外交易量獎勵優先評估", "專屬合作方案評估", "優先客服"], isPartner: false, requiresConfirmation: true, order: 3 },
  { id: "partner", name: "Partner", minVolume: null, maxVolume: null, rebateRate: null, description: "適合社群、代理、團隊、KOL、Bot、量化與交易工具合作夥伴。", benefits: ["個別合作方案評估"], isPartner: true, requiresConfirmation: true, order: 4 },
] as const satisfies readonly TraderStatus[];

export const VOLUME_BASED_TRADER_STATUSES = BIBECK_TRADER_STATUSES.filter((status) => !status.isPartner);

function safeVolume(volume: number): number {
  return Number.isFinite(volume) && volume > 0 ? volume : 0;
}

export function getEstimatedTraderStatus(volume: number): (typeof VOLUME_BASED_TRADER_STATUSES)[number] {
  const value = safeVolume(volume);
  return [...VOLUME_BASED_TRADER_STATUSES].reverse().find((status) => value >= (status.minVolume ?? 0)) ?? VOLUME_BASED_TRADER_STATUSES[0];
}

export function getNextTraderStatus(volume: number): (typeof VOLUME_BASED_TRADER_STATUSES)[number] | null {
  const current = getEstimatedTraderStatus(volume);
  const index = VOLUME_BASED_TRADER_STATUSES.findIndex((status) => status.id === current.id);
  return VOLUME_BASED_TRADER_STATUSES[index + 1] ?? null;
}

export function getTraderStatusProgress(volume: number): { percentage: number; remaining: number; isHighest: boolean } {
  const value = safeVolume(volume);
  const current = getEstimatedTraderStatus(value);
  const next = getNextTraderStatus(value);
  if (!next || next.minVolume === null) return { percentage: 100, remaining: 0, isHighest: true };
  const currentMin = current.minVolume ?? 0;
  const span = next.minVolume - currentMin;
  return {
    percentage: Math.min(100, Math.max(0, ((value - currentMin) / span) * 100)),
    remaining: Math.max(0, next.minVolume - value),
    isHighest: false,
  };
}

