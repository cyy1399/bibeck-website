import type { Metadata } from "next";
import { brandConfig } from "@/config/brand";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(brandConfig.websiteUrl),
  title: {
    default: "BiBeck｜交易成本優化與手續費返傭平台",
    template: "%s | BiBeck",
  },
  description:
    "BiBeck 透過透明的手續費資訊、返傭服務與交易成本工具，幫助交易者降低長期交易支出。",
  keywords: [
    "BiBeck",
    "trading fees",
    "Bybit rebate",
    "fee calculator",
    "maker fee",
    "taker fee",
    "funding fee",
    "Binance 手續費",
    "BingX 手續費",
    "Bitget 手續費",
    "OKX 手續費",
    "交易所費率比較",
    "返傭",
    "交易手續費",
    "手續費計算器",
  ],
  authors: [{ name: "BiBeck" }],
  creator: "BiBeck",
  publisher: "BiBeck",
  openGraph: {
    title: "BiBeck｜降低每一筆交易成本",
    description: "交易成本優化與手續費返傭平台",
    siteName: "BiBeck",
    locale: "zh_TW",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "BiBeck 交易成本優化與手續費返傭平台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BiBeck｜降低每一筆交易成本",
    description: "交易成本優化與手續費返傭平台",
    images: ["/og.png"],
  },
  icons: {
    icon: "/bibeck-icon.jpg",
    shortcut: "/bibeck-icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BiBeck",
    url: brandConfig.websiteUrl,
    inLanguage: "zh-Hant-TW",
    description: "交易成本優化與手續費返傭平台",
    publisher: {
      "@type": "Organization",
      name: "BiBeck",
      url: brandConfig.websiteUrl,
      email: brandConfig.publicEmails.contact,
    },
  };

  return (
    <html lang="zh-Hant-TW">
      <body className="antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
