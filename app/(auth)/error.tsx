"use client";

import { IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[auth route error]", error.message, error.digest);
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We could not load this screen. You can try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={reset} className="gap-2">
            <IconRefresh className="size-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
