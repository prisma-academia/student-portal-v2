/**
 * Per-school settings. Only four values differ between schools; everything
 * else (titles, alt text, favicon, theme colour, palette) is derived from them.
 *
 * IMPORTANT: each variable must be read as `process.env.NEXT_PUBLIC_*`
 * literally. Next.js only inlines public env for static property access;
 * dynamic `process.env[key]` is undefined in the browser bundle.
 */

function stripQuotes(v: string): string {
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

function required(raw: string | undefined, key: string): string {
  if (raw == null || String(raw).trim() === "") {
    throw new Error(
      `[config] Missing required env: ${key}. Copy .env.example to .env.local and set it.`,
    );
  }
  return stripQuotes(String(raw).trim());
}

function loadConfig() {
  const apiBaseUrl = required(process.env.NEXT_PUBLIC_API_BASE_URL, "NEXT_PUBLIC_API_BASE_URL");
  const appName = required(process.env.NEXT_PUBLIC_APP_NAME, "NEXT_PUBLIC_APP_NAME");
  const logoUrl = required(process.env.NEXT_PUBLIC_LOGO_URL, "NEXT_PUBLIC_LOGO_URL");
  const primaryColor = required(process.env.NEXT_PUBLIC_PRIMARY_COLOR, "NEXT_PUBLIC_PRIMARY_COLOR");

  if (!/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
    throw new Error(
      `[config] NEXT_PUBLIC_PRIMARY_COLOR must be 6-digit hex (e.g. #f44336), got: ${primaryColor}`,
    );
  }

  return {
    baseUrl: apiBaseUrl.replace(/\/$/, ""),
    branding: {
      appName,
      logoUrl,
      logoAlt: `${appName} logo`,
      primaryColor,
      /** Browser chrome / PWA colour: the school colour. */
      themeColor: primaryColor,
      /** PWA splash background: the portal's paper colour. */
      backgroundColor: "#faf7f2",
    },
  } as const;
}

export type AppConfig = ReturnType<typeof loadConfig>;

let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cached) {
    cached = loadConfig();
  }
  return cached;
}

/** Resolve student picture path relative to API base */
export function resolveAssetUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const { baseUrl } = getConfig();
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}
