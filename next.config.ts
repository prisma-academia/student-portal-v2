import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const appDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: appDir,
  },
};

export default nextConfig;
