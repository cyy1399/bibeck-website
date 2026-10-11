import { ContentIndex } from "@/components/ContentIndex";
import { createPageMetadata } from "@/config/seo";

export const metadata = createPageMetadata({ title: "理財", description: "從現金流、負債與預備金開始，整理理財知識、金錢系統與配置工具。", path: "/money" });

export default function MoneyPage() {
  return <ContentIndex title="理財" copy="先看懂自己的錢，再決定如何安排生活與未來。" groups={[
    { title: "知識", items: [
      { title: "理財基礎", copy: "現金流、續航力、緊急預備金、負債與人生資本。", href: "/learn/money" },
    ] },
    { title: "系統與工具", items: [
      { title: "Money OS", copy: "將財務紀錄轉成狀態、分析與下一步行動，查看目前的設計方向。", href: "/money-os", status: "建置中" },
      { title: "人生資本配置", copy: "整理金錢、時間與精力的分配。", href: "/tools/life-allocation" },
    ] },
  ]} />;
}
