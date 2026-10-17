"use client";

import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClockHour4,
  IconHelpCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { BrandLoader } from "@/components/system/brand-loader";
import { Button } from "@/components/ui/button";
import { verifyPayment } from "@/lib/api/student";
import { qk } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Outcome = "checking" | "success" | "failed" | "pending" | "invalid";

/** Paystack can take a moment to settle: re-verify a few times before giving up. */
const RETRY_DELAYS = [0, 3000, 6000, 10000];

function readStatus(data: unknown): string | undefined {
  const d = data as { data?: { status?: string }; status?: string } | null;
  return (d?.data?.status ?? d?.status)?.toString().toLowerCase();
}

function StatusView() {
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const gatewayStatus = params.get("status");
  const reference = params.get("reference");
  const [outcome, setOutcome] = useState<Outcome>(reference ? "checking" : "invalid");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;

    (async () => {
      for (const delay of RETRY_DELAYS) {
        if (delay) await new Promise((r) => setTimeout(r, delay));
        if (cancelled) return;
        const res = await verifyPayment(reference);
        if (cancelled) return;
        // The API answers 200 only when Completed; pending/failed come back as
        // 400 with a message ("Payment is still pending…" / "…failed…").
        const status = res.ok ? readStatus(res.data) : undefined;
        if (res.ok && (status === undefined || status === "completed" || status === "success")) {
          setOutcome("success");
          queryClient.invalidateQueries({ queryKey: qk.fees });
          return;
        }
        if (status === "failed" || status === "abandoned" || /fail/i.test(res.message)) {
          setOutcome("failed");
          queryClient.invalidateQueries({ queryKey: qk.fees });
          return;
        }
        if (!/pending/i.test(res.message)) setNote(res.message);
      }
      // Verification never settled: fall back to what the gateway told us.
      setOutcome(gatewayStatus === "success" ? "success" : gatewayStatus === "failed" ? "failed" : "pending");
      queryClient.invalidateQueries({ queryKey: qk.fees });
    })();

    return () => {
      cancelled = true;
    };
  }, [reference, gatewayStatus, queryClient]);

  const views: Record<Outcome, { icon: ReactNode; tone: string; title: string; body: string; actions: ReactNode }> = {
    checking: {
      icon: <IconLoader2 className="size-9 animate-spin" />,
      tone: "bg-muted text-foreground/70",
      title: "Confirming your payment",
      body: "Checking with Paystack. This usually takes a few seconds. Please don't close this page.",
      actions: null,
    },
    success: {
      icon: <IconCircleCheck className="size-9" />,
      tone: "bg-success-soft text-success",
      title: "Payment received",
      body: "Your payment has been recorded. Your receipt is ready on the Payments page.",
      actions: (
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/payments">See receipt</Link>
        </Button>
      ),
    },
    failed: {
      icon: <IconAlertTriangle className="size-9" />,
      tone: "bg-danger-soft text-danger",
      title: "Payment didn't go through",
      body: "No money was taken for this attempt. You can try again from Payments.",
      actions: (
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/payments">Try again</Link>
        </Button>
      ),
    },
    pending: {
      icon: <IconClockHour4 className="size-9" />,
      tone: "bg-warning-soft text-[color-mix(in_oklch,var(--warning)_75%,black)] dark:text-warning",
      title: "Payment is still processing",
      body: "Paystack hasn't confirmed it yet. Check Payments in a few minutes. Don't pay again until it shows as paid or failed.",
      actions: (
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
          <Link href="/payments">Go to Payments</Link>
        </Button>
      ),
    },
    invalid: {
      icon: <IconHelpCircle className="size-9" />,
      tone: "bg-muted text-foreground/70",
      title: "No payment to show",
      body: "This page opens after you pay on Paystack. To pay a fee, start from Payments.",
      actions: (
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/payments">Go to Payments</Link>
        </Button>
      ),
    },
  };

  const v = views[outcome];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
      <motion.section
        key={outcome}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card flex flex-col items-center rounded-[1.5rem] border px-6 py-8 text-center shadow-[var(--shadow-soft)]"
        aria-live="polite"
      >
        <motion.span
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className={cn("grid size-[4.5rem] place-items-center rounded-full", v.tone)}
          aria-hidden
        >
          {v.icon}
        </motion.span>
        <h1 className="mt-5 text-2xl font-extrabold">{v.title}</h1>
        <p className="text-muted-foreground mt-2 text-[0.9375rem]">{v.body}</p>
        {reference ? (
          <p className="text-muted-foreground mt-4 text-sm">
            Reference <span className="num text-foreground font-semibold break-all">{reference}</span>
          </p>
        ) : null}
        {note && outcome !== "success" ? <p className="text-muted-foreground mt-2 text-xs">{note}</p> : null}
        {v.actions ? <div className="mt-6 w-full sm:w-auto">{v.actions}</div> : null}
      </motion.section>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<BrandLoader label="Confirming your payment" />}>
      <StatusView />
    </Suspense>
  );
}
