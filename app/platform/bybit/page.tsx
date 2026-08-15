import type { Metadata } from "next";
import { ExchangePlatformPage } from "@/components/ExchangePlatformPage";
import { getExchange } from "@/config/exchanges";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "Bybit 交易成本、VIP 與 40% 返傭", description: "查看 Bybit Maker／Taker 手續費、VIP 門檻、官方資料來源與 BiBeck 40% 標準返傭說明。", path: "/platform/bybit" });

export default function BybitPlatformPage() {
  return <ExchangePlatformPage exchange={getExchange("bybit")} />;
}
