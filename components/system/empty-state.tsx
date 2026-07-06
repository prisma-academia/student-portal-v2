import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="text-muted-foreground max-w-xs text-xs">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
