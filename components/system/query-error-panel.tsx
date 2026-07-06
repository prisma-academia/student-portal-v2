import { IconRefresh } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function QueryErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive" className="max-w-lg">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{message}</span>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <IconRefresh className="size-3.5" />
            Retry
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
