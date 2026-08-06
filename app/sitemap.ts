import type { MetadataRoute } from "next";
import { brandConfig } from "@/config/brand";

const publicRoutes = [
  "", "/platforms", "/calculator", "/rebate", "/faq", "/contact",
  "/platform/bybit", "/privacy", "/terms", "/affiliate-disclosure", "/personal-data-notice",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route, index) => ({
    url: `${brandConfig.websiteUrl}${route}`,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : route === "/calculator" || route === "/platform/bybit" ? 0.8 : 0.6,
  }));
}
