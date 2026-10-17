"use client";

import { IconHome } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect } from "react";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import { Button } from "@/components/ui/button";

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
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 py-6">
      <QueryErrorPanel
        message={error.message || "This page hit an unexpected problem."}
        onRetry={reset}
      />
      <Button asChild variant="ghost" className="self-start">
        <Link href="/">
          <IconHome />
          Back to home
        </Link>
      </Button>
    </div>
  );
}
