import type { Metadata } from "next";
import { brandConfig } from "./brand.ts";
import { locales, localeFromSlug, type LocaleCode } from "./locales.ts";
import { getDictionary } from "../messages/index.ts";

export function localizedAlternates(path: string) {
  const normalized = path === "/" ? "" : path;
  return Object.fromEntries([
    ...locales.map((locale) => [locale.htmlLang, `${brandConfig.websiteUrl}${locale.slug ? `/${locale.slug}` : ""}${normalized}`]),
    ["x-default", `${brandConfig.websiteUrl}${normalized}`],
  ]);
}

export function createLocaleMetadata(locale: LocaleCode, path = "/", pageTitle?: string, pageDescription?: string): Metadata {
  const dictionary = getDictionary(locale);
  const localeDefinition = locales.find((item) => item.code === locale) ?? locales[0];
  const localizedPath = `${localeDefinition.slug ? `/${localeDefinition.slug}` : ""}${path === "/" ? "" : path}` || "/";
  const title = pageTitle ?? dictionary["seo.siteTitle"];
  const description = pageDescription ?? dictionary["seo.siteDescription"];
  return {
    title,
    description,
    alternates: { canonical: localizedPath, languages: localizedAlternates(path) },
    openGraph: { title, description, url: localizedPath, locale: localeDefinition.openGraphLocale, type: "website", siteName: "BiBeck" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function requireLocale(slug: string): LocaleCode {
  const locale = localeFromSlug(slug);
  if (!locale || locale === "zh-TW") throw new Error(`Unsupported locale route: ${slug}`);
  return locale;
}

export function createExchangeLocaleMetadata(locale: LocaleCode, exchange: string): Metadata {
  const dictionary = getDictionary(locale);
  return createLocaleMetadata(locale, `/platform/${exchange.toLowerCase()}`, `${exchange} | ${dictionary["calculator.title"]}`, `${exchange}: ${dictionary["page.platformsDescription"]}`);
}
