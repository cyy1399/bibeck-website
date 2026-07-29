import { createLocaleMetadata } from "@/config/i18n-seo";
import { localeFromSlug } from "@/config/locales";
import { getDictionary } from "@/messages";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { const locale = localeFromSlug((await params).locale); if (!locale) return {}; const d = getDictionary(locale); return createLocaleMetadata(locale, "/rebate", d["page.rebateTitle"], d["page.rebateDescription"]); }
export { default } from "../../rebate/page";
