"use client";

import { useEffect, useState } from "react";
import { SchoolLogo } from "@/components/brand/school-logo";
import { cn } from "@/lib/utils";

const CAPTIONS = ["Loading your portal", "Fetching your records", "Almost there"];

/**
 * Global loader: the school logo inside a rotating conic ring with a breathing
 * halo. `fullscreen` covers the viewport (auth hydration, first load); inline
 * fills its container (route transitions).
 */
export function BrandLoader({
  fullscreen = false,
  label,
  className,
}: {
  fullscreen?: boolean;
  label?: string;
  className?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (label) return;
    const t = setInterval(() => setI((n) => (n + 1) % CAPTIONS.length), 1800);
    return () => clearInterval(t);
  }, [label]);

  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={cn(
        "flex flex-col items-center justify-center gap-5",
        fullscreen ? "bg-background fixed inset-0 z-[60]" : "min-h-[50vh] flex-1 py-12",
        className,
      )}
    >
      <div className="relative size-20">
        <span className="brand-halo" aria-hidden />
        <span className="brand-ring" aria-hidden />
        <div className="bg-card absolute inset-[7px] grid place-items-center rounded-full shadow-[var(--shadow-soft)]">
          <SchoolLogo className="size-10 text-lg" />
        </div>
      </div>
      {/* Rotating captions are visual only; the status label above stays stable for screen readers. */}
      <p className="text-muted-foreground text-sm font-medium" aria-hidden>
        {label ?? CAPTIONS[i]}
      </p>
    </div>
  );
}
