/**
 * All public env vars for the student portal. Throws if any required key is missing.
 * Map from DOCS.md VITE_* → NEXT_PUBLIC_* for Next.js.
 *
 * IMPORTANT: Each variable must be read as `process.env.NEXT_PUBLIC_*` literally.
 * Next.js only inlines public env for static property access; dynamic `process.env[key]`
 * is undefined in the browser bundle.
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

function normalize(raw: string | undefined, key: string): string {
  if (raw == null || String(raw).trim() === "") {
    throw new Error(
      `[config] Missing required env: ${key}. Copy .env.example to .env.local and set values.`,
    );
  }
  return stripQuotes(String(raw).trim());
}

function loadConfig() {
  // Static reads only — required for client-side inlining (BrandingTheme, shells, etc.)
  const raw = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_SHORT_NAME: process.env.NEXT_PUBLIC_APP_SHORT_NAME,
    NEXT_PUBLIC_PAGE_TITLE: process.env.NEXT_PUBLIC_PAGE_TITLE,
    NEXT_PUBLIC_LOGO_URL: process.env.NEXT_PUBLIC_LOGO_URL,
    NEXT_PUBLIC_LOGO_ALT: process.env.NEXT_PUBLIC_LOGO_ALT,
    NEXT_PUBLIC_FAVICON_PATH: process.env.NEXT_PUBLIC_FAVICON_PATH,
    NEXT_PUBLIC_PRIMARY_COLOR: process.env.NEXT_PUBLIC_PRIMARY_COLOR,
    NEXT_PUBLIC_THEME_COLOR: process.env.NEXT_PUBLIC_THEME_COLOR,
    NEXT_PUBLIC_MANIFEST_BG_COLOR: process.env.NEXT_PUBLIC_MANIFEST_BG_COLOR,
    NEXT_PUBLIC_AUTH_BACKGROUND_URL: process.env.NEXT_PUBLIC_AUTH_BACKGROUND_URL,
    NEXT_PUBLIC_AUTH_BACKGROUND_URL_DARK:
      process.env.NEXT_PUBLIC_AUTH_BACKGROUND_URL_DARK,
    NEXT_PUBLIC_FOOTER_TEXT: process.env.NEXT_PUBLIC_FOOTER_TEXT,
    NEXT_PUBLIC_CALENDAR_DEPARTMENT_BG:
      process.env.NEXT_PUBLIC_CALENDAR_DEPARTMENT_BG,
    NEXT_PUBLIC_CALENDAR_DEPARTMENT_HOVER:
      process.env.NEXT_PUBLIC_CALENDAR_DEPARTMENT_HOVER,
    NEXT_PUBLIC_CALENDAR_CLASS_BG: process.env.NEXT_PUBLIC_CALENDAR_CLASS_BG,
    NEXT_PUBLIC_CALENDAR_CLASS_HOVER:
      process.env.NEXT_PUBLIC_CALENDAR_CLASS_HOVER,
    NEXT_PUBLIC_CALENDAR_GENERAL_BG:
      process.env.NEXT_PUBLIC_CALENDAR_GENERAL_BG,
    NEXT_PUBLIC_CALENDAR_GENERAL_HOVER:
      process.env.NEXT_PUBLIC_CALENDAR_GENERAL_HOVER,
  } as const;

  const missing = (
    Object.entries(raw) as [keyof typeof raw, string | undefined][]
  )
    .filter(([, v]) => v == null || String(v).trim() === "")
    .map(([k]) => k);

  if (missing.length) {
    throw new Error(
      `[config] Missing required env: ${missing.join(", ")}. See .env.example.`,
    );
  }

  const primary = normalize(
    raw.NEXT_PUBLIC_PRIMARY_COLOR,
    "NEXT_PUBLIC_PRIMARY_COLOR",
  );
  if (!/^#[0-9A-Fa-f]{6}$/.test(primary)) {
    throw new Error(
      `[config] NEXT_PUBLIC_PRIMARY_COLOR must be 6-digit hex (e.g. #f44336), got: ${primary}`,
    );
  }

  const primaryPalette: Record<number, string> = {
    50: primary,
    100: primary,
    200: primary,
    300: primary,
    400: primary,
    500: primary,
    600: primary,
    700: primary,
    800: primary,
    900: primary,
  };

  return {
    baseUrl: normalize(
      raw.NEXT_PUBLIC_API_BASE_URL,
      "NEXT_PUBLIC_API_BASE_URL",
    ).replace(/\/$/, ""),
    branding: {
      appName: normalize(raw.NEXT_PUBLIC_APP_NAME, "NEXT_PUBLIC_APP_NAME"),
      appShortName: normalize(
        raw.NEXT_PUBLIC_APP_SHORT_NAME,
        "NEXT_PUBLIC_APP_SHORT_NAME",
      ),
      pageTitle: normalize(
        raw.NEXT_PUBLIC_PAGE_TITLE,
        "NEXT_PUBLIC_PAGE_TITLE",
      ),
      logoUrl: normalize(raw.NEXT_PUBLIC_LOGO_URL, "NEXT_PUBLIC_LOGO_URL"),
      logoAlt: normalize(raw.NEXT_PUBLIC_LOGO_ALT, "NEXT_PUBLIC_LOGO_ALT"),
      faviconPath: normalize(
        raw.NEXT_PUBLIC_FAVICON_PATH,
        "NEXT_PUBLIC_FAVICON_PATH",
      ),
      primaryColor: primary,
      primaryPalette,
      themeColor: normalize(
        raw.NEXT_PUBLIC_THEME_COLOR,
        "NEXT_PUBLIC_THEME_COLOR",
      ),
      backgroundColor: normalize(
        raw.NEXT_PUBLIC_MANIFEST_BG_COLOR,
        "NEXT_PUBLIC_MANIFEST_BG_COLOR",
      ),
      authBackgroundImageUrl: normalize(
        raw.NEXT_PUBLIC_AUTH_BACKGROUND_URL,
        "NEXT_PUBLIC_AUTH_BACKGROUND_URL",
      ),
      authBackgroundImageUrlDark: normalize(
        raw.NEXT_PUBLIC_AUTH_BACKGROUND_URL_DARK,
        "NEXT_PUBLIC_AUTH_BACKGROUND_URL_DARK",
      ),
      footerText: normalize(
        raw.NEXT_PUBLIC_FOOTER_TEXT,
        "NEXT_PUBLIC_FOOTER_TEXT",
      ),
      calendarCategoryColors: {
        department: {
          bg: normalize(
            raw.NEXT_PUBLIC_CALENDAR_DEPARTMENT_BG,
            "NEXT_PUBLIC_CALENDAR_DEPARTMENT_BG",
          ),
          hover: normalize(
            raw.NEXT_PUBLIC_CALENDAR_DEPARTMENT_HOVER,
            "NEXT_PUBLIC_CALENDAR_DEPARTMENT_HOVER",
          ),
        },
        class: {
          bg: normalize(
            raw.NEXT_PUBLIC_CALENDAR_CLASS_BG,
            "NEXT_PUBLIC_CALENDAR_CLASS_BG",
          ),
          hover: normalize(
            raw.NEXT_PUBLIC_CALENDAR_CLASS_HOVER,
            "NEXT_PUBLIC_CALENDAR_CLASS_HOVER",
          ),
        },
        general: {
          bg: normalize(
            raw.NEXT_PUBLIC_CALENDAR_GENERAL_BG,
            "NEXT_PUBLIC_CALENDAR_GENERAL_BG",
          ),
          hover: normalize(
            raw.NEXT_PUBLIC_CALENDAR_GENERAL_HOVER,
            "NEXT_PUBLIC_CALENDAR_GENERAL_HOVER",
          ),
        },
      },
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
