import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocaleCode, locales } from "@/config/locales";

const LOCALE_COOKIE = "bibeck.locale";
const PUBLIC_FILE = /\.[^/]+$/;

function preferredLocale(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value ?? null;
  if (isLocaleCode(saved)) return saved;
  const language = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (language.startsWith("zh-cn") || language.startsWith("zh-sg")) return "zh-CN";
  if (language.startsWith("ja")) return "ja";
  if (language.startsWith("ko")) return "ko";
  if (language.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || PUBLIC_FILE.test(pathname)) return NextResponse.next();
  if (/^\/(en|ja|ko|zh-cn)(?:\/|$)/.test(pathname)) return NextResponse.next();
  const locale = preferredLocale(request);
  if (locale === DEFAULT_LOCALE) return NextResponse.next();
  const slug = locales.find((item) => item.code === locale)?.slug;
  if (!slug) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/${slug}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
