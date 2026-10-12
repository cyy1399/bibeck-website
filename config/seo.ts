import type { Metadata } from "next";
import { brandConfig } from "@/config/brand";

export const siteTitle = "BiBeck";
export const siteDescription = "BiBeck 是加密貨幣合約交易者的工作平台。規劃風險與成本、整理交易紀錄、檢討績效，建立可驗證的交易流程。";
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
