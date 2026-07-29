import type { Metadata } from "next";
import { ExchangePlatformPage } from "@/components/ExchangePlatformPage";
import { getExchange } from "@/config/exchanges";

export const metadata: Metadata = {
  title: "BingX 手續費與 VIP 等級比較",
  description: "整理 BingX 現貨、永續合約與 VIP 手續費資訊，並比較返傭後的預估實際交易成本。",
  alternates: { canonical: "/platform/bingx" },
};

export default function BingxPlatformPage() {
  return <ExchangePlatformPage exchange={getExchange("bingx")} />;
}