"use client";

import { IconCircleCheck, IconCreditCard, IconLoader2, IconReceipt2 } from "@tabler/icons-react";
import { useState } from "react";
import { FeeRow, FeeSheet, usePayFee } from "@/components/payments/fee-parts";
import { EmptyState } from "@/components/system/empty-state";
import { PageHeader, SectionHeading } from "@/components/system/page-header";
import { ListSkeleton } from "@/components/system/page-loader";
import { rowList } from "@/components/system/row-list";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate, formatNaira } from "@/lib/format";
import { splitFees, useFees } from "@/lib/queries";
import type { Fee } from "@/types/student";

function Statement({ fees }: { fees: Fee[] }) {
  const { outstanding, paid, owed, settled } = splitFees(fees);
  const next = outstanding[0];
  const pay = usePayFee();

  if (!outstanding.length) {
    return (
      <section className="bg-success-soft/70 flex items-start gap-3 rounded-[1.25rem] border border-[color-mix(in_oklch,var(--success)_20%,transparent)] p-5">
        <IconCircleCheck className="text-success mt-0.5 size-6 shrink-0" aria-hidden />
        <div>
          <p className="font-display text-lg font-bold">You&apos;re all paid up.</p>
          <p className="text-muted-foreground text-sm">
            {paid.length
              ? `${formatNaira(settled)} paid across ${paid.length} ${paid.length === 1 ? "fee" : "fees"}. Receipts are below.`
              : "No fees have been assigned to you yet."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card rounded-[1.25rem] border p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <p className="font-display text-xl leading-snug font-bold sm:text-2xl">
        You owe <span className="num text-primary-ink">{formatNaira(owed)}</span>
        <span className="text-muted-foreground font-semibold">
          {" "}across {outstanding.length} {outstanding.length === 1 ? "fee" : "fees"}.
        </span>
      </p>
      {next ? (
        <p className="text-muted-foreground mt-1 text-sm">
          Next due: {next.name} · {formatDate(next.dueDate)}
        </p>
      ) : null}
      {next ? (
        <Button
          size="lg"
          className="mt-4 w-full sm:w-auto"
          disabled={pay.isPending}
          onClick={() => pay.mutate(next._id)}
        >
          {pay.isPending ? <IconLoader2 className="animate-spin" /> : <IconCreditCard />}
          {pay.isPending ? "Opening Paystack…" : `Pay ${formatNaira(next.amount)} now`}
        </Button>
      ) : null}
      {paid.length ? (
        <p className="text-muted-foreground mt-4 border-t pt-3 text-sm">
          Paid so far: <span className="num text-foreground font-semibold">{formatNaira(settled)}</span> ·{" "}
          {paid.length} {paid.length === 1 ? "receipt" : "receipts"}
        </p>
      ) : null}
    </section>
  );
}

export default function PaymentsPage() {
  const q = useFees();
  const [open, setOpen] = useState<Fee | null>(null);
  const { outstanding, paid } = splitFees(q.data);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payments" description="Your fees for this session, what's due, and your receipts." />

      {q.isPending ? (
        <>
          <Skeleton className="h-36 w-full rounded-[1.25rem]" />
          <ListSkeleton rows={4} />
        </>
      ) : q.isError ? (
        <QueryErrorPanel message={q.error.message} onRetry={() => q.refetch()} />
      ) : !q.data?.length ? (
        <EmptyState
          icon={<IconReceipt2 />}
          title="No fees yet"
          description="When the bursary assigns fees to your programme, they'll appear here with a Pay button."
        />
      ) : (
        <>
          <Statement fees={q.data} />

          {outstanding.length ? (
            <section aria-labelledby="to-pay">
              <SectionHeading title={<span id="to-pay">To pay</span>} />
              <ul className={rowList}>
                {outstanding.map((fee) => (
                  <FeeRow key={fee._id} fee={fee} onOpen={setOpen} />
                ))}
              </ul>
            </section>
          ) : null}

          {paid.length ? (
            <section aria-labelledby="paid">
              <SectionHeading title={<span id="paid">Paid</span>} />
              <ul className={rowList}>
                {paid.map((fee) => (
                  <FeeRow key={fee._id} fee={fee} onOpen={setOpen} />
                ))}
              </ul>
              <p className="text-muted-foreground mt-2 text-sm">Tap a paid fee to download its receipt.</p>
            </section>
          ) : null}
        </>
      )}

      <FeeSheet fee={open} onOpenChange={(o) => !o && setOpen(null)} />
    </div>
  );
}
