import type { Metadata } from "next";
import { brandConfig } from "@/config/brand";

export const siteTitle = "BiBeck｜交易成本計算器、交易所手續費比較與返傭平台";
export const siteDescription = "BiBeck 提供交易成本計算器、交易所手續費比較與返傭服務，協助交易者降低長期交易成本，支援 Bybit、Binance、OKX、Bitget 等交易所。";
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
