export type BiBeckRebateTierId = "standard" | "active" | "elite" | "core" | "special";

export interface BiBeckRebateTier {
  id: BiBeckRebateTierId;
  name: string;
  minVolume: number | null;
  maxVolume: number | null;
  rebateRate: number | null;
  shortLabel: string;
  volumeLabel: string;
  description: string;
  requiresReview: boolean;
  isSpecial: boolean;
  order: number;
}

export const BIBECK_REBATE_TIERS = [
  { id: "standard", name: "標準交易者", minVolume: 0, maxVolume: 10_000_000, rebateRate: 0.2, shortLabel: "20%", volumeLabel: "未滿 10M USDT", description: "最近 30 日有效交易量未滿 10M USDT", requiresReview: true, isSpecial: false, order: 1 },
  { id: "active", name: "活躍交易者", minVolume: 10_000_000, maxVolume: 50_000_000, rebateRate: 0.25, shortLabel: "25%", volumeLabel: "10M～49.99M USDT", description: "最近 30 日有效交易量 10M～49.99M USDT", requiresReview: true, isSpecial: false, order: 2 },
  { id: "elite", name: "菁英交易者", minVolume: 50_000_000, maxVolume: 200_000_000, rebateRate: 0.3, shortLabel: "30%", volumeLabel: "50M～199.99M USDT", description: "最近 30 日有效交易量 50M～199.99M USDT", requiresReview: true, isSpecial: false, order: 3 },
  { id: "core", name: "核心交易者", minVolume: 200_000_000, maxVolume: null, rebateRate: 0.35, shortLabel: "35%", volumeLabel: "200M USDT 以上", description: "最近 30 日有效交易量達 200M USDT", requiresReview: true, isSpecial: false, order: 4 },
  { id: "special", name: "特殊合作方案", minVolume: null, maxVolume: null, rebateRate: null, shortLabel: "個別協商", volumeLabel: "不依交易量自動取得", description: "適用代理、社群、團隊或其他合作需求", requiresReview: true, isSpecial: true, order: 5 },
] as const satisfies readonly BiBeckRebateTier[];

export const PUBLIC_REBATE_TIERS = BIBECK_REBATE_TIERS.filter((tier) => !tier.isSpecial);
export const SPECIAL_REBATE_TIER = BIBECK_REBATE_TIERS.find((tier) => tier.isSpecial)!;

export function getBiBeckRebateTier(volume: number): (typeof PUBLIC_REBATE_TIERS)[number] {
  const safeVolume = Number.isFinite(volume) && volume > 0 ? volume : 0;
  return [...PUBLIC_REBATE_TIERS].reverse().find((tier) => safeVolume >= (tier.minVolume ?? 0)) ?? PUBLIC_REBATE_TIERS[0];
}

export function getNextBiBeckRebateTier(tierId: BiBeckRebateTierId) {
  const index = PUBLIC_REBATE_TIERS.findIndex((tier) => tier.id === tierId);
  return index >= 0 ? PUBLIC_REBATE_TIERS[index + 1] ?? null : null;
}

export function formatVolume(value: number): string {
  const safe = Number.isFinite(value) && value >= 0 ? value : 0;
  if (safe >= 1_000_000) {
    const millions = safe / 1_000_000;
    return `${millions.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}M`;
  }
  return new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 2 }).format(safe);
}

export function formatRebateVolumeRange(tier: BiBeckRebateTier): string {
  return tier.volumeLabel;
}
