"use client";

import { useState } from "react";
import { getConfig } from "@/lib/config";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The tenant's logo from env, falling back to a monogram in the school colour
 * if the image is missing or fails to load (so a bad URL never shows alt text).
 */
export function SchoolLogo({ className }: { className?: string }) {
  const { branding } = getConfig();
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={branding.logoAlt}
        className={cn(
          "bg-primary text-primary-foreground grid aspect-square shrink-0 place-items-center rounded-[28%] font-display text-[0.8em] font-extrabold",
          className,
        )}
      >
        {initials(branding.appName)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tenant logo URL comes from env at runtime
    <img
      src={branding.logoUrl}
      alt={branding.logoAlt}
      onError={() => setFailed(true)}
      className={cn("aspect-square shrink-0 object-contain", className)}
    />
  );
}
