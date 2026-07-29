import { createLocaleMetadata } from "@/config/i18n-seo";
import { localeFromSlug } from "@/config/locales";
import { getDictionary } from "@/messages";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { const locale = localeFromSlug((await params).locale); if (!locale) return {}; const d = getDictionary(locale); return createLocaleMetadata(locale, "/", d["seo.siteTitle"], d["seo.siteDescription"]); }
export { default } from "../page";
