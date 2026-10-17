import type { Metadata, Viewport } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { getConfig } from "@/lib/config";
import { foregroundOn } from "@/lib/color";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const { branding } = getConfig();

export const metadata: Metadata = {
  title: {
    default: branding.appName,
    template: `%s · ${branding.appName}`,
  },
  description: `${branding.appName}: fees, results, course forms and school notices.`,
  applicationName: branding.appName,
  icons: { icon: branding.logoUrl, apple: branding.logoUrl },
};

export const viewport: Viewport = {
  themeColor: branding.themeColor,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before paint so a saved dark/light choice never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brandStyle = {
    "--primary": branding.primaryColor,
    "--primary-foreground": foregroundOn(branding.primaryColor),
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={brandStyle}
      className={cn("h-full antialiased", body.variable, display.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
