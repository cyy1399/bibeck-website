import type { MetadataRoute } from "next";
import { brandConfig } from "@/config/brand";

const siteUrl = brandConfig.websiteUrl;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/search"],
    },
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
