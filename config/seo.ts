import type { Metadata } from "next";
import { brandConfig } from "@/config/brand";

export const siteTitle = "把你付出去的交易手續費拿回 35%｜BiBeck";
export const siteDescription = "輸入交易量，計算 Bybit 手續費、VIP 成本、BiBeck 35% 標準返傭與實際有效交易成本。";
export const socialImage = {
  url: "/og-seo.png",
  width: 1200,
  height: 630,
  alt: "BiBeck｜交易成本計算、VIP 費率與 35% 標準返傭",
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
