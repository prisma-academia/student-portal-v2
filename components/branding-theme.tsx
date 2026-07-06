"use client";

import { useLayoutEffect } from "react";
import { getConfig } from "@/lib/config";

/** Applies NEXT_PUBLIC_PRIMARY_COLOR to CSS --primary for Tailwind tokens. */
export function BrandingTheme() {
  useLayoutEffect(() => {
    const { primaryColor } = getConfig().branding;
    document.documentElement.style.setProperty("--primary", primaryColor);
    document.documentElement.style.setProperty(
      "--sidebar-primary",
      primaryColor,
    );
  }, []);
  return null;
}
