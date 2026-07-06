import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}
