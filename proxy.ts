import { NextRequest, NextResponse } from "next/server";

const LEGACY_LOCALE = /^\/(?:en|ja|ko|zh-cn|zh-tw)(?=\/|$)/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!LEGACY_LOCALE.test(pathname)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = pathname.replace(LEGACY_LOCALE, "") || "/";
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
