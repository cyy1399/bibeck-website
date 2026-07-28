import type { Metadata } from "next";
import { ExchangeInfoPage } from "@/components/ExchangeInfoPage";
import { BITGET_FEE_CENTER, BITGET_FEE_GUIDE } from "@/config/links";

export const metadata: Metadata = {
  title: "Bitget 手續費與交易成本",
  description: "整理 Bitget 現貨、合約、BGB 抵扣、資金費用與提領成本。BiBeck 目前尚未提供 Bitget 返傭。",
  alternates: { canonical: "/platform/bitget" },
};

export default function BitgetPlatformPage() {
  return (
    <ExchangeInfoPage
      name="Bitget"
      intro="快速理解 Bitget 現貨與合約 Maker／Taker 費率、BGB 抵扣、資金費用與提領成本。"
      feeContext="Bitget 官方費用說明列出現貨 Maker 與 Taker 均為 0.100%，使用 BGB 支付時可依規則折抵至 0.080%；合約 Maker 為 0.020%、Taker 為 0.060%。"
      feeRows={[
        { product: "現貨", maker: "0.100%", taker: "0.100%", note: "BGB 支付示例為 0.080%" },
        { product: "合約", maker: "0.020%", taker: "0.060%", note: "VIP 與交易量可能影響費率" },
        { product: "提領", maker: "不適用", taker: "不適用", note: "依幣種、網路與鏈上成本變動" },
      ]}
      costPoints={[
        { label: "BGB 抵扣", title: "平台幣可降低部分現貨費用", copy: "使用 BGB 支付現貨手續費時，符合條件的交易可依平台當期規則取得折扣。" },
        { label: "合約成本", title: "Taker 費率通常高於 Maker", copy: "需要立即成交的訂單通常以 Taker 計費；頻繁進出時，開倉與平倉費用會快速累積。" },
        { label: "提領成本", title: "網路選擇也會影響支出", copy: "提領費用依幣種與鏈上網路變動，轉帳前應同時比較費率、網路相容性與到帳需求。" },
      ]}
      sources={[
        { label: "查看 Bitget 官方費用說明", href: BITGET_FEE_GUIDE },
        { label: "查看 Bitget 官方費率中心", href: BITGET_FEE_CENTER },
      ]}
    />
  );
}
