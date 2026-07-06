"use client";

import {
  IconAlertCircle,
  IconCircleCheck,
  IconHelpCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyPayment } from "@/lib/api/student";

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const status = searchParams.get("status");
  const reference = searchParams.get("reference");

  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verified, setVerified] = useState(false);

  const isSuccess = status === "success";
  const isFailed = status === "failed";
  const hasParams = Boolean(status && reference);

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;
    setVerifying(true);
    setVerifyError("");

    verifyPayment(reference)
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          const body = res.data as { message?: string } | null;
          throw new Error(body?.message || res.message);
        }
        setVerified(true);
        queryClient.invalidateQueries({ queryKey: ["student", "fees"] });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setVerifyError(err.message || "Could not verify payment");
      })
      .finally(() => {
        if (!cancelled) setVerifying(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reference, queryClient]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment status</h1>
        <p className="text-muted-foreground text-sm">
          Result of your recent payment attempt.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction result</CardTitle>
          <CardDescription>
            {hasParams && reference ? `Reference: ${reference}` : "No reference provided"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
          {!hasParams && (
            <>
              <IconHelpCircle className="text-muted-foreground size-12" stroke={1.25} />
              <Alert>
                <AlertTitle>Invalid return link</AlertTitle>
                <AlertDescription>
                  This page expects payment status details from the gateway. Return to
                  fees and try again if you were paying a fee.
                </AlertDescription>
              </Alert>
              <Button asChild>
                <Link href="/school">Back to fees</Link>
              </Button>
            </>
          )}

          {hasParams && verifying && (
            <>
              <IconLoader2 className="text-muted-foreground size-10 animate-spin" />
              <p className="text-muted-foreground text-sm">Confirming your payment…</p>
            </>
          )}

          {hasParams && !verifying && isSuccess && (
            <>
              <IconCircleCheck className="size-12 text-green-600" stroke={1.25} />
              <div className="space-y-1">
                <p className="font-medium text-green-700 dark:text-green-400">
                  Payment successful
                </p>
                <p className="text-muted-foreground text-sm">
                  {verified
                    ? "Your payment has been recorded."
                    : "Payment was accepted by the gateway."}
                </p>
              </div>
              {verifyError && (
                <Alert variant="destructive">
                  <AlertDescription>{verifyError}</AlertDescription>
                </Alert>
              )}
              <Button asChild>
                <Link href="/school">Back to fees</Link>
              </Button>
            </>
          )}

          {hasParams && !verifying && isFailed && (
            <>
              <IconAlertCircle className="size-12 text-destructive" stroke={1.25} />
              <div className="space-y-1">
                <p className="text-destructive font-medium">Payment failed</p>
                <p className="text-muted-foreground text-sm">
                  The payment was not completed. You can try again from the fees page.
                </p>
              </div>
              {verifyError && (
                <Alert variant="destructive">
                  <AlertDescription>{verifyError}</AlertDescription>
                </Alert>
              )}
              <Button asChild variant="outline">
                <Link href="/school">Back to fees</Link>
              </Button>
            </>
          )}

          {hasParams && !verifying && !isSuccess && !isFailed && (
            <>
              <IconHelpCircle className="text-muted-foreground size-12" stroke={1.25} />
              <p className="font-medium">Unknown status</p>
              <p className="text-muted-foreground text-sm">Status: {status}</p>
              <Button asChild>
                <Link href="/school">Back to fees</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
