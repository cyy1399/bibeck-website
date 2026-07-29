export const highVolumeApplicationExchanges = [
  { id: "bybit", name: "Bybit", applicationEnabled: true },
  { id: "binance", name: "Binance", applicationEnabled: false },
  { id: "bitget", name: "Bitget", applicationEnabled: false },
  { id: "bingx", name: "BingX", applicationEnabled: false },
  { id: "okx", name: "OKX", applicationEnabled: false },
] as const;

export const bybitVipOptions = [
  { value: "vip0", label: "非 VIP／VIP 0" },
  { value: "vip1", label: "VIP 1" },
  { value: "vip2", label: "VIP 2" },
  { value: "vip3", label: "VIP 3" },
  { value: "vip4", label: "VIP 4" },
  { value: "vip5", label: "VIP 5" },
  { value: "supreme", label: "Supreme VIP" },
  { value: "unknown", label: "其他／不確定" },
] as const;

export const requestedRebateOptions = [
  { value: "25", rate: 25, label: "25%｜活躍交易者", referenceVolume: "1,000,000–4,999,999 USDT" },
  { value: "30", rate: 30, label: "30%｜專業交易者", referenceVolume: "5,000,000–24,999,999 USDT" },
  { value: "35", rate: 35, label: "35%｜菁英交易者", referenceVolume: "25,000,000–99,999,999 USDT" },
  { value: "40-plus", rate: 40, label: "40% 或以上｜專業合作方案", referenceVolume: "100,000,000 USDT 以上", requiresManualReview: true },
  { value: "assessment", rate: null, label: "希望由 BiBeck 評估", referenceVolume: null },
] as const;

export const applicationUploadPolicy = {
  maxFiles: 5,
  maxFileSizeBytes: 8 * 1024 * 1024,
  maxTotalSizeBytes: 20 * 1024 * 1024,
  acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
} as const;

export const applicantTypes = ["個人交易者", "專業交易者", "量化／API 交易者", "團隊或代理", "KOL／社群經營者"] as const;
export const productOptions = ["現貨", "USDT 永續", "反向合約", "選擇權", "多種商品"] as const;
