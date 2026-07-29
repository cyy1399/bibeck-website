import { createExchangeLocaleMetadata } from "@/config/i18n-seo"; import { localeFromSlug } from "@/config/locales";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { const locale = localeFromSlug((await params).locale); return locale ? createExchangeLocaleMetadata(locale, "Binance") : {}; }
export { default } from "../../../platform/binance/page";
