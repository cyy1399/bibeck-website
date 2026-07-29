import type { Metadata } from "next";
import { ExchangePlatformPage } from "@/components/ExchangePlatformPage";
import { getExchange } from "@/config/exchanges";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "Bybit 手續費、VIP 與返傭計算器", description: "輸入最近 30 日交易量，推估 Bybit VIP 等級與 BiBeck 返傭方案，比較返傭後的實際交易成本。", path: "/platform/bybit" });

export default function BybitPlatformPage() {
  return <ExchangePlatformPage exchange={getExchange("bybit")} />;
}
