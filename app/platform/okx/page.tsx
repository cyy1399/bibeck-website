import type { Metadata } from "next";
import { ExchangeInfoPage } from "@/components/ExchangeInfoPage";
import { OKX_FEE_RULES, OKX_FUTURES_FEE_GUIDE } from "@/config/links";

export const metadata: Metadata = {
  title: "OKX 手續費與交易成本",
  description: "整理 OKX 現貨、合約、Maker／Taker、VIP 費率與資金費用重點。BiBeck 目前尚未提供 OKX 返傭。",
  alternates: { canonical: "/platform/okx" },
};

export default function OkxPlatformPage() {
  return (
    <ExchangeInfoPage
      name="OKX"
      intro="快速理解 OKX 現貨與合約 Maker／Taker 費率、VIP 等級及資金費用如何構成實際交易成本。"
      feeContext="OKX 官方規則以帳戶層級與產品決定實際費率。官方計算範例使用現貨 Maker 0.080%、Taker 0.100%，以及合約 Maker 0.020%、Taker 0.050%；這些數字應視為理解計算方式的基準，而非所有帳戶的固定費率。"
      feeRows={[
        { product: "現貨／槓桿（官方示例）", maker: "0.080%", taker: "0.100%", note: "實際依帳戶費率層級" },
        { product: "永續／交割合約（Lv1 示例）", maker: "0.020%", taker: "0.050%", note: "實際依產品與帳戶等級" },
        { product: "資金費用", maker: "不適用", taker: "不適用", note: "永續合約多空持倉者間交換" },
      ]}
      costPoints={[
        { label: "帳戶等級", title: "資產與交易量決定費率", copy: "OKX 依資產規模、30 日交易量與產品類型判定費率等級，登入後的「我的交易費率」最接近實際成本。" },
        { label: "成交方式", title: "費率取決於實際成交角色", copy: "市價單通常是 Taker；限價單若立即成交也可能成為 Taker，不能只用訂單名稱判斷費率。" },
        { label: "完整成本", title: "合約需計入開平倉與資金費用", copy: "永續合約的實現損益可能同時受到開倉費、平倉費與資金費用影響。" },
      ]}
      sources={[
        { label: "查看 OKX 官方交易費用規則", href: OKX_FEE_RULES },
        { label: "查看 OKX 官方合約費用計算", href: OKX_FUTURES_FEE_GUIDE },
      ]}
    />
  );
}
