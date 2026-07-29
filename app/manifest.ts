import type { MetadataRoute } from "next";
import { siteDescription } from "@/config/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BiBeck",
    short_name: "BiBeck",
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#090909",
    theme_color: "#090909",
    lang: "zh-Hant-TW",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
