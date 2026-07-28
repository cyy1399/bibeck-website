import type { Metadata } from "next";
import { ExchangeInfoPage } from "@/components/ExchangeInfoPage";
import { BINANCE_FEE_GUIDE, BINANCE_FEE_STRUCTURE } from "@/config/links";

export const metadata: Metadata = {
  title: "Binance 手續費與交易成本",
  description: "整理 Binance 現貨 Maker／Taker 費率、BNB 手續費抵扣、VIP 等級與交易成本重點。BiBeck 目前尚未提供 Binance 返傭。",
  alternates: { canonical: "/platform/binance" },
};

export default function BinancePlatformPage() {
  return (
    <ExchangeInfoPage
      name="Binance"
      intro="快速理解 Binance 現貨 Maker／Taker 費率、BNB 手續費抵扣與 VIP 等級如何影響實際交易成本。"
      feeContext="Binance 採 Maker／Taker 與 VIP 分級制度。官方費率表目前列出一般用戶現貨 Maker 與 Taker 均為 0.100%，使用 BNB 支付時可能取得折扣；不同產品與促銷交易對可能採用其他費率。"
      feeRows={[
        { product: "現貨／槓桿（一般用戶）", maker: "0.100%", taker: "0.100%", note: "未計 BNB 抵扣" },
        { product: "現貨／槓桿（BNB 抵扣示例）", maker: "0.075%", taker: "0.075%", note: "以官方目前列示 25% 抵扣計" },
        { product: "合約與其他產品", maker: "依帳戶顯示", taker: "依帳戶顯示", note: "依產品、地區與 VIP 等級不同" },
      ]}
      costPoints={[
        { label: "BNB 抵扣", title: "支付方式會改變費率", copy: "開啟 BNB 支付手續費後，符合條件的交易可依平台當期規則取得折扣；折扣比例可能調整。" },
        { label: "VIP 等級", title: "交易量與持倉影響費率", copy: "VIP 等級依 30 日交易量與 BNB 持有條件計算，較高等級通常可取得較低 Maker／Taker 費率。" },
        { label: "成交角色", title: "限價單不一定是 Maker", copy: "若限價單提交後立即成交，仍會按 Taker 計費；應以每筆成交紀錄中的實際角色為準。" },
      ]}
      sources={[
        { label: "查看 Binance 官方費率表", href: BINANCE_FEE_STRUCTURE },
        { label: "查看 Binance 官方手續費計算指南", href: BINANCE_FEE_GUIDE },
      ]}
    />
  );
}
