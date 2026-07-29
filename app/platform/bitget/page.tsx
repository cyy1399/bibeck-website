import type { Metadata } from "next";
import { ExchangePlatformPage } from "@/components/ExchangePlatformPage";
import { getExchange } from "@/config/exchanges";

export const metadata: Metadata = {
  title: "Bitget 手續費與 VIP 等級比較",
  description: "整理 Bitget 現貨、合約、BGB 折扣與 VIP 手續費資訊，並比較返傭後的預估實際交易成本。",
  alternates: { canonical: "/platform/bitget" },
};

export default function BitgetPlatformPage() {
  return <ExchangePlatformPage exchange={getExchange("bitget")} />;
}