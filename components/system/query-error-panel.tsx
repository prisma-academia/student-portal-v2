import { IconCloudOff, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

/** A failed load: what happened and the way out, in the interface's voice. */
export function QueryErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="bg-danger-soft/60 flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[color-mix(in_oklch,var(--destructive)_25%,transparent)] p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <IconCloudOff className="text-danger mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="text-sm font-semibold">Couldn&apos;t load this</p>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry} className="self-start sm:self-auto">
          <IconRefresh />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
