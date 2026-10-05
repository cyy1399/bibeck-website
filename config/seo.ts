import type { Metadata } from "next";
import { brandConfig } from "@/config/brand";

export const siteTitle = "把金錢變成可以持續升級的系統｜BiBeck";
export const siteDescription = "BiBeck 以 Money OS 為核心，將日常財務紀錄轉成分析、等級、財務階段與下一步任務，並保留投資、加密資產、交易成本與 Bybit 工具。";
export const socialImage = {
  url: "/og-seo.png",
  width: 1200,
  height: 630,
  alt: "BiBeck｜把金錢變成可以持續升級的系統",
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
