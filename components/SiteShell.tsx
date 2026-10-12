"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/components/PreferencesProvider";
import { localizePath } from "@/config/locales";

const navigation = [
  { href: "/market", label: "市場" },
  { href: "/tools", label: "工具" },
  { href: "/workspace", label: "我的交易" },
  { href: "/research", label: "研究" },
  { href: "/learn", label: "學習" },
  { href: "/exchanges", label: "交易所與成本" },
  { href: "/community", label: "交流" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const { locale } = usePreferences();
  const pathname = usePathname();
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
            {navigation.map((item) => (
              <Link key={item.href} href={localized(item.href)} className="nav-link" aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>
            ))}
            <Link href="/account" className="trader-account focus-ring">資料與設定</Link>
          </nav>

          <details className="mobile-nav relative ml-3 lg:hidden">
            <summary className="focus-ring grid h-11 w-11 cursor-pointer list-none place-items-center border border-white/14 text-white" aria-label="開啟導覽選單" title="開啟導覽選單">
              <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
            </summary>
            <nav aria-label="行動版導覽" className="absolute right-0 top-14 max-h-[calc(100vh-5.5rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto border border-white/12 bg-[#101010] p-3 shadow-2xl">
              {navigation.map((item) => (
                <Link key={item.href} href={localized(item.href)} className="mobile-nav-link">{item.label}</Link>
              ))}
              <Link href="/account" className="mobile-nav-link">資料與設定</Link>
            </nav>
          </details>
        </header>
      </div>

      <main id="main-content" tabIndex={-1}>{children}</main>

      <footer className="border-t border-white/10 bg-[#080808]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 text-xs leading-6 text-white/45 sm:px-8">
          <p>計畫、紀錄與分析協助你核對風險與成本。本站不保管資產，也不自動執行交易。</p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span>© 2026 BiBeck · 合約交易者的工作平台</span>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/roadmap" className="hover:text-gold">產品進度</Link>
              <Link href={localized("/about")} className="hover:text-gold">關於</Link>
              <Link href={localized("/contact")} className="hover:text-gold">聯絡</Link>
              <Link href={localized("/faq")} className="hover:text-gold">常見問題</Link>
              <Link href="/privacy" className="hover:text-gold">隱私權政策</Link>
              <Link href="/terms" className="hover:text-gold">使用條款</Link>
              <Link href="/affiliate-disclosure" className="hover:text-gold">合作揭露</Link>
              <Link href="/personal-data-notice" className="hover:text-gold">個資告知</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BrandMark({ size = "default" }: { size?: "default" | "large" }) {
  return <span className={`brand-mark ${size === "large" ? "brand-mark-large" : ""}`} aria-hidden="true"><span className="brand-mark-image" /></span>;
}
