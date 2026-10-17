"use client";

import { IconChevronRight, IconCreditCard, IconReceipt } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { PdfButton } from "@/components/system/pdf-button";
import { ResponsiveSheet } from "@/components/system/responsive-sheet";
import { StatusPill } from "@/components/system/status-pill";
import { Button } from "@/components/ui/button";
import { initializePayment, pdfPaths } from "@/lib/api/student";
import { formatDate, formatNaira, formatRelative } from "@/lib/format";
import { isOverdue } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { Fee } from "@/types/student";

/**
 * Start a Paystack checkout for a fee and hand the browser to the gateway.
 * `busy` stays true after the API answers, while Paystack loads, so the
 * button doesn't fall back to idle mid-redirect.
 */
export function usePayFee() {
  const m = useMutation({
    mutationFn: async (feeId: string) => {
      const res = await initializePayment(feeId);
      if (!res.ok) throw new Error(res.message);
      const url = res.data?.authorizationUrl;
      if (!url) throw new Error("The payment gateway didn't return a checkout link. Try again.");
      return url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const { reset } = m;
  useEffect(() => {
    // Back from Paystack restores this page from the back/forward cache: un-stick the button.
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) reset();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [reset]);
  return { ...m, busy: m.isPending || m.isSuccess };
}

export function feeStatus(fee: Fee) {
  if (fee.isPaid) return { tone: "success" as const, label: "Paid" };
  if (isOverdue(fee)) return { tone: "danger" as const, label: "Overdue" };
  return { tone: "warning" as const, label: "Due" };
}

function feeMeta(fee: Fee) {
  return [fee.feeType, fee.session?.name, fee.semester].filter(Boolean).join(" · ");
}

/** One fee as a statement row: what it is, when, how much, and its state. */
export function FeeRow({ fee, onOpen }: { fee: Fee; onOpen: (fee: Fee) => void }) {
  const status = feeStatus(fee);
  const when = fee.isPaid
    ? `Paid ${formatDate(fee.userPayment?.createdAt)}`
    : `Due ${formatDate(fee.dueDate)}`;
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(fee)}
        className="hover:bg-muted/60 focus-visible:bg-muted/60 flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors sm:px-5"
      >
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-semibold leading-snug">{fee.name}</p>
          {/* The list is already one session; keep the type and term, never cut the date. */}
          <p className="text-muted-foreground mt-0.5 truncate text-sm">
            {[fee.feeType, fee.semester].filter(Boolean).join(" · ")}
          </p>
          <p className={cn("mt-0.5 text-sm font-medium", isOverdue(fee) ? "text-danger" : "text-muted-foreground")}>{when}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="num text-[0.9375rem] font-bold">{formatNaira(fee.amount)}</span>
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
        </div>
        <IconChevronRight className="text-muted-foreground/60 size-4 shrink-0" aria-hidden />
      </button>
    </li>
  );
}

/** Fee detail: line items, total, due date, and the one action that applies. */
export function FeeSheet({
  fee,
  onOpenChange,
}: {
  fee: Fee | null;
  onOpenChange: (open: boolean) => void;
}) {
  const pay = usePayFee();
  const status = fee ? feeStatus(fee) : null;
  const items = fee?.items?.filter((i) => i.name) ?? [];

  return (
    <ResponsiveSheet
      open={!!fee}
      onOpenChange={onOpenChange}
      title={fee?.name ?? "Fee"}
      description={fee ? feeMeta(fee) || undefined : undefined}
      footer={
        fee ? (
          fee.isPaid ? (
            fee.userPayment?._id ? (
              <PdfButton
                size="lg"
                className="w-full sm:w-auto"
                endpoint={pdfPaths.receipt(fee.userPayment._id)}
                filename={`receipt-${fee.userPayment.reference ?? fee._id}`}
                icon={<IconReceipt />}
                title={`Receipt · ${fee.name}`}
              >
                View receipt
              </PdfButton>
            ) : (
              <p className="text-muted-foreground text-sm">The receipt isn&apos;t available yet. Check back shortly.</p>
            )
          ) : (
            <Button
              size="lg"
              className="w-full sm:w-auto"
              loading={pay.busy}
              onClick={() => pay.mutate(fee._id)}
            >
              <IconCreditCard />
              {pay.busy ? "Opening Paystack…" : `Pay ${formatNaira(fee.amount)}`}
            </Button>
          )
        ) : null
      }
    >
      {fee && status ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm">{fee.isPaid ? "Amount paid" : "Amount due"}</p>
              <p className="num text-3xl font-extrabold">
                {formatNaira(fee.isPaid ? (fee.userPayment?.amount ?? fee.amount) : fee.amount)}
              </p>
            </div>
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/60 rounded-[var(--radius-md)] p-3">
              <dt className="text-muted-foreground">{fee.isPaid ? "Paid on" : "Due date"}</dt>
              <dd className="mt-0.5 font-semibold">
                {fee.isPaid ? formatDate(fee.userPayment?.createdAt) : formatDate(fee.dueDate)}
              </dd>
            </div>
            <div className="bg-muted/60 rounded-[var(--radius-md)] p-3">
              <dt className="text-muted-foreground">{fee.isPaid ? "Reference" : "Time left"}</dt>
              <dd className={cn("mt-0.5 truncate font-semibold", fee.isPaid && "num text-[0.8125rem]")}>
                {fee.isPaid ? (fee.userPayment?.reference ?? "—") : formatRelative(fee.dueDate) || "—"}
              </dd>
            </div>
          </dl>

          {items.length ? (
            <div>
              <p className="mb-2 text-sm font-semibold">What this covers</p>
              <ul className="divide-y rounded-[var(--radius-md)] border">
                {items.map((it, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3 px-3 py-2.5 text-sm">
                    <span className="min-w-0">
                      {it.name}
                      {(it.quantity ?? 1) > 1 ? (
                        <span className="text-muted-foreground"> × {it.quantity}</span>
                      ) : null}
                    </span>
                    <span className="num shrink-0 font-semibold">
                      {formatNaira((it.price ?? 0) * (it.quantity ?? 1))}
                    </span>
                  </li>
                ))}
                <li className="flex items-baseline justify-between gap-3 px-3 py-2.5 text-sm font-bold">
                  <span>Total</span>
                  <span className="num">{formatNaira(fee.amount)}</span>
                </li>
              </ul>
            </div>
          ) : null}

          {fee.description ? <p className="text-muted-foreground text-sm">{fee.description}</p> : null}
          {!fee.isPaid ? (
            <p className="text-muted-foreground text-xs">
              You&apos;ll pay securely on Paystack, then come back here to see your receipt.
            </p>
          ) : null}
        </div>
      ) : null}
    </ResponsiveSheet>
  );
}
