import type { Metadata } from "next";
import { brandConfig } from "@/config/brand";

export const siteTitle = "交易成本計算器、交易所手續費比較與返傭｜BiBeck";
export const siteDescription = "BiBeck 提供交易成本計算、VIP 費率比較與 Bybit 返傭工具，幫助交易者看懂並降低每一筆交易成本。";
export const socialImage = {
  url: "/og-seo.png",
  width: 1200,
  height: 630,
  alt: "BiBeck｜降低每一筆交易成本",
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
