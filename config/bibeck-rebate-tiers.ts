export interface BiBeckRebateTier {
  id: string;
  name: string;
  rebateRate: number;
  minThirtyDayVolume: number;
  maxThirtyDayVolume: number | null;
  description: string;
  isNegotiated: boolean;
  isProvisional: boolean;
}

export const BIBECK_REBATE_TIERS: BiBeckRebateTier[] = [
  { id: "standard", name: "標準交易者", rebateRate: 0.2, minThirtyDayVolume: 0, maxThirtyDayVolume: 999_999, description: "適合一般交易使用者", isNegotiated: false, isProvisional: true },
  { id: "active", name: "活躍交易者", rebateRate: 0.25, minThirtyDayVolume: 1_000_000, maxThirtyDayVolume: 4_999_999, description: "適合穩定且持續交易的使用者", isNegotiated: false, isProvisional: true },
  { id: "professional", name: "專業交易者", rebateRate: 0.3, minThirtyDayVolume: 5_000_000, maxThirtyDayVolume: 24_999_999, description: "適合高頻或高交易量使用者", isNegotiated: false, isProvisional: true },
  { id: "elite", name: "菁英交易者", rebateRate: 0.35, minThirtyDayVolume: 25_000_000, maxThirtyDayVolume: 99_999_999, description: "適合大型或高額交易使用者", isNegotiated: false, isProvisional: true },
  { id: "partner", name: "專業合作方案", rebateRate: 0.4, minThirtyDayVolume: 100_000_000, maxThirtyDayVolume: null, description: "高額交易量個體戶、專業交易者、代理或合作夥伴可專業協商", isNegotiated: true, isProvisional: true },
];

export const rebateReviewPolicy = {
  defaultTierId: "standard",
  defaultRate: 20,
  reviewDayOfMonth: 1,
  reviewBasis: "previous_full_calendar_month",
  partialMonthEligible: false,
  outcomes: ["upgrade", "downgrade", "maintain"],
  specialPartnerManualReview: true,
  highVolumeObservationDays: 30,
} as const;

export const rebateReviewLabels = {
  initialTier: "一般申請初始級距",
  monthlyReview: "每月依實際交易量審核",
  estimatedTier: "依交易量推估級距",
  effectiveTier: "實際生效級距",
  manualReview: "人工評估",
} as const;

export function getRebateTierStatus(tier: BiBeckRebateTier): string {
  if (tier.id === rebateReviewPolicy.defaultTierId) return rebateReviewLabels.initialTier;
  if (tier.isNegotiated) return rebateReviewLabels.manualReview;
  return rebateReviewLabels.monthlyReview;
}

const volumeFormatter = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 });

export function formatRebateVolumeRange(tier: BiBeckRebateTier): string {
  if (tier.maxThirtyDayVolume === null) return `${volumeFormatter.format(tier.minThirtyDayVolume)} USDT 以上`;
  if (tier.minThirtyDayVolume === 0) return `低於 ${volumeFormatter.format(tier.maxThirtyDayVolume + 1)} USDT`;
  return `${volumeFormatter.format(tier.minThirtyDayVolume)}–${volumeFormatter.format(tier.maxThirtyDayVolume)} USDT`;
}
