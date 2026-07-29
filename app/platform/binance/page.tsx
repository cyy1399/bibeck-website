import type { Metadata } from "next";
import { ExchangePlatformPage } from "@/components/ExchangePlatformPage";
import { getExchange } from "@/config/exchanges";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "Binance 手續費與 VIP 等級比較", description: "整理 Binance 現貨、合約、BNB 折扣與 VIP 手續費，並比較返傭後的實際交易成本。", path: "/platform/binance" });

export default function BinancePlatformPage() {
  return <ExchangePlatformPage exchange={getExchange("binance")} />;
}
