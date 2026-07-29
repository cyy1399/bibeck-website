import type { ExchangeSlug } from "@/config/exchanges";
import { BYBIT_REGISTER, REBATE_LOGIN } from "@/config/links";

export const actionLabels = {
  rebateSignup: "取得返傭帳號",
  rebateDashboard: "登入返傭後台",
  costCalculator: "交易成本計算器",
} as const;

export type ExchangeActionConfig = {
  id: ExchangeSlug;
  name: string;
  rebateSupported: boolean;
  registrationUrl: string | null;
  rebateDashboardUrl: string | null;
};

export const exchangeActionConfig: Record<ExchangeSlug, ExchangeActionConfig> = {
  bybit: { id: "bybit", name: "Bybit", rebateSupported: true, registrationUrl: BYBIT_REGISTER, rebateDashboardUrl: REBATE_LOGIN },
  binance: { id: "binance", name: "Binance", rebateSupported: false, registrationUrl: null, rebateDashboardUrl: null },
  bitget: { id: "bitget", name: "Bitget", rebateSupported: false, registrationUrl: null, rebateDashboardUrl: null },
  bingx: { id: "bingx", name: "BingX", rebateSupported: false, registrationUrl: null, rebateDashboardUrl: null },
  okx: { id: "okx", name: "OKX", rebateSupported: false, registrationUrl: null, rebateDashboardUrl: null },
};
