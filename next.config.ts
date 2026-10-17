import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const appDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Lets a preview build sit beside a running server (NEXT_DIST_DIR=.next-preview).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  turbopack: {
    root: appDir,
  },
  // Old routes from the previous menu, kept alive for bookmarks and shared links.
  async redirects() {
    return [
      {
        source: "/school",
        has: [{ type: "query", key: "tab", value: "payment" }],
        destination: "/payments",
        permanent: false,
      },
      {
        source: "/school",
        has: [{ type: "query", key: "tab", value: "session" }],
        destination: "/academics?tab=forms",
        permanent: false,
      },
      { source: "/school", destination: "/academics", permanent: false },
      { source: "/resource", destination: "/resources", permanent: false },
    ];
  },
};

export default nextConfig;
