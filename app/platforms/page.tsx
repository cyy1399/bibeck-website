import type { Metadata } from "next";
import { PlatformOverview } from "@/components/PlatformOverview";

export const metadata: Metadata = {
  title: "交易所手續費與 VIP 比較",
  description: "比較 Bybit、Binance、BingX、Bitget 與 OKX 的基礎手續費、VIP 資訊與 BiBeck 返傭服務狀態。",
  alternates: { canonical: "/platforms" },
};

export default function PlatformsPage() {
  return <PlatformOverview />;
}