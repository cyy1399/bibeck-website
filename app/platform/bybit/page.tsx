import type { Metadata } from "next";
import { ExchangePlatformPage } from "@/components/ExchangePlatformPage";
import { getExchange } from "@/config/exchanges";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "Bybit 手續費、VIP 與返傭", description: "了解 Bybit Maker／Taker 手續費、VIP 費率與 BiBeck 返傭，並使用交易成本計算器比較實際成本。", path: "/platform/bybit" });

export default function BybitPlatformPage() {
  return <ExchangePlatformPage exchange={getExchange("bybit")} />;
}
