import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "@/components/ExternalLink";
import { BYBIT_REGISTER } from "@/config/links";
import { PLATFORM_DIRECTORY } from "@/config/platforms";
import { brandConfig, businessMailto, contactMailto, supportMailto } from "@/config/brand";

const mobileNavItems = [
  { href: "/", label: "首頁" },
  { href: "/calculator", label: "費率計算器" },
  { href: "/platform/bybit#rebate", label: "返傭說明" },
  { href: "/faq", label: "常見問題" },
  { href: "/contact", label: "聯絡我們" },
];

const footerNavItems = [
  { href: "/platforms", label: "交易所比較" },
  { href: "/calculator", label: "費率計算器" },
  { href: "/platform/bybit#rebate", label: "返傭說明" },
  { href: "/faq", label: "常見問題" },
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <a href="#main-content" className="skip-link">跳至主要內容</a>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#0A0A0A]/92 backdrop-blur-2xl">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="BiBeck 首頁">
            <BrandMark />
            <span className="brand-wordmark text-lg font-semibold text-white">BiBeck</span>
          </Link>

          <nav aria-label="主要導覽" className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="nav-link">首頁</Link>
            <details className="platform-menu relative">
              <summary className="nav-link flex cursor-pointer list-none items-center gap-2">
                交易所比較
                <span className="platform-chevron" aria-hidden="true" />
              </summary>
              <div className="platform-menu-panel absolute left-1/2 top-9 w-80 -translate-x-1/2 border border-white/12 bg-[#101010] p-2 shadow-2xl">
                <Link href="/platforms" className="block border-b border-white/10 px-4 py-3 text-xs font-semibold text-white/70 transition hover:text-gold">
                  查看交易所比較總覽
                </Link>
                {PLATFORM_DIRECTORY.map((platform) => (
                  <Link
                    key={platform.href}
                    href={platform.href}
                    className={"block border-l-2 px-4 py-3 transition hover:bg-white/[0.035] " + (platform.supported ? "border-gold" : "border-white/10")}
                  >
                    <span className="flex items-center justify-between gap-4 text-sm font-semibold text-white">
                      {platform.name}
                      <span className={"text-[0.68rem] font-medium " + (platform.supported ? "text-gold" : "text-white/46")}>{platform.status}</span>
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-white/46">{platform.summary}</span>
                    {!platform.supported ? <span className="mt-1 block text-[0.68rem] text-white/30">暫無 BiBeck 返傭</span> : null}
                  </Link>
                ))}
              </div>
            </details>
            <Link href="/calculator" className="nav-link">費率計算器</Link>
            <Link href="/platform/bybit#rebate" className="nav-link">返傭說明</Link>
            <Link href="/faq" className="nav-link">常見問題</Link>
          </nav>

          <ExternalLink href={BYBIT_REGISTER} sponsored className="ml-auto hidden !min-h-11 !px-5 !text-xs sm:inline-flex lg:ml-0">
            取得 Bybit 返傭
          </ExternalLink>

          <details className="mobile-nav relative ml-3 lg:hidden">
            <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center border border-white/14 text-white" aria-label="開啟導覽選單" title="開啟導覽選單">
              <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
            </summary>
            <nav aria-label="行動版導覽" className="absolute right-0 top-14 max-h-[calc(100vh-5.5rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto border border-white/12 bg-[#101010] p-2 shadow-2xl">
              <Link href="/" className="mobile-nav-link">首頁</Link>
              <div className="border-b border-white/8 px-4 py-3">
                <Link href="/platforms" className="block text-xs font-medium text-white/58 hover:text-gold">交易所比較總覽</Link>
                <div className="mt-3 grid gap-3">
                  {PLATFORM_DIRECTORY.map((platform) => (
                    <Link key={platform.href} href={platform.href} className={"border-l pl-3 text-sm font-medium text-white hover:text-gold " + (platform.supported ? "border-gold" : "border-white/15")}>
                      <span className="flex items-center justify-between gap-3">
                        {platform.name}
                        <span className={"text-[0.68rem] font-normal " + (platform.supported ? "text-gold" : "text-white/38")}>{platform.status}</span>
                      </span>
                      {!platform.supported ? <span className="mt-1 block text-[0.68rem] font-normal text-white/28">暫無 BiBeck 返傭</span> : null}
                    </Link>
                  ))}
                </div>
              </div>
              {mobileNavItems.slice(1).map((item) => <Link key={item.href} href={item.href} className="mobile-nav-link">{item.label}</Link>)}
              <ExternalLink href={BYBIT_REGISTER} sponsored className="mt-2 w-full sm:hidden">取得 Bybit 返傭</ExternalLink>
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
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/48">交易成本優化與手續費返傭平台</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/54">
              {footerNavItems.map((item) => <Link key={item.href} href={item.href} className="hover:text-gold">{item.label}</Link>)}
            </div>
            <address className="mt-7 grid gap-2 not-italic text-sm text-white/54">
              <a href={contactMailto} className="break-all hover:text-gold">一般聯絡：{brandConfig.emails.contact}</a>
              <a href={supportMailto} className="break-all hover:text-gold">返傭客服：{brandConfig.emails.support}</a>
              <a href={businessMailto} className="break-all hover:text-gold">商務合作：{brandConfig.emails.business}</a>
            </address>
          </div>
          <div className="max-w-3xl text-sm leading-7 text-white/48">
            <p className="text-white/72">BiBeck 為獨立第三方交易成本與返傭資訊平台，並非由任何交易所擁有、營運或官方背書。</p>
            <p className="mt-3">BiBeck 不提供投資建議、不保證任何獲利，也不保管使用者資產。交易涉及風險，使用者應自行評估並閱讀相關交易所條款。</p>
            <p className="mt-3">部分連結可能為合作夥伴連結。當使用者透過相關連結註冊或交易時，BiBeck 可能取得合作佣金或返傭收入。</p>
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
