import type { MetadataRoute } from "next";
import { getConfig } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  const { branding } = getConfig();
  return {
    name: branding.appName,
    short_name: branding.appName,
    description: `${branding.appName}: fees, results, course forms and school notices.`,
    start_url: "/",
    display: "standalone",
    background_color: branding.backgroundColor,
    theme_color: branding.themeColor,
    icons: [{ src: branding.logoUrl, sizes: "192x192", type: "image/png" }],
  };
}
