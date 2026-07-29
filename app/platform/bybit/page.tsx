import type { Metadata } from "next";
import { ExchangePlatformPage } from "@/components/ExchangePlatformPage";
import { getExchange } from "@/config/exchanges";

export const metadata: Metadata = {
  title: "Bybit 手續費、VIP 與返傭計算",
  description: "查看 Bybit 現貨與合約手續費、VIP 等級及 BiBeck 返傭後的預估實際交易成本。",
  alternates: { canonical: "/platform/bybit" },
};

export default function BybitPlatformPage() {
  return <ExchangePlatformPage exchange={getExchange("bybit")} />;
}