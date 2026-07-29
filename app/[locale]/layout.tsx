import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreferencesProvider } from "@/components/PreferencesProvider";
import { localeFromSlug, locales } from "@/config/locales";
import { createLocaleMetadata } from "@/config/i18n-seo";

export function generateStaticParams() {
  return locales.filter((locale) => locale.slug).map((locale) => ({ locale: locale.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: slug } = await params;
  const locale = localeFromSlug(slug);
  if (!locale || locale === "zh-TW") return {};
  return createLocaleMetadata(locale);
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: slug } = await params;
  const locale = localeFromSlug(slug);
  if (!locale || locale === "zh-TW") notFound();
  return <PreferencesProvider initialLocale={locale} localeFromRoute>{children}</PreferencesProvider>;
}
