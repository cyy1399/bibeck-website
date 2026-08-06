export const BYBIT_REGISTER = "https://partner.bybit.com/b/t00000016";
export const REBATE_LOGIN = "https://bybackoffice.com/user-login";
export const REBATE_APPLICATION_URL = process.env.NEXT_PUBLIC_BIBECK_REBATE_APPLICATION_URL ?? "https://docs.google.com/forms/d/e/1FAIpQLScPAwgBuIVlaJ_0dM5JXF1_QhEgCwygM9PBZRFItiQF6AQ74Q/viewform?usp=dialog";
export const REBATE_BACKOFFICE_URL = process.env.NEXT_PUBLIC_REBATE_BACKOFFICE_URL ?? REBATE_LOGIN;
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? brandConfig.publicEmails.support;
export const BYBIT_KYC_TRANSFER = "https://www.bybit.com/zh-TW/help-center/article/How-to-Transfer-Your-Identity-to-Another-Account";
export const BYBIT_ACCOUNT_SUPPORT = "https://www.bybit.com/zh-TW/help-center/";
export const BYBIT_FEE_STRUCTURE = "https://www.bybit.com/zh-TW/help-center/article/Trading-Fee-Structure";
export const BYBIT_MAKER_TAKER = "https://www.bybit.com/zh-TW/help-center/article/Comparison-Of-Trading-Fees-Between-Maker-Orders-and-Taker-Orders";
export const BYBIT_FUNDING_FEE = "https://www.bybit.com/zh-TW/help-center/article/Funding-fee-calculation";

export const BINANCE_FEE_STRUCTURE = "https://www.binance.com/en/fee/trading";
export const BINANCE_FEE_GUIDE = "https://www.binance.com/en/academy/articles/how-to-calculate-transaction-fees-on-binance";

export const BINGX_FEE_CENTER = "https://bingx.com/en/support/costs";
export const BINGX_SPOT_FEE_RULES = "https://bingx.com/en/support/articles/4407745883801-Trading-Limits-and-Rules-of-BingX-Spot/";

export const BITGET_FEE_GUIDE = "https://www.bitget.com/support/articles/12560603825829";
export const BITGET_FEE_CENTER = "https://www.bitget.com/fee/spot-trading";

export const OKX_FEE_RULES = "https://www.okx.com/en-gb/help/trading-fee-rules-faq";
export const OKX_FUTURES_FEE_GUIDE = "https://www.okx.com/en-us/help/how-to-calculate-the-contract-transaction-fee";

const externalServices: Record<string, string> = {
  "partner.bybit.com": "Bybit 註冊頁",
  "bybackoffice.com": "Bybit 合作夥伴返傭後台",
  "www.bybit.com": "Bybit 官方網站",
  "www.binance.com": "Binance 官方網站",
  "bingx.com": "BingX 官方網站",
  "www.bitget.com": "Bitget 官方網站",
  "www.okx.com": "OKX 官方網站",
};

export function externalDestinationFor(href: string): { serviceName: string; domain: string } {
  const domain = new URL(href).hostname.toLowerCase();
  return { serviceName: externalServices[domain] ?? "外部服務", domain };
}
import { brandConfig } from "@/config/brand";
