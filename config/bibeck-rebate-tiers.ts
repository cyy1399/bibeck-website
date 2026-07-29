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
  { id: "standard", name: "標準會員", rebateRate: 0.2, minThirtyDayVolume: 0, maxThirtyDayVolume: 999_999, description: "適合一般交易用戶", isNegotiated: false, isProvisional: true },
  { id: "active", name: "活躍交易者", rebateRate: 0.25, minThirtyDayVolume: 1_000_000, maxThirtyDayVolume: 4_999_999, description: "適合穩定交易用戶", isNegotiated: false, isProvisional: true },
  { id: "professional", name: "專業交易者", rebateRate: 0.3, minThirtyDayVolume: 5_000_000, maxThirtyDayVolume: 24_999_999, description: "適合高頻或高交易量用戶", isNegotiated: false, isProvisional: true },
  { id: "elite", name: "菁英交易者", rebateRate: 0.35, minThirtyDayVolume: 25_000_000, maxThirtyDayVolume: 99_999_999, description: "適合高額交易量用戶", isNegotiated: false, isProvisional: true },
  { id: "partner", name: "專業合作方案", rebateRate: 0.4, minThirtyDayVolume: 100_000_000, maxThirtyDayVolume: null, description: "高額交易量個體戶、專業交易者、代理或合作夥伴可專業協商", isNegotiated: true, isProvisional: true },
];
