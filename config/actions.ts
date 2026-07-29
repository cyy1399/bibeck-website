import type { ExchangeSlug } from "@/config/exchanges";
import { BYBIT_REGISTER, REBATE_LOGIN } from "@/config/links";

export type ExchangeActionConfig = {
  id: ExchangeSlug;
  name: string;
  rebateSupported: boolean;
  registrationUrl: string | null;
  rebateDashboardUrl: string | null;
};

export function getExchangeActionLabels(exchange: Pick<ExchangeActionConfig, "name">) {
  return {
    rebateSignup: `取得 ${exchange.name} 返傭帳號`,
    rebateDashboard: `登入 ${exchange.name} 返傭後台`,
    costCalculator: `${exchange.name} 交易成本計算器`,
  } as const;
}

export const exchangeActionConfig: Record<ExchangeSlug, ExchangeActionConfig> = {
  bybit: { id: "bybit", name: "Bybit", rebateSupported: true, registrationUrl: BYBIT_REGISTER, rebateDashboardUrl: REBATE_LOGIN },
  binance: { id: "binance", name: "Binance", rebateSupported: false, registrationUrl: null, rebateDashboardUrl: null },
  bitget: { id: "bitget", name: "Bitget", rebateSupported: false, registrationUrl: null, rebateDashboardUrl: null },
  bingx: { id: "bingx", name: "BingX", rebateSupported: false, registrationUrl: null, rebateDashboardUrl: null },
  okx: { id: "okx", name: "OKX", rebateSupported: false, registrationUrl: null, rebateDashboardUrl: null },
};

export const bybitActionLabels = getExchangeActionLabels(exchangeActionConfig.bybit);
