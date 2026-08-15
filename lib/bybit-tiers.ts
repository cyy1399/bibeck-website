import { BYBIT_VIP_TIERS, type BybitVipTier } from "../config/bybit-vip-tiers.ts";

function safeVolume(volume: number): number {
  return Number.isFinite(volume) && volume > 0 ? volume : 0;
}

export function estimateBybitVipTier(volume: number): BybitVipTier {
  const value = safeVolume(volume);
  return [...BYBIT_VIP_TIERS].reverse().find((tier) => value >= tier.minThirtyDayVolume) ?? BYBIT_VIP_TIERS[0];
}

export function resolveBybitVipTier(mode: "auto" | "manual", volume: number, manualTierId: string): BybitVipTier {
  if (mode === "manual") return BYBIT_VIP_TIERS.find((tier) => tier.id === manualTierId) ?? BYBIT_VIP_TIERS[0];
  return estimateBybitVipTier(volume);
}

export function negotiatedRebateRate(percent: number, enabled: boolean): number {
  if (!enabled) return 0;
  const safePercent = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return safePercent / 100;
}
