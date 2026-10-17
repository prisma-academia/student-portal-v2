import { cn } from "@/lib/utils";

/**
 * Slow drifting gradient mesh in the tenant's primary hue. Pure CSS
 * (transform-only keyframes in globals.css), so it costs almost nothing on
 * low-end phones and stops under prefers-reduced-motion.
 */
export function GradientMesh({ className }: { className?: string }) {
  return (
    <div className={cn("mesh", className)} aria-hidden>
      <span className="mesh__blob mesh__blob--a" />
      <span className="mesh__blob mesh__blob--b" />
      <span className="mesh__blob mesh__blob--c" />
      <span className="mesh__grain" />
    </div>
  );
}
