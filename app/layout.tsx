import type { Metadata } from "next";
import { Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-tc",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://drayl-systems.cyy1399.chatgpt.site"),
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
  return (
    <html lang="zh-Hant-TW">
      <body className={`${inter.variable} ${notoSansTC.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
