import type { Metadata } from "next";
import { ExchangePlatformPage } from "@/components/ExchangePlatformPage";
import { getExchange } from "@/config/exchanges";

export const metadata: Metadata = {
  title: "Bybit 手續費、VIP 與返傭計算器｜BiBeck",
  description: "輸入最近 30 日交易量，自動推估 Bybit VIP 等級與 BiBeck 返傭方案，比較無 VIP、VIP 優惠與返傭後的實際交易成本。",
  alternates: { canonical: "/platform/bybit" },
};

export default function BybitPlatformPage() {
  return <ExchangePlatformPage exchange={getExchange("bybit")} />;
}
