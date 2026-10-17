"use client";

import {
  IconAlertTriangle,
  IconArrowRight,
  IconBook2,
  IconCircleCheck,
  IconClipboardList,
  IconCreditCard,
  IconFileCertificate,
  IconLoader2,
  IconUserExclamation,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { FeeSheet, usePayFee } from "@/components/payments/fee-parts";
import { IdCard } from "@/components/student/id-card";
import { PdfButton } from "@/components/system/pdf-button";
import { SectionHeading } from "@/components/system/page-header";
import { ListSkeleton } from "@/components/system/page-loader";
import { rowList, rowPad } from "@/components/system/row-list";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EventRow,
  EventSheet,
  MemoRow,
  MemoSheet,
  upcomingEvents,
} from "@/components/updates/update-parts";
import { pdfPaths } from "@/lib/api/student";
import { formatDate, formatGpa, formatNaira } from "@/lib/format";
import {
  isOverdue,
  splitFees,
  useEvents,
  useFees,
  useMemos,
  useResults,
  useStudent,
} from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { Fee, Memo, SchoolEvent } from "@/types/student";

function AttentionItem({
  tone,
  icon,
  title,
  detail,
  action,
}: {
  tone: "danger" | "warning" | "neutral";
  icon: ReactNode;
  title: ReactNode;
  detail?: ReactNode;
  action: ReactNode;
}) {
  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full [&_svg]:size-5",
            tone === "danger" && "bg-danger-soft text-danger",
            tone === "warning" && "bg-warning-soft text-[color-mix(in_oklch,var(--warning)_75%,black)] dark:text-warning",
            tone === "neutral" && "bg-muted text-foreground/70",
          )}
          aria-hidden
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          {detail ? <p className="text-muted-foreground text-sm">{detail}</p> : null}
        </div>
      </div>
      <div className="sm:shrink-0">{action}</div>
    </li>
  );
}

function NeedsAttention({ onOpenFee }: { onOpenFee: (f: Fee) => void }) {
  const fees = useFees();
  const results = useResults();
  const { data: student } = useStudent();
  const pay = usePayFee();

  if (fees.isPending) return <ListSkeleton rows={2} />;

  const { outstanding, owed } = splitFees(fees.data);
  const overdue = outstanding.filter(isOverdue);
  const next = outstanding[0];
  const carryOvers = results.data?.outstanding ?? [];
  const missingContact = student && (!student.contactInfo?.phone || !student.contactInfo?.address);

  const items: ReactNode[] = [];

  if (fees.isError) {
    items.push(
      <AttentionItem
        key="fees-error"
        tone="neutral"
        icon={<IconCreditCard />}
        title="Couldn't check your fees"
        detail={fees.error.message}
        action={
          <Button variant="outline" size="sm" onClick={() => fees.refetch()}>
            Try again
          </Button>
        }
      />,
    );
  } else if (outstanding.length) {
    items.push(
      <AttentionItem
        key="fees"
        tone={overdue.length ? "danger" : "warning"}
        icon={<IconCreditCard />}
        title={
          <>
            <span className="num">{formatNaira(owed)}</span> outstanding
          </>
        }
        detail={
          overdue.length
            ? `${overdue.length} overdue · ${outstanding.length} ${outstanding.length === 1 ? "fee" : "fees"} in total`
            : `${outstanding.length} ${outstanding.length === 1 ? "fee" : "fees"} · next due ${formatDate(next?.dueDate)}`
        }
        action={
          <div className="flex gap-2">
            <Button
              className="flex-1 sm:flex-none"
              disabled={pay.isPending}
              onClick={() => (outstanding.length === 1 && next ? pay.mutate(next._id) : onOpenFee(next!))}
            >
              {pay.isPending ? <IconLoader2 className="animate-spin" /> : null}
              {outstanding.length === 1 ? `Pay ${formatNaira(next?.amount)}` : "Pay next fee"}
            </Button>
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link href="/payments">All fees</Link>
            </Button>
          </div>
        }
      />,
    );
  }

  if (carryOvers.length) {
    items.push(
      <AttentionItem
        key="carry"
        tone="danger"
        icon={<IconAlertTriangle />}
        title={`${carryOvers.length} carry-over ${carryOvers.length === 1 ? "course" : "courses"}`}
        detail={carryOvers.map((c) => c.code).join(", ")}
        action={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/academics">See results</Link>
          </Button>
        }
      />,
    );
  }

  if (missingContact) {
    items.push(
      <AttentionItem
        key="profile"
        tone="neutral"
        icon={<IconUserExclamation />}
        title="Add your contact details"
        detail="The school uses your phone number and address to reach you."
        action={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/profile">Update profile</Link>
          </Button>
        }
      />,
    );
  }

  if (!items.length) {
    return (
      <div className={cn(rowList, rowPad, "flex items-center gap-3 py-4")}>
        <IconCircleCheck className="text-success size-6 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">You&apos;re all caught up</p>
          <p className="text-muted-foreground text-sm">No fees due and nothing outstanding on your record.</p>
        </div>
      </div>
    );
  }

  return <ul className={rowList}>{items}</ul>;
}

function Standing() {
  const q = useResults();
  if (q.isPending) return <Skeleton className="h-24 w-full rounded-[var(--radius-md)]" />;
  if (q.isError) return <QueryErrorPanel message={q.error.message} onRetry={() => q.refetch()} />;

  const s = q.data;
  const decimals = s?.gradingScheme?.gpaDecimals ?? 2;
  const latest = s?.semesters?.[s.semesters.length - 1];

  if (!s || !s.semesters?.length) {
    return (
      <div className={cn(rowList, rowPad, "py-4")}>
        <p className="font-semibold">No published results yet</p>
        <p className="text-muted-foreground text-sm">Your CGPA shows here once the school publishes your first result.</p>
      </div>
    );
  }

  return (
    <div className={rowList}>
    <Link
      href="/academics"
      className={cn(rowPad, "hover:bg-muted/50 group flex items-center gap-4 py-4 transition-colors")}
    >
      <div className="border-r pr-4">
        <p className="text-muted-foreground text-sm">CGPA</p>
        <p className="num text-[2rem] leading-none font-extrabold">{formatGpa(s.cgpa, decimals)}</p>
        {s.gradingScheme ? (
          <p className="text-muted-foreground mt-1 text-xs">of {s.gradingScheme.maxPoint.toFixed(1)}</p>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("font-semibold", s.classification && !s.classification.isPass && "text-danger")}>
          {s.classification?.name ?? "Not classified"}
        </p>
        <p className="text-muted-foreground truncate text-sm">
          {latest ? `${latest.session?.name ?? ""} ${latest.semester} · GPA ${formatGpa(latest.gpa, decimals)}` : ""}
        </p>
        <p className="text-muted-foreground text-sm">
          <span className="num">{s.creditsEarned}</span> of <span className="num">{s.totalCredits}</span> units earned
        </p>
      </div>
      <IconArrowRight className="text-muted-foreground size-5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
    </div>
  );
}

function QuickActions() {
  return (
    <nav aria-label="Quick actions" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <ul className="flex gap-2 pb-1 sm:flex-wrap">
        <li className="hidden lg:block">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/payments">
              <IconCreditCard /> Pay fees
            </Link>
          </Button>
        </li>
        <li className="hidden lg:block">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/academics">
              <IconBook2 /> Results
            </Link>
          </Button>
        </li>
        <li>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/academics?tab=forms">
              <IconClipboardList /> Course forms
            </Link>
          </Button>
        </li>
        <li>
          <PdfButton
            className="rounded-full"
            endpoint={pdfPaths.transcript()}
            filename="transcript"
            icon={<IconFileCertificate />}
          >
            Transcript
          </PdfButton>
        </li>
      </ul>
    </nav>
  );
}

function LatestUpdates({
  onOpenMemo,
  onOpenEvent,
}: {
  onOpenMemo: (m: Memo) => void;
  onOpenEvent: (e: SchoolEvent) => void;
}) {
  const events = useEvents();
  const memos = useMemos();
  if (events.isPending || memos.isPending) return <ListSkeleton rows={3} />;

  const next = upcomingEvents(events.data).slice(0, 2);
  const recent = [...(memos.data ?? [])]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 3 - next.length || 1);

  if (!next.length && !recent.length) {
    return (
      <p className={cn(rowList, rowPad, "text-muted-foreground py-4 text-sm")}>
        No memos or upcoming events right now.
      </p>
    );
  }

  return (
    <ul className={rowList}>
      {next.map((e) => (
        <EventRow key={e._id} event={e} onOpen={onOpenEvent} />
      ))}
      {recent.map((m) => (
        <MemoRow key={m._id} memo={m} onOpen={onOpenMemo} />
      ))}
    </ul>
  );
}

export default function HomePage() {
  const { data: student } = useStudent();
  const [fee, setFee] = useState<Fee | null>(null);
  const [memo, setMemo] = useState<Memo | null>(null);
  const [event, setEvent] = useState<SchoolEvent | null>(null);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-7 [grid-template-areas:'id'_'attention'_'standing'_'updates'_'actions'] lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-x-10 lg:gap-y-6 lg:[grid-template-areas:'id_attention'_'standing_updates'_'actions_updates']">
      <div className="[grid-area:id]">
        <IdCard student={student} />
      </div>

      <section aria-labelledby="attention" className="[grid-area:attention]">
        <SectionHeading title={<span id="attention">Needs your attention</span>} />
        <NeedsAttention onOpenFee={setFee} />
      </section>

      <section aria-labelledby="standing" className="[grid-area:standing]">
        <SectionHeading title={<span id="standing">Your standing</span>} />
        <Standing />
      </section>

      <section aria-labelledby="updates" className="[grid-area:updates]">
        <SectionHeading
          title={<span id="updates">Latest from school</span>}
          action={
            <Link href="/updates" className="text-primary-ink inline-flex min-h-11 items-center gap-1 text-sm font-semibold hover:underline">
              See all <IconArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
        <LatestUpdates onOpenMemo={setMemo} onOpenEvent={setEvent} />
      </section>

      <div className="[grid-area:actions]">
        <QuickActions />
      </div>

      <FeeSheet fee={fee} onOpenChange={(o) => !o && setFee(null)} />
      <MemoSheet memo={memo} onOpenChange={(o) => !o && setMemo(null)} />
      <EventSheet event={event} onOpenChange={(o) => !o && setEvent(null)} />
    </div>
  );
}
