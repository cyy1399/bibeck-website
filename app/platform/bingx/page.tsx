import type { Metadata } from "next";
import { ExchangeInfoPage } from "@/components/ExchangeInfoPage";
import { BINGX_FEE_CENTER, BINGX_SPOT_FEE_RULES } from "@/config/links";

export const metadata: Metadata = {
  title: "BingX 手續費與交易成本",
  description: "整理 BingX 現貨、永續合約、Maker／Taker 與資金費用重點。BiBeck 目前尚未提供 BingX 返傭。",
  alternates: { canonical: "/platform/bingx" },
};

export default function BingXPlatformPage() {
  return (
    <ExchangeInfoPage
      name="BingX"
      intro="快速理解 BingX 現貨與永續合約的 Maker／Taker 費率，以及資金費用對持倉成本的影響。"
      feeContext="BingX 的現貨費率會依交易對與活動調整，官方現貨規則列出的許多交易對費率為 0.100%；永續合約官方費率資料則列出 Maker 0.020%、Taker 0.050%。"
      feeRows={[
        { product: "現貨（常見交易對）", maker: "0.100%", taker: "0.100%", note: "不同交易對可能另有費率" },
        { product: "永續合約", maker: "0.020%", taker: "0.050%", note: "依帳戶與官方最新規則為準" },
        { product: "資金費用", maker: "不適用", taker: "不適用", note: "多空持倉者間定期交換" },
      ]}
      costPoints={[
        { label: "交易對差異", title: "現貨費率不是一個固定數字", copy: "不同幣對、活動與帳戶條件可能採用不同費率，應在下單前查看該交易對的實際顯示。" },
        { label: "永續合約", title: "開倉與平倉都可能計費", copy: "每次成交都會依 Maker 或 Taker 身分計算手續費，完整往返交易需要同時計入開倉與平倉。" },
        { label: "資金費用", title: "持倉時間也會形成成本", copy: "在資金費用結算時間持有永續合約，可能支付或收取資金費用，方向由當期資金費率決定。" },
      ]}
      sources={[
        { label: "查看 BingX 官方費用中心", href: BINGX_FEE_CENTER },
        { label: "查看 BingX 官方現貨費率規則", href: BINGX_SPOT_FEE_RULES },
      ]}
    />
  );
}
