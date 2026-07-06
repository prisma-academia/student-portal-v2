import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Skeleton className="mx-auto h-10 w-32" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full max-w-[120px]" />
        </CardContent>
      </Card>
    </div>
  );
}
