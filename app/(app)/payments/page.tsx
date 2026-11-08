"use client";

import { IconAlertTriangle, IconCircleCheck, IconCreditCard, IconReceipt2 } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { FeeRow, FeeSheet, isArrearsFee, usePayFee } from "@/components/payments/fee-parts";
import { EmptyState } from "@/components/system/empty-state";
import { PageHeader } from "@/components/system/page-header";
import { ListSkeleton } from "@/components/system/page-loader";
import { rowList } from "@/components/system/row-list";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  currentSessionName,
  groupFeesBySession,
  placementLabel,
  type FeeGroup,
} from "@/lib/fee-statement";
import { formatDate, formatNaira } from "@/lib/format";
import { splitFees, useFeeStatement, useStudent } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { Fee, FeeStatement } from "@/types/student";

/** "current" (this session plus fees with no session), "all", or a session id. */
type View = string;

/** Unpaid fees from earlier sessions: the amount, and the one action that clears them. */
function ArrearsCallout({
  statement,
  onOpen,
  onShowAll,
}: {
  statement: FeeStatement;
  onOpen: (fee: Fee) => void;
  onShowAll?: () => void;
}) {
  const pay = usePayFee();
  const arrears = useMemo(
    () =>
      statement.fees
        .filter(isArrearsFee)
        .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime()),
    [statement.fees],
  );
  const amount = statement.summary.totals.arrears;
  if (!(amount > 0) || !arrears.length) return null;

  const oldest = arrears[0];
  const sessions = [...new Set(arrears.map((f) => f.session?.name).filter(Boolean))];

  return (
    <section
      aria-labelledby="arrears-title"
      className="bg-danger-soft/60 rounded-[var(--radius-xl)] border border-[color-mix(in_oklch,var(--destructive)_22%,transparent)] p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <IconAlertTriangle className="text-danger mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p id="arrears-title" className="font-display text-lg leading-snug font-bold">
            <span className="num">{formatNaira(amount)}</span> in arrears
          </p>
          <p className="text-muted-foreground text-sm">
            {arrears.length} unpaid {arrears.length === 1 ? "fee" : "fees"} from{" "}
            {sessions.length ? <span className="num">{sessions.join(", ")}</span> : "earlier sessions"}.
            {arrears.length > 1 ? " Pay them one at a time, oldest first." : ""}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              loading={pay.busy}
              onClick={() => (arrears.length === 1 ? pay.mutate(oldest._id) : onOpen(oldest))}
            >
              <IconCreditCard />
              {pay.busy
                ? "Opening Paystack…"
                : arrears.length === 1
                  ? `Pay ${formatNaira(oldest.amount)} now`
                  : "Pay now"}
            </Button>
            {arrears.length > 1 && onShowAll ? (
              <Button variant="outline" onClick={onShowAll}>
                See all arrears
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The opening sentence for the fees in view: what's owed, and the next one to pay.
 * `scope` ends the sentence ("for 2025/2026"); empty when every session is in view.
 */
function Statement({ fees, scope }: { fees: Fee[]; scope: string }) {
  const { outstanding, paid, owed, settled } = splitFees(fees);
  const next = outstanding[0];
  const pay = usePayFee();
  const tail = scope ? ` ${scope}` : "";

  if (!outstanding.length) {
    return (
      <section className="bg-success-soft/70 flex items-start gap-3 rounded-[1.25rem] border border-[color-mix(in_oklch,var(--success)_20%,transparent)] p-5">
        <IconCircleCheck className="text-success mt-0.5 size-6 shrink-0" aria-hidden />
        <div>
          <p className="font-display text-lg font-bold">You&apos;re all paid up{tail}.</p>
          <p className="text-muted-foreground text-sm">
            {formatNaira(settled)} paid across {paid.length} {paid.length === 1 ? "fee" : "fees"}. Receipts are below.
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
          {" "}across {outstanding.length} {outstanding.length === 1 ? "fee" : "fees"}
          {tail}.
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
          loading={pay.busy}
          onClick={() => pay.mutate(next._id)}
        >
          <IconCreditCard />
          {pay.busy ? "Opening Paystack…" : `Pay ${formatNaira(next.amount)} now`}
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

/** Which sessions to show: this one, each other session with fees, or all of them. */
function SessionSwitcher({
  options,
  value,
  onChange,
}: {
  options: { key: View; label: string }[];
  value: View;
  onChange: (v: View) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Show fees for"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "num h-10 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
            value === o.key
              ? "bg-primary text-primary-foreground border-transparent"
              : "bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** One session's fees under its heading: where the student was, and paid vs owed. */
function SessionFees({
  group,
  placement,
  onOpen,
}: {
  group: FeeGroup;
  placement: string;
  onOpen: (fee: Fee) => void;
}) {
  const headingId = `fees-${group.key}`;
  const noSession = group.key === "none";
  return (
    <section aria-labelledby={headingId}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h2 id={headingId} className="flex flex-wrap items-center gap-2 text-lg leading-tight font-extrabold">
            <span className={cn(!noSession && "num")}>
              {noSession ? "Other fees" : `${group.session.name ?? "Session"} session`}
            </span>
            {group.isCurrent ? (
              <span className="bg-primary-soft text-primary-ink inline-flex h-6 items-center rounded-full px-2.5 font-sans text-xs font-semibold">
                Current
              </span>
            ) : null}
          </h2>
          {noSession ? (
            <p className="text-muted-foreground text-sm">Not tied to a session</p>
          ) : placement ? (
            <p className="text-muted-foreground text-sm">{placement}</p>
          ) : null}
        </div>
        <p className="text-muted-foreground text-sm">
          Paid <span className="num text-foreground font-semibold">{formatNaira(group.paid)}</span> · Outstanding{" "}
          <span className={cn("num font-semibold", group.outstanding > 0 ? "text-primary-ink" : "text-foreground")}>
            {formatNaira(group.outstanding)}
          </span>
        </p>
      </div>
      <ul className={rowList}>
        {group.fees.map((fee) => (
          <FeeRow key={fee._id} fee={fee} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  );
}

function PaymentsBody({ statement, onOpen }: { statement: FeeStatement; onOpen: (fee: Fee) => void }) {
  const { data: student } = useStudent();
  const groups = useMemo(() => groupFeesBySession(statement), [statement]);
  const currentName = currentSessionName(statement);
  const others = groups.filter((g) => !g.isCurrent && g.key !== "none");
  // An older API sends no session flags: list everything, grouped, without the switcher.
  const canSwitch = !statement.legacy && others.length > 0;
  const [picked, setPicked] = useState<View>("current");

  const view: View = statement.legacy
    ? "all"
    : picked === "all" || picked === "current" || groups.some((g) => g.key === picked)
      ? picked
      : "current";

  const shown =
    view === "all"
      ? groups
      : view === "current"
        ? groups.filter((g) => g.isCurrent || g.key === "none")
        : groups.filter((g) => g.key === view);
  const fees = shown.flatMap((g) => g.fees);

  const options = [
    { key: "current", label: currentName ? `${currentName} (current)` : "This session" },
    ...others.map((g) => ({ key: g.key, label: g.session.name ?? "Earlier session" })),
    { key: "all", label: "All sessions" },
  ];
  const scope =
    view === "all"
      ? ""
      : view === "current"
        ? `for ${currentName ?? "this session"}`
        : `for ${shown[0]?.session.name ?? "this session"}`;

  const placementOf = (g: FeeGroup) => {
    const label = placementLabel(g.placement);
    if (label || !g.isCurrent) return label;
    // No enrollment row for this session yet: the student's current placement is it.
    return [student?.program?.name, student?.classLevel?.name].filter(Boolean).join(" · ");
  };

  const hasPaid = fees.some((f) => f.isPaid);

  return (
    <>
      <ArrearsCallout
        statement={statement}
        onOpen={onOpen}
        onShowAll={canSwitch && view !== "all" ? () => setPicked("all") : undefined}
      />

      {canSwitch ? <SessionSwitcher options={options} value={view} onChange={setPicked} /> : null}

      {fees.length ? (
        <>
          <Statement fees={fees} scope={scope} />
          {shown.map((g) => (
            <SessionFees key={g.key} group={g} placement={placementOf(g)} onOpen={onOpen} />
          ))}
          {hasPaid ? <p className="text-muted-foreground -mt-3 text-sm">Tap a paid fee to view its receipt.</p> : null}
        </>
      ) : (
        <EmptyState
          icon={<IconReceipt2 />}
          title={currentName ? `No fees for ${currentName} yet` : "No fees for this session yet"}
          description="When the bursary assigns this session's fees, they'll appear here with a Pay button."
        >
          {canSwitch ? (
            <Button variant="outline" onClick={() => setPicked("all")}>
              Show all sessions
            </Button>
          ) : null}
        </EmptyState>
      )}
    </>
  );
}

export default function PaymentsPage() {
  const q = useFeeStatement();
  const [open, setOpen] = useState<Fee | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Your fees session by session, what's due, any arrears, and your receipts."
      />

      {q.isPending ? (
        <>
          <Skeleton className="h-36 w-full rounded-[1.25rem]" />
          <ListSkeleton rows={4} />
        </>
      ) : q.isError ? (
        <QueryErrorPanel message={q.error.message} onRetry={() => q.refetch()} />
      ) : !q.data.fees.length ? (
        <EmptyState
          icon={<IconReceipt2 />}
          title="No fees yet"
          description="When the bursary assigns fees to your programme, they'll appear here with a Pay button."
        />
      ) : (
        <PaymentsBody statement={q.data} onOpen={setOpen} />
      )}

      <FeeSheet fee={open} onOpenChange={(o) => !o && setOpen(null)} />
    </div>
  );
}
