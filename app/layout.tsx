import type { Metadata, Viewport } from "next";
import { brandConfig } from "@/config/brand";
import { siteDescription, siteTitle, socialImage } from "@/config/seo";
import "./globals.css";
import { PreferencesProvider } from "@/components/PreferencesProvider";

export const metadata: Metadata = {
  metadataBase: new URL(brandConfig.websiteUrl),
  title: {
    default: siteTitle,
    template: "%s｜BiBeck",
  },
  description: siteDescription,
  authors: [{ name: "BiBeck" }],
  creator: "BiBeck",
  publisher: "BiBeck",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: brandConfig.websiteUrl,
    siteName: "BiBeck",
    locale: "zh_TW",
    type: "website",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage.url],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#090909",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${brandConfig.websiteUrl}/#organization`,
        name: brandConfig.name,
        url: brandConfig.websiteUrl,
        logo: `${brandConfig.websiteUrl}/logo.png`,
        email: brandConfig.publicEmails.contact,
      },
      {
        "@type": "WebSite",
        "@id": `${brandConfig.websiteUrl}/#website`,
        name: brandConfig.name,
        url: brandConfig.websiteUrl,
        description: siteDescription,
        inLanguage: "zh-TW",
        publisher: { "@id": `${brandConfig.websiteUrl}/#organization` },
      },
    ],
  };

  return (
    <html lang="zh-TW">
      <body className="antialiased">
        <PreferencesProvider>{children}</PreferencesProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
