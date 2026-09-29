"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SettingsMenu } from "@/components/SettingsMenu";
import { usePreferences } from "@/components/PreferencesProvider";
import { brandConfig, contactMailto, supportMailto } from "@/config/brand";
import { LINE_OFFICIAL_URL, REBATE_BACKOFFICE_URL } from "@/config/links";
import { localizePath } from "@/config/locales";

type NavItem = { href: string; label: string; external?: boolean };

const navigation = [
  {
    label: "Learn",
    items: [
      { href: "/learn", label: "學習總覽" },
      { href: "/learn/money", label: "Money｜金錢系統" },
      { href: "/learn/investing", label: "Investing｜投資" },
      { href: "/learn/crypto", label: "Crypto｜加密資產" },
      { href: "/learn/trading", label: "Trading｜交易" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/tools", label: "工具總覽" },
      { href: "/tools/life-allocation", label: "Life Allocation" },
      { href: "/calculator", label: "交易成本計算機" },
    ],
  },
  {
    label: "Bybit",
    items: [
      { href: "/bybit", label: "Bybit 專區" },
      { href: "/rebate", label: "返傭說明" },
      { href: "/platform/bybit", label: "費率與資格" },
      { href: "/apply/bybit", label: "申請返傭" },
      { href: REBATE_BACKOFFICE_URL, label: "返傭後台", external: true },
    ],
  },
  {
    label: "About",
    items: [
      { href: "/philosophy", label: "品牌理念" },
      { href: "/faq", label: "常見問題" },
      { href: "/contact", label: "聯絡我們" },
    ],
  },
] satisfies { label: string; items: NavItem[] }[];

export function SiteShell({ children }: { children: ReactNode }) {
  const { locale } = usePreferences();
  const localized = (href: string) => localizePath(href, locale);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <a href="#main-content" className="skip-link">跳至主要內容</a>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#0A0A0A]/92 backdrop-blur-2xl">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href={localized("/")} className="focus-ring group flex items-center gap-3" aria-label="BiBeck 首頁">
            <BrandMark />
            <span className="brand-wordmark text-lg font-semibold text-white">BiBeck</span>
          </Link>

          <nav aria-label="主要導覽" className="hidden items-center gap-5 lg:flex">
            <Link href={localized("/")} className="nav-link">Home</Link>
            {navigation.map((group) => (
              <details key={group.label} className="nav-group">
                <summary className="nav-link focus-ring">{group.label}</summary>
                <div className="nav-group-panel">
                  {group.items.map((item) => item.external ? (
                    <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="nav-group-link">{item.label}<span aria-hidden="true">↗</span></a>
                  ) : (
                    <Link key={item.href} href={localized(item.href)} className="nav-group-link">{item.label}</Link>
                  ))}
                </div>
              </details>
            ))}
            <SettingsMenu />
          </nav>

          <details className="mobile-nav relative ml-3 lg:hidden">
            <summary className="focus-ring grid h-11 w-11 cursor-pointer list-none place-items-center border border-white/14 text-white" aria-label="開啟導覽選單" title="開啟導覽選單">
              <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
            </summary>
            <nav aria-label="行動版導覽" className="absolute right-0 top-14 max-h-[calc(100vh-5.5rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto border border-white/12 bg-[#101010] p-3 shadow-2xl">
              <Link href={localized("/")} className="mobile-nav-link">Home</Link>
              {navigation.map((group) => (
                <div key={group.label} className="mobile-nav-group">
                  <p>{group.label}</p>
                  {group.items.map((item) => item.external ? (
                    <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="mobile-nav-link">{item.label}<span aria-hidden="true">↗</span></a>
                  ) : (
                    <Link key={item.href} href={localized(item.href)} className="mobile-nav-link">{item.label}</Link>
                  ))}
                </div>
              ))}
              <SettingsMenu mobile />
            </nav>
          </details>
        </header>
      </div>

      <main id="main-content" tabIndex={-1}>{children}</main>

      <footer className="border-t border-white/10 bg-[#080808]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="flex items-center gap-4"><BrandMark size="large" /><div className="brand-wordmark text-xl font-semibold text-white">BiBeck</div></div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/58">理解金錢，做更好的選擇。<br /><span className="text-white/36">Understand money. Make better decisions.</span></p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/54">
              <Link href={localized("/learn")} className="hover:text-gold">Learn</Link>
              <Link href={localized("/tools")} className="hover:text-gold">Tools</Link>
              <Link href={localized("/bybit")} className="hover:text-gold">Bybit</Link>
              <Link href={localized("/philosophy")} className="hover:text-gold">About</Link>
              <Link href="/privacy" className="hover:text-gold">隱私權政策</Link>
              <Link href="/terms" className="hover:text-gold">使用條款</Link>
              <Link href="/affiliate-disclosure" className="hover:text-gold">合作連結與佣金揭露</Link>
              <Link href="/personal-data-notice" className="hover:text-gold">個人資料蒐集告知</Link>
            </div>
            <address className="mt-7 grid gap-2 not-italic text-sm text-white/54">
              <a href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gold">LINE 官方帳號</a>
              <a href={contactMailto} className="break-all hover:text-gold">聯絡：{brandConfig.publicEmails.contact}</a>
              <a href={supportMailto} className="break-all hover:text-gold">支援：{brandConfig.publicEmails.support}</a>
            </address>
          </div>
          <div className="max-w-3xl text-sm leading-7 text-white/48">
            <p className="text-white/72">BiBeck 提供金錢、投資、加密資產與交易成本相關的知識與工具，內容僅供資訊與教育用途。</p>
            <p className="mt-3">BiBeck 不提供投資建議、不保證任何獲利，也不保管使用者資產。交易涉及風險，使用者應自行評估並閱讀相關服務條款。</p>
            <p className="mt-3">BiBeck 為獨立第三方平台，並非由任何交易所擁有、營運或官方背書。部分連結可能為合作夥伴連結，合作關係不會提高使用者原本適用的交易所手續費。</p>
            <p className="mt-3">各交易所名稱與商標均屬其各自權利人所有。© 2026 BiBeck.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BrandMark({ size = "default" }: { size?: "default" | "large" }) {
  return <span className={`brand-mark ${size === "large" ? "brand-mark-large" : ""}`} aria-hidden="true"><span className="brand-mark-image" /></span>;
}
