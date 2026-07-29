export interface BybitVipTier {
  id: string;
  label: string;
  minThirtyDayVolume: number;
  volumeRequirementLabel: string;
  assetRequirementLabel?: string;
  fees: {
    spot: { maker: number | null; taker: number | null };
    usdtPerpetual: { maker: number | null; taker: number | null };
    usdcContract: { maker: number | null; taker: number | null };
  };
}

export const BYBIT_VIP_TIERS: BybitVipTier[] = [
  { id: "vip-0", label: "VIP 0", minThirtyDayVolume: 0, volumeRequirementLabel: "未達 VIP 1 門檻", assetRequirementLabel: "無最低資產門檻", fees: { spot: { maker: 0.001, taker: 0.001 }, usdtPerpetual: { maker: 0.0002, taker: 0.00055 }, usdcContract: { maker: 0.0002, taker: 0.00055 } } },
  { id: "vip-1", label: "VIP 1", minThirtyDayVolume: 10_000_000, volumeRequirementLabel: "衍生品交易量 ≥ 10,000,000 USDT", assetRequirementLabel: "或符合資產條件", fees: { spot: { maker: 0.000675, taker: 0.0008 }, usdtPerpetual: { maker: 0.00018, taker: 0.0004 }, usdcContract: { maker: 0.00018, taker: 0.0004 } } },
  { id: "vip-2", label: "VIP 2", minThirtyDayVolume: 25_000_000, volumeRequirementLabel: "衍生品交易量 ≥ 25,000,000 USDT", assetRequirementLabel: "或符合資產條件", fees: { spot: { maker: 0.00065, taker: 0.000775 }, usdtPerpetual: { maker: 0.00016, taker: 0.000375 }, usdcContract: { maker: 0.00016, taker: 0.000375 } } },
  { id: "vip-3", label: "VIP 3", minThirtyDayVolume: 50_000_000, volumeRequirementLabel: "衍生品交易量 ≥ 50,000,000 USDT", assetRequirementLabel: "或符合資產條件", fees: { spot: { maker: 0.000625, taker: 0.00075 }, usdtPerpetual: { maker: 0.00014, taker: 0.00035 }, usdcContract: { maker: 0.00014, taker: 0.00035 } } },
  { id: "vip-4", label: "VIP 4", minThirtyDayVolume: 100_000_000, volumeRequirementLabel: "衍生品交易量 ≥ 100,000,000 USDT", assetRequirementLabel: "或符合資產條件", fees: { spot: { maker: 0.0005, taker: 0.0006 }, usdtPerpetual: { maker: 0.00012, taker: 0.00032 }, usdcContract: { maker: 0.00012, taker: 0.00032 } } },
  { id: "vip-5", label: "VIP 5", minThirtyDayVolume: 250_000_000, volumeRequirementLabel: "衍生品交易量 ≥ 250,000,000 USDT", assetRequirementLabel: "或符合資產條件", fees: { spot: { maker: 0.0004, taker: 0.0005 }, usdtPerpetual: { maker: 0.0001, taker: 0.00032 }, usdcContract: { maker: 0.0001, taker: 0.00032 } } },
  { id: "supreme", label: "Supreme VIP", minThirtyDayVolume: 500_000_000, volumeRequirementLabel: "衍生品交易量 ≥ 500,000,000 USDT", assetRequirementLabel: "仍須以帳戶資格為準", fees: { spot: { maker: 0.0003, taker: 0.00045 }, usdtPerpetual: { maker: 0, taker: 0.0003 }, usdcContract: { maker: 0, taker: 0.0003 } } },
];
