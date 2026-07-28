import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { FAQList } from "@/components/FAQList";
import { FeeCalculator } from "@/components/FeeCalculator";
import { SectionTitle } from "@/components/Sections";
import { SiteShell } from "@/components/SiteShell";
import { TrustNotice } from "@/components/TrustNotice";
import { BYBIT_REGISTER, REBATE_LOGIN } from "@/config/links";

export const metadata: Metadata = {
  title: "BiBeck｜交易成本優化與手續費返傭平台",
  description: "BiBeck 透過手續費資訊、返傭服務與交易成本工具，幫助交易者減少長期交易支出。",
  alternates: { canonical: "/" },
};

const helpItems = [
  ["01", "了解交易成本", "了解 Maker、Taker、資金費用、滑價、提幣費與 VIP 費率如何形成總交易成本。"],
  ["02", "降低手續費支出", "透過符合資格的返傭安排，降低實際支付的交易手續費。"],
  ["03", "追蹤節省金額", "使用計算工具估算節省金額，並從返傭後台查看可用紀錄。"],
];

const rebateSteps = [
  "使用 BiBeck 專屬推薦連結註冊 Bybit",
  "完成帳戶設定並確認適用資格",
  "開始交易，符合條件的手續費進入返傭計算",
  "登入返傭後台查看紀錄與發放狀態",
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
            <div className="reveal mt-9 flex flex-col gap-3 sm:flex-row">
              <ExternalLink href={BYBIT_REGISTER}>取得返傭</ExternalLink>
              <Link href="/calculator" className="button-secondary">計算可節省費用</Link>
            </div>
            <p className="reveal mt-6 max-w-2xl text-xs leading-6 text-white/38">
              BiBeck 為獨立第三方平台，並非 Bybit 官方網站或代表。
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionTitle
            label="交易成本"
            title="手續費累積得比想像更快"
            copy="單筆費用看起來很小，但交易頻率與交易量會把成本持續放大。這些支出會直接侵蝕長期績效，而返傭能降低其中一部分實際成本。"
          />
          <div className="cost-formula reveal">
            <div><span>每月交易量</span><strong>US$100,000</strong></div>
            <b aria-hidden="true">×</b>
            <div><span>手續費率</span><strong>0.055%</strong></div>
            <b aria-hidden="true">=</b>
            <div><span>每月手續費</span><strong className="text-gold">US$55</strong></div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-7 text-sm leading-7 text-secondary">
          上述為 Bybit 非 VIP 永續與交割合約 Taker 基本費率的簡化示例；實際成本還可能包含資金費用、滑價、提幣費與不同 VIP 費率。
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

      <section className="section-muted border-y border-white/10 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionTitle
              label="Bybit 返傭"
              title="取回部分交易手續費"
              copy="返傭不是獲利承諾，而是一種交易成本管理方式。完成符合資格的註冊與綁定後，部分交易手續費可依合作規則回饋。"
            />
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ExternalLink href={BYBIT_REGISTER}>透過 Bybit 註冊</ExternalLink>
              <ExternalLink href={REBATE_LOGIN} variant="secondary">返傭後台</ExternalLink>
            </div>
            <Link href="/platform/bybit" className="text-link mt-7">查看 Bybit 平台說明 <span aria-hidden="true">→</span></Link>
          </div>
          <ol className="border-t border-white/12">
            {rebateSteps.map((step, index) => (
              <li key={step} className="grid grid-cols-[48px_1fr] gap-4 border-b border-white/12 py-5 text-base leading-7 text-white/78">
                <span className="font-mono text-sm text-gold">0{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8" id="calculator-preview">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionTitle
              label="交易成本計算器"
              title="估算你可以節省多少費用"
              copy="輸入每月交易量、手續費率與適用返傭比例，快速估算每月費用與年度可能節省的成本。"
            />
            <Link href="/calculator" className="text-link">開啟完整計算器 <span aria-hidden="true">→</span></Link>
          </div>
          <div className="mt-12"><FeeCalculator compact /></div>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionTitle label="常見問題" title="先把重要問題說清楚。" copy="透明的身分、資格與風險界線，是返傭服務建立信任的第一步。" />
          <div>
            <FAQList limit={5} />
            <Link href="/faq" className="text-link mt-8">查看所有問題 <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8"><div className="mx-auto max-w-7xl"><TrustNotice /></div></section>
    </SiteShell>
  );
}
