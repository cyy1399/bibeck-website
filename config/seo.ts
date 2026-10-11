import type { Metadata } from "next";
import { brandConfig } from "@/config/brand";

export const siteTitle = "BiBeck";
export const siteDescription = "BiBeck 整理持續學習與實踐累積的理財、投資知識，以及可使用的工具與資源，讓理解成為行動。";
export const socialImage = {
  url: "/og-seo.png",
  width: 1200,
  height: 630,
  alt: "BiBeck",
} as const;

export function createPageMetadata({ title, description, path, absoluteTitle = false }: { title: string; description: string; path: `/${string}` | "/"; absoluteTitle?: boolean }): Metadata {
  const url = new URL(path, brandConfig.websiteUrl).toString();
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: brandConfig.name,
      locale: "zh_TW",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
  };
}
