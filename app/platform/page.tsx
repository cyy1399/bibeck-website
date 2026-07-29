import type { Metadata } from "next";
import { PlatformOverview } from "@/components/PlatformOverview";
import { createPageMetadata } from "@/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "交易所手續費與 VIP 比較",
  description: "比較 Bybit、Binance、BingX、Bitget 與 OKX 的手續費、VIP 資訊與 BiBeck 返傭服務狀態。",
  path: "/platforms",
});

export default function PlatformPage() {
  return <PlatformOverview />;
}
