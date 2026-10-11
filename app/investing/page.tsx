import { notes, noteHref } from "@/config/notes";
import { ContentIndex } from "@/components/ContentIndex";
import { createPageMetadata } from "@/config/seo";

export const metadata = createPageMetadata({ title: "投資", description: "整理投資、加密資產與交易知識，以及交易成本工具和 Bybit 合作資源。", path: "/investing" });

export default function InvestingPage() {
  return <ContentIndex title="投資" copy="理解資產、風險與成本，再做自己的判斷。" groups={[
    { title: "最新筆記", items: notes.filter((note) => note.category === "投資").map((note) => ({ title: note.title, copy: note.summary, href: noteHref(note) })) },
    { title: "知識", items: [
      { title: "投資基礎", copy: "風險與報酬、複利、分散與資金使用時間。", href: "/learn/investing" },
      { title: "加密資產", copy: "Bitcoin、Ethereum、穩定幣與保管風險。", href: "/learn/crypto" },
      { title: "交易", copy: "市場機制、執行成本與交易風險。", href: "/learn/trading" },
      { title: "資金費率", copy: "理解永續合約的資金費率機制。", href: "/learn/trading/funding-rate" },
    ] },
    { title: "工具與資源", items: [
      { title: "交易成本計算器", copy: "比較手續費、VIP 費率與返傭後的預估成本。", href: "/calculator" },
      { title: "Bybit 資源", copy: "返傭說明、費率、申請資格與合作揭露。", href: "/bybit" },
    ] },
  ]} />;
}
