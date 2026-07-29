import type { MetadataRoute } from "next";
import { EXCHANGE_ORDER } from "@/config/exchanges";

const siteUrl = "https://drayl-systems.cyy1399.chatgpt.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/platforms", "/calculator", "/rebate", "/fees", "/faq", "/philosophy", "/contact"];
  const routes = [...staticRoutes, ...EXCHANGE_ORDER.map((exchange) => `/platform/${exchange}`)];

  return routes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : route === "/platforms" || route === "/calculator" ? 0.8 : 0.6,
  }));
}
