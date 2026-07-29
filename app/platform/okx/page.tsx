import type { Metadata } from "next";
import { ExchangePlatformPage } from "@/components/ExchangePlatformPage";
import { getExchange } from "@/config/exchanges";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({ title: "OKX 手續費與 VIP 等級比較", description: "整理 OKX 現貨、合約、掛單吃單與 VIP 手續費資訊，並比較返傭後的預估實際交易成本。", path: "/platform/okx" });

export default function OkxPlatformPage() {
  return <ExchangePlatformPage exchange={getExchange("okx")} />;
}
