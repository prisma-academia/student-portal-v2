import {
  IconAlertTriangle,
  IconCircleCheckFilled,
  IconClockHour4,
  IconCircleXFilled,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type Tone = "success" | "warning" | "danger" | "neutral";

const TONES: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-[color-mix(in_oklch,var(--warning)_75%,black)] dark:text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-muted text-muted-foreground",
};

const ICONS = {
  success: IconCircleCheckFilled,
  warning: IconClockHour4,
  danger: IconAlertTriangle,
  neutral: IconCircleXFilled,
} as const;

/** Status with an icon and words, never colour alone. */
export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = ICONS[tone];
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full pr-2.5 pl-1.5 text-xs font-semibold",
        TONES[tone],
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {children}
    </span>
  );
}
