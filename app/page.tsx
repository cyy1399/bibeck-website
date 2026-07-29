import type { Metadata } from "next";
import Link from "next/link";
import { ExchangeActionButtons } from "@/components/ExchangeActionButtons";
import { FAQList } from "@/components/FAQList";
import { BybitCostCalculator } from "@/components/BybitCostCalculator";
import { SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";

export const metadata: Metadata = {
  title: "BiBeck｜計算真實的交易成本",
  description: "BiBeck 透過手續費資訊、返傭服務與交易成本工具，幫助交易者減少長期交易支出。",
  alternates: { canonical: "/" },
};

const helpItems = [
  ["01", "了解交易成本", "了解 Maker、Taker、資金費用、滑價、提幣費與 VIP 費率如何形成總交易成本。"],
  ["02", "降低手續費支出", "透過符合資格的返傭安排，降低實際支付的交易手續費。"],
  ["03", "追蹤節省金額", "使用計算工具估算節省金額，並從返傭後台查看可用紀錄。"],
];

export default function Home() {
  return (
    <SiteShell>
      <section className="home-hero relative px-5 pb-20 pt-36 sm:px-8 lg:pb-24 lg:pt-44">
        <div className="mx-auto flex min-h-[62vh] max-w-7xl items-center">
          <div className="relative z-10 max-w-4xl">
            <p className="reveal eyebrow">交易成本優化與手續費返傭平台</p>
            <h1 className="reveal mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.06] text-white sm:text-7xl lg:text-[5.2rem]">
              降低每一筆交易成本。
            </h1>
            <p className="reveal mt-7 max-w-2xl text-lg leading-9 text-secondary">
              BiBeck 透過清楚的手續費資訊、返傭服務與交易成本工具，幫助交易者減少長期交易支出。
            </p>
            <div className="reveal mt-9"><ExchangeActionButtons exchangeSlug="bybit" calculatorHref="#trading-cost-calculator" /></div>
            <p className="reveal mt-6 max-w-2xl text-xs leading-6 text-white/38">
              BiBeck 為獨立第三方平台，並非 Bybit 官方網站或代表。
            </p>
          </div>
        </div>
      </section>

      <section className="scroll-mt-24 border-y border-white/10 px-5 py-20 sm:px-8" id="trading-cost-calculator">
        <div className="mx-auto max-w-7xl">
          <SectionTitle label="交易成本計算器" title="計算真實的交易成本" copy="比較不同交易所、VIP 等級與 BiBeck 返傭後的實際交易成本。目前 Bybit 提供完整計算，其餘平台將陸續開放。" />
          <div className="mt-10"><BybitCostCalculator /></div>
          <p className="mt-6 border-l border-gold/55 pl-4 text-sm leading-7 text-secondary">交易頻率與交易量越高，手續費對長期績效的影響越明顯。</p>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle label="BiBeck 如何協助" title="先看懂成本，再開始降低成本。" />
          <div className="mt-14 grid border-y border-white/10 md:grid-cols-3">
            {helpItems.map(([number, title, copy]) => (
              <article key={number} className="reveal border-b border-white/10 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
                <p className="font-mono text-sm text-gold">{number}</p>
                <h3 className="mt-8 text-2xl font-semibold text-white">{title}</h3>
                <p className="mt-4 text-base leading-8 text-secondary">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionTitle label="常見問題" title="先把重要問題說清楚。" copy="透明的身分、資格與風險界線，是返傭服務建立信任的第一步。" />
          <div>
            <FAQList limit={4} />
            <Link href="/faq" className="text-link mt-8">查看所有問題 <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice /></div></section>
    </SiteShell>
  );
}
