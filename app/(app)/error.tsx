"use client";

import { IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[app route error]", error.message, error.digest);
    }
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-start gap-4 p-1">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTitle>This page failed to load</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message || "An unexpected error occurred."}
        </AlertDescription>
      </Alert>
      <Button type="button" variant="outline" size="sm" onClick={reset}>
        <IconRefresh className="size-4" />
        Try again
      </Button>
    </div>
  );
}
