import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon,
  className,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-card flex flex-col items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="bg-primary-soft text-primary-ink mb-1 grid size-11 place-items-center rounded-full [&_svg]:size-5">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-[0.9375rem] font-bold">{title}</p>
      {description ? (
        <p className="text-muted-foreground max-w-xs text-sm">{description}</p>
      ) : null}
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
