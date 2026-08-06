"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "@/components/ExternalLink";
import { REBATE_BACKOFFICE_URL } from "@/config/links";
import { PLATFORM_DIRECTORY } from "@/config/platforms";
import { brandConfig, contactMailto, supportMailto } from "@/config/brand";
import { DesktopExchangeMenu } from "@/components/DesktopExchangeMenu";
import { bybitActionLabels } from "@/config/actions";
import { SettingsMenu } from "@/components/SettingsMenu";
import { usePreferences } from "@/components/PreferencesProvider";
import { localizePath } from "@/config/locales";

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, locale } = usePreferences();
  const localizedMobileNavItems = [
    { href: localizePath("/", locale), label: t("nav.home") },
    { href: localizePath("/calculator", locale), label: t("nav.calculator") },
    { href: localizePath("/rebate", locale), label: t("nav.rebate") },
    { href: localizePath("/faq", locale), label: t("nav.faq") },
    { href: localizePath("/contact", locale), label: t("nav.contact") },
  ];
  const localizedFooterNavItems = [
    { href: localizePath("/platforms", locale), label: t("nav.exchanges") },
    { href: localizePath("/calculator", locale), label: t("nav.calculator") },
    { href: localizePath("/rebate", locale), label: t("nav.rebate") },
    { href: localizePath("/faq", locale), label: t("nav.faq") },
    { href: "/privacy", label: "隱私權政策" },
    { href: "/terms", label: "使用條款" },
    { href: "/affiliate-disclosure", label: "合作連結與佣金揭露" },
    { href: "/personal-data-notice", label: "個人資料蒐集告知" },
  ];
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <a href="#main-content" className="skip-link">跳至主要內容</a>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#0A0A0A]/92 backdrop-blur-2xl">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href={localizePath("/", locale)} className="group flex items-center gap-3" aria-label="BiBeck">
            <BrandMark />
            <span className="brand-wordmark text-lg font-semibold text-white">BiBeck</span>
          </Link>

          <nav aria-label="主要導覽" className="hidden items-center gap-6 lg:flex">
            <Link href={localizePath("/", locale)} className="nav-link">{t("nav.home")}</Link>
            <DesktopExchangeMenu />
            <Link href={localizePath("/calculator", locale)} className="nav-link">{t("nav.calculator")}</Link>
            <Link href={localizePath("/rebate", locale)} className="nav-link">{t("nav.rebate")}</Link>
            <Link href={localizePath("/faq", locale)} className="nav-link">{t("nav.faq")}</Link>
            <SettingsMenu />
          </nav>

          <ExternalLink href={REBATE_BACKOFFICE_URL} className="ml-auto hidden !min-h-11 !px-5 !text-xs sm:inline-flex lg:ml-0" aria-label="登入外部 Bybit 返傭後台">
            {bybitActionLabels.rebateDashboard}
          </ExternalLink>

          <details className="mobile-nav relative ml-3 lg:hidden">
            <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center border border-white/14 text-white" aria-label="開啟導覽選單" title="開啟導覽選單">
              <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
            </summary>
            <nav aria-label="行動版導覽" className="absolute right-0 top-14 max-h-[calc(100vh-5.5rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto border border-white/12 bg-[#101010] p-2 shadow-2xl">
              <Link href="/" className="mobile-nav-link">{t("nav.home")}</Link>
              <div className="border-b border-white/8 px-4 py-3">
                <Link href={localizePath("/platforms", locale)} className="block text-xs font-medium text-white/58 hover:text-gold">{t("nav.exchanges")}</Link>
                <div className="mt-3 grid gap-3">
                  {PLATFORM_DIRECTORY.map((platform) => (
                    <Link key={platform.href} href={localizePath(platform.href, locale)} className={"border-l pl-3 text-sm font-medium text-white hover:text-gold " + (platform.supported ? "border-gold" : "border-white/15")}>
                      <span className="flex items-center justify-between gap-3">
                        {platform.name}
                        <span className={"text-[0.68rem] font-normal " + (platform.supported ? "text-gold" : "text-white/38")}>{platform.status}</span>
                      </span>
                      {!platform.supported ? <span className="mt-1 block text-[0.68rem] font-normal text-white/28">暫無 BiBeck 返傭</span> : null}
                    </Link>
                  ))}
                </div>
              </div>
              {localizedMobileNavItems.slice(1).map((item) => <Link key={item.href} href={item.href} className="mobile-nav-link">{item.label}</Link>)}
              <SettingsMenu mobile />
              <ExternalLink href={REBATE_BACKOFFICE_URL} className="mt-2 w-full sm:hidden" aria-label="登入外部 Bybit 返傭後台">{bybitActionLabels.rebateDashboard}</ExternalLink>
            </nav>
          </details>
        </header>
      </div>

      <main id="main-content" tabIndex={-1}>{children}</main>

      <footer className="border-t border-white/10 bg-[#080808]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="flex items-center gap-4">
              <BrandMark size="large" />
              <div className="brand-wordmark text-xl font-semibold text-white">BiBeck</div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/48">{t("footer.tagline")}</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/54">
              {localizedFooterNavItems.map((item) => <Link key={item.href} href={item.href} className="hover:text-gold">{item.label}</Link>)}
            </div>
            <address className="mt-7 grid gap-2 not-italic text-sm text-white/54">
              <a href={contactMailto} className="break-all hover:text-gold">{t("footer.contact")}：{brandConfig.publicEmails.contact}</a>
              <a href={supportMailto} className="break-all hover:text-gold">{t("footer.support")}：{brandConfig.publicEmails.support}</a>
            </address>
          </div>
          <div className="max-w-3xl text-sm leading-7 text-white/48">
            <p className="text-white/72">BiBeck 為獨立第三方交易成本與返傭資訊平台，並非由任何交易所擁有、營運或官方背書。</p>
            <p className="mt-3">BiBeck 不提供投資建議、不保證任何獲利，也不保管使用者資產。交易涉及風險，使用者應自行評估並閱讀相關交易所條款。</p>
            <p className="mt-3">部分連結可能為合作夥伴連結；這項合作關係不會提高使用者原本適用的交易所手續費。</p>
            <p className="mt-3">各交易所名稱與商標均屬其各自權利人所有。© 2026 BiBeck.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BrandMark({ size = "default" }: { size?: "default" | "large" }) {
  return (
    <span className={"brand-mark " + (size === "large" ? "brand-mark-large" : "")} aria-hidden="true">
      <span className="brand-mark-image" />
    </span>
  );
}
