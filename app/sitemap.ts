import type { MetadataRoute } from "next";
import { EXCHANGE_ORDER } from "@/config/exchanges";
import { brandConfig } from "@/config/brand";
import { locales } from "@/config/locales";
import { localizedAlternates } from "@/config/i18n-seo";

const siteUrl = brandConfig.websiteUrl;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/platforms", "/calculator", "/rebate", "/faq", "/contact", "/high-volume-application"];
  const routes = [...staticRoutes, ...EXCHANGE_ORDER.map((exchange) => `/platform/${exchange}`)];

  return routes.flatMap((route, index) => locales.map((locale) => ({
    url: `${siteUrl}${locale.slug ? `/${locale.slug}` : ""}${route}`,
    changeFrequency: index === 0 ? "weekly" as const : "monthly" as const,
    priority: index === 0 ? 1 : route === "/platforms" || route === "/calculator" ? 0.8 : 0.6,
    alternates: { languages: localizedAlternates(route || "/") },
  })));
}
