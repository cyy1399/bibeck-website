import type { MetadataRoute } from "next";

const siteUrl = "https://drayl-systems.cyy1399.chatgpt.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
