import Link from "next/link";
import type { ReactNode } from "react";
import { PLATFORM_DIRECTORY } from "@/config/platforms";

const directNavItems = [
  { href: "/", label: "首頁" },
  { href: "/calculator", label: "計算器" },
  { href: "/faq", label: "常見問題" },
];

const footerNavItems = [
  { href: "/platform", label: "平台總覽" },
  { href: "/platform/bybit", label: "Bybit 返傭" },
  { href: "/calculator", label: "交易成本計算器" },
  { href: "/faq", label: "常見問題" },
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#0A0A0A]/88 backdrop-blur-2xl">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="BiBeck 首頁">
            <BrandMark />
            <span className="brand-wordmark text-lg font-semibold text-white">BiBeck</span>
          </Link>

          <nav aria-label="主要導覽" className="hidden items-center gap-7 lg:flex">
            <Link href="/" className="nav-link">首頁</Link>
            <details className="platform-menu relative">
              <summary className="nav-link flex cursor-pointer list-none items-center gap-2">
                平台
                <span className="platform-chevron" aria-hidden="true" />
              </summary>
              <div className="platform-menu-panel absolute left-1/2 top-9 w-80 -translate-x-1/2 border border-white/12 bg-[#101010] p-2 shadow-2xl">
                <Link href="/platform" className="block border-b border-white/10 px-4 py-3 text-xs font-semibold text-white/70 transition hover:text-gold">
                  查看平台總覽
                </Link>
                {PLATFORM_DIRECTORY.map((platform) => (
                  <Link
                    key={platform.href}
                    href={platform.href}
                    className={"block border-l-2 px-4 py-3 transition hover:bg-white/[0.035] " + (platform.supported ? "border-gold" : "border-white/10")}
                  >
                    <span className="flex items-center justify-between gap-4 text-sm font-semibold text-white">
                      {platform.name}
                      <span className={"text-[0.65rem] font-medium " + (platform.supported ? "text-gold" : "text-white/32")}>{platform.status}</span>
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-white/42">{platform.summary}</span>
                  </Link>
                ))}
              </div>
            </details>
            <Link href="/calculator" className="nav-link">計算器</Link>
            <Link href="/faq" className="nav-link">常見問題</Link>
          </nav>

          <Link
            href="/platform/bybit#rebate"
            className="ml-auto hidden min-h-11 items-center border border-gold bg-gold px-5 text-xs font-semibold text-[#0A0A0A] transition hover:border-[#E8C766] hover:bg-[#E8C766] sm:inline-flex lg:ml-0"
          >
            取得返傭
          </Link>

          <details className="mobile-nav relative ml-3 lg:hidden">
            <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center border border-white/14 text-white" aria-label="開啟導覽選單" title="開啟導覽選單">
              <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
            </summary>
            <nav aria-label="行動版導覽" className="absolute right-0 top-14 max-h-[calc(100vh-6rem)] w-72 overflow-y-auto border border-white/12 bg-[#101010] p-2 shadow-2xl">
              <Link href="/" className="mobile-nav-link">首頁</Link>
              <div className="border-b border-white/8 px-4 py-3">
                <Link href="/platform" className="block text-xs font-medium text-white/50 hover:text-gold">平台總覽</Link>
                <div className="mt-3 grid gap-3">
                  {PLATFORM_DIRECTORY.map((platform) => (
                    <Link key={platform.href} href={platform.href} className={"border-l pl-3 text-sm font-medium text-white hover:text-gold " + (platform.supported ? "border-gold" : "border-white/15")}>
                      <span className="flex items-center justify-between gap-3">
                        {platform.name}
                        <span className={"text-[0.62rem] font-normal " + (platform.supported ? "text-gold" : "text-white/30")}>{platform.status}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              {directNavItems.slice(1).map((item) => (
                <Link key={item.href} href={item.href} className="mobile-nav-link">{item.label}</Link>
              ))}
              <Link href="/platform/bybit#rebate" className="mt-2 flex min-h-11 items-center justify-center bg-gold px-4 text-sm font-semibold text-[#0A0A0A] sm:hidden">
                取得返傭
              </Link>
            </nav>
          </details>
        </header>
      </div>

      <main>{children}</main>

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
          </div>
          <div className="max-w-3xl text-sm leading-7 text-white/48">
            <p className="text-white/72">BiBeck 為獨立第三方平台，並非由任何交易所擁有、營運或官方背書。</p>
            <p className="mt-3">BiBeck 不保管用戶資產、不代替使用者進行交易，也不保證任何投資獲利。返傭條件可能依合作方規則調整，使用者應自行閱讀交易所條款並評估交易風險。</p>
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