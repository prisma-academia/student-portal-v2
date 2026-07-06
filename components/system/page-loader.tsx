import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 p-6",
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <div className="flex w-full max-w-sm flex-col gap-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
