"use client";

import { IconAlertTriangle, IconCreditCard, IconReceipt, IconRefresh } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { usePayFee } from "@/components/payments/fee-parts";
import { ListSkeleton } from "@/components/system/page-loader";
import { PdfButton } from "@/components/system/pdf-button";
import { ResponsiveSheet } from "@/components/system/responsive-sheet";
import { rowList } from "@/components/system/row-list";
import { StatusPill, type Tone } from "@/components/system/status-pill";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cancelResit, pdfPaths, registerResits } from "@/lib/api/student";
import { formatDate, formatNaira } from "@/lib/format";
import { qk, useResits } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { AcademicSummary, ResitCourse, ResitRegistration, ResitState } from "@/types/student";

export const RESIT_ANCHOR = "resits";

const STATE: Record<ResitState, { tone: Tone; label: string }> = {
  pending_payment: { tone: "warning", label: "Awaiting payment" },
  paid: { tone: "success", label: "Paid" },
  waived: { tone: "success", label: "Waived" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

/** What a registration's state means for the student, in a sentence. */
function stateDetail(r: { state: ResitState; paymentStarted?: boolean }) {
  switch (r.state) {
    case "paid":
      return "Paid — you may sit the resit.";
    case "waived":
      return "Fee waived — you may sit the resit.";
    case "cancelled":
      return "Cancelled.";
    default:
      return r.paymentStarted
        ? "A payment was started but not confirmed. If you were charged, wait a few minutes before paying again."
        : "Registered — pay the resit fee to confirm.";
  }
}

const courseCode = (c: ResitRegistration["courses"][number]["course"]) =>
  c && typeof c === "object" ? (c.code ?? "Course") : "Course";

const sessionName = (s: ResitRegistration["session"]) => (s && typeof s === "object" ? s.name : undefined);

/** Fees, resits and results all change when a resit is registered, paid or cancelled. */
function useRefreshResits() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.resits }),
        queryClient.invalidateQueries({ queryKey: qk.fees }),
        queryClient.invalidateQueries({ queryKey: qk.results }),
      ]),
    [queryClient],
  );
}

/** The older carry-over list, for APIs without resit registration. */
function CarryOverPanel({
  courses,
  error,
  onRetry,
}: {
  courses: AcademicSummary["outstanding"];
  error?: string;
  onRetry?: () => void;
}) {
  return (
    <section
      id={RESIT_ANCHOR}
      className="bg-danger-soft/60 scroll-mt-24 rounded-[var(--radius-xl)] border border-[color-mix(in_oklch,var(--destructive)_22%,transparent)] p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <IconAlertTriangle className="text-danger mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            You have {courses.length} carry-over {courses.length === 1 ? "course" : "courses"} to retake
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {courses.map((c) => (
              <li key={c.courseId}>
                <span className="num font-semibold">{c.code}</span> {c.name}{" "}
                <span className="text-muted-foreground">
                  · {c.credit} units · {c.semester}
                </span>
              </li>
            ))}
          </ul>
          {error ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="text-muted-foreground">Resit registration couldn&apos;t load: {error}</span>
              {onRetry ? (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  <IconRefresh />
                  Try again
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** One failed course: what, when, how it went, the resit price and any registration. */
function CourseRow({
  course,
  checked,
  disabled,
  indent,
  onToggle,
}: {
  course: ResitCourse;
  checked: boolean;
  disabled: boolean;
  /** Leave room for a checkbox so rows line up when some can be ticked. */
  indent: boolean;
  onToggle: (on: boolean) => void;
}) {
  const id = `resit-${course.resultId}`;
  const reg = course.registration;
  const state = reg ? STATE[reg.state] : null;
  const sitting = [course.session?.name, course.semester].filter(Boolean).join(" · ");

  const body = (
    <>
      {course.canRegister ? (
        <Checkbox
          id={id}
          checked={checked}
          disabled={disabled}
          onCheckedChange={(v) => onToggle(v === true)}
          className="mt-0.5 size-5 [&_svg]:size-3.5"
          aria-label={`Resit ${course.course?.code ?? "course"}`}
        />
      ) : indent ? (
        <span className="size-5 shrink-0" aria-hidden />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="leading-snug font-semibold">
          <span className="num">{course.course?.code ?? "Course"}</span>{" "}
          <span className="font-normal">{course.course?.name}</span>
        </p>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {sitting ? <span className="num">{sitting}</span> : null}
          {course.score != null ? (
            <>
              {sitting ? " · " : ""}score <span className="num">{course.score}</span>
            </>
          ) : null}
          {course.grade ? (
            <>
              {" "}
              · grade <span className="num text-danger font-semibold">{course.grade}</span>
            </>
          ) : null}
        </p>
        {reg ? (
          <p className="mt-0.5 text-sm">{stateDetail(reg)}</p>
        ) : course.price == null ? (
          <p className="text-muted-foreground mt-0.5 text-sm">Price not set yet — ask the school.</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {course.price != null ? <span className="num text-[0.9375rem] font-bold">{formatNaira(course.price)}</span> : null}
        {state ? <StatusPill tone={state.tone}>{state.label}</StatusPill> : null}
      </div>
    </>
  );

  return (
    <li>
      {course.canRegister ? (
        <label
          htmlFor={id}
          className={cn(
            "flex items-start gap-3 px-4 py-3.5 transition-colors sm:px-5",
            disabled ? "cursor-default" : "hover:bg-muted/60 cursor-pointer",
            checked && "bg-primary-soft/50",
          )}
        >
          {body}
        </label>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3.5 sm:px-5">{body}</div>
      )}
    </li>
  );
}

/** One resit registration: its courses, total and state, ending in Pay / Cancel while unpaid. */
function RegistrationRow({
  registration: r,
  paying,
  payDisabled,
  onPay,
  onCancel,
}: {
  registration: ResitRegistration;
  paying: boolean;
  payDisabled: boolean;
  onPay: () => void;
  onCancel: () => void;
}) {
  const state = STATE[r.state];
  const codes = r.courses.map((c) => courseCode(c.course));
  const used = r.courses.filter((c) => c.used).map((c) => courseCode(c.course));
  const meta = [
    sessionName(r.session),
    r.createdAt ? `Registered ${formatDate(r.createdAt)}${r.createdByType === "user" ? " by the school" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const pending = r.state === "pending_payment";

  return (
    <li className="px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="num leading-snug font-semibold">{codes.join(", ") || "Resit"}</p>
          {meta ? <p className="text-muted-foreground mt-0.5 text-sm">{meta}</p> : null}
          <p className={cn("mt-0.5 text-sm", r.state === "cancelled" && "text-muted-foreground")}>
            {r.state === "cancelled" && r.cancelledAt ? `Cancelled ${formatDate(r.cancelledAt)}.` : stateDetail(r)}
          </p>
          {r.state === "waived" && r.waiveReason ? (
            <p className="text-muted-foreground text-sm">Reason: {r.waiveReason}</p>
          ) : null}
          {used.length ? (
            <p className="text-muted-foreground text-sm">
              Resit score recorded for <span className="num">{used.join(", ")}</span>.
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={cn("num text-[0.9375rem] font-bold", r.state === "cancelled" && "text-muted-foreground line-through")}>
            {formatNaira(r.total)}
          </span>
          <StatusPill tone={state.tone}>{state.label}</StatusPill>
        </div>
      </div>

      {pending ? (
        <div className="mt-3 flex gap-2">
          <Button className="flex-1 sm:flex-none" loading={paying} disabled={payDisabled} onClick={onPay}>
            <IconCreditCard />
            {paying ? "Opening Paystack…" : `Pay ${formatNaira(r.total)} now`}
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" disabled={payDisabled} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      ) : r.state === "paid" && r.payment?._id ? (
        <div className="mt-3">
          <PdfButton
            size="sm"
            endpoint={pdfPaths.receipt(r.payment._id)}
            filename={`receipt-${r.payment.reference ?? r._id}`}
            icon={<IconReceipt />}
            title={`Receipt · Resit ${codes.join(", ")}`}
          >
            Receipt
          </PdfButton>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Resits: the failed courses the student hasn't passed since, with the price for this
 * session. Tick courses, then "Register & pay" registers them and opens Paystack for
 * the generated fee. Registrations are listed with their state, and unpaid ones can be
 * paid or cancelled. Falls back to the plain carry-over list on APIs without resits.
 */
export function ResitSection({ carryOvers }: { carryOvers: AcademicSummary["outstanding"] }) {
  const q = useResits();
  const refresh = useRefreshResits();
  const pay = usePayFee();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [cancelling, setCancelling] = useState<ResitRegistration | null>(null);
  const scrolled = useRef(false);

  const register = useMutation({
    mutationFn: async (resultIds: string[]) => {
      const res = await registerResits(resultIds);
      if (!res.ok) throw new Error(res.message);
      if (!res.data?.feeId) throw new Error("The resit was registered but no fee came back. Refresh and pay it below.");
      return { ...res.data, message: res.message };
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setSelected(new Set());
      void refresh();
      pay.mutate(String(data.feeId));
    },
    onError: (e: Error) => {
      toast.error(e.message);
      void refresh();
    },
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const res = await cancelResit(id);
      if (!res.ok) throw new Error(res.message);
      return res.message;
    },
    onSuccess: (message) => {
      toast.success(message);
      setCancelling(null);
      void refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Back from Paystack (restored from the back/forward cache): the lists may be stale.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      setSelected(new Set());
      void refresh();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [refresh]);

  // Arriving from a "#resits" link: the section renders after its data, so scroll then.
  const ready = q.isSuccess || q.isError;
  useEffect(() => {
    if (!ready || scrolled.current || window.location.hash !== `#${RESIT_ANCHOR}`) return;
    scrolled.current = true;
    document.getElementById(RESIT_ANCHOR)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [ready]);

  const courses = useMemo(() => q.data?.courses ?? [], [q.data]);
  const chosen = courses.filter((c) => c.canRegister && c.price != null && selected.has(c.resultId));
  const total = chosen.reduce((sum, c) => sum + (c.price ?? 0), 0);
  const anyRegistrable = courses.some((c) => c.canRegister);

  if (q.isPending) return carryOvers.length ? <ListSkeleton rows={2} /> : null;
  if (q.isError) {
    return carryOvers.length ? (
      <CarryOverPanel courses={carryOvers} error={q.error.message} onRetry={() => q.refetch()} />
    ) : null;
  }

  const { session, registrations } = q.data;
  if (!courses.length && !registrations.length) return null;

  // Registered and now opening Paystack for that registration's fee.
  const checkout =
    register.isSuccess && pay.busy && pay.variables === String(register.data.feeId) ? register.data : null;
  const busy = register.isPending || !!checkout;
  const barVisible = chosen.length > 0 || busy;
  const barTotal = checkout ? checkout.total : total;
  const barCount = checkout ? (register.variables?.length ?? 0) : chosen.length;
  const toggle = (resultId: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(resultId);
      else next.delete(resultId);
      return next;
    });

  return (
    <section id={RESIT_ANCHOR} aria-labelledby="resits-title" className="flex scroll-mt-24 flex-col gap-3">
      <div>
        <h2 id="resits-title" className="text-lg leading-tight font-extrabold">
          Resits
        </h2>
        {courses.length ? (
          <p className="text-muted-foreground mt-1 max-w-prose text-sm">
            Courses you failed and haven&apos;t passed since.{" "}
            {!session
              ? "Resit registration opens when the school sets the current session."
              : anyRegistrable
                ? `Tick the ones you want to resit in ${session.name ?? "this session"}, then register and pay.`
                : `Resits are for ${session.name ?? "this session"}.`}
          </p>
        ) : null}
      </div>

      {courses.length ? (
        <ul className={rowList} aria-label="Failed courses">
          {courses.map((c) => (
            <CourseRow
              key={c.resultId}
              course={c}
              checked={selected.has(c.resultId)}
              disabled={busy}
              indent={anyRegistrable}
              onToggle={(on) => toggle(c.resultId, on)}
            />
          ))}
        </ul>
      ) : null}

      {/* Selection bar: floats above the bottom nav on phones, sits under the list from md. */}
      <AnimatePresence>
        {barVisible ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card/95 fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-30 flex items-center justify-between gap-3 rounded-[var(--radius-xl)] border p-2.5 pl-4 shadow-[var(--shadow-lift)] backdrop-blur md:static md:inset-auto md:justify-end md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none"
          >
            <p className="text-sm" aria-live="polite">
              <span className="num font-semibold">{barCount}</span> {checkout ? "registered" : "selected"}
              <span className="text-muted-foreground hidden md:inline">
                {" "}
                · total <span className="num text-foreground font-semibold">{formatNaira(barTotal)}</span>
              </span>
            </p>
            <Button
              loading={busy}
              onClick={() => register.mutate(chosen.map((c) => c.resultId))}
              disabled={!chosen.length && !busy}
            >
              <IconCreditCard />
              {register.isPending
                ? "Registering…"
                : checkout
                  ? "Opening Paystack…"
                  : `Register & pay ${formatNaira(barTotal)}`}
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {registrations.length ? (
        <div className="mt-2">
          <h3 className="text-muted-foreground mb-2 text-sm font-bold tracking-wide uppercase">Your registrations</h3>
          <ul className={rowList}>
            {registrations.map((r) => (
              <RegistrationRow
                key={r._id}
                registration={r}
                paying={pay.busy && pay.variables === String(r.fee)}
                payDisabled={pay.busy || busy}
                onPay={() => pay.mutate(String(r.fee))}
                onCancel={() => setCancelling(r)}
              />
            ))}
          </ul>
        </div>
      ) : null}

      <ResponsiveSheet
        open={!!cancelling}
        onOpenChange={(o) => {
          if (!o && !cancel.isPending) setCancelling(null);
        }}
        title="Cancel this resit registration?"
        description={
          cancelling
            ? `${cancelling.courses.map((c) => courseCode(c.course)).join(", ")} · ${formatNaira(cancelling.total)}`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" disabled={cancel.isPending} onClick={() => setCancelling(null)}>
              Keep registration
            </Button>
            <Button
              variant="destructive"
              loading={cancel.isPending}
              onClick={() => cancelling && cancel.mutate(cancelling._id)}
            >
              {cancel.isPending ? "Cancelling…" : "Cancel registration"}
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground text-sm">
          The resit fee comes off your account. You can register for these courses again later.
        </p>
      </ResponsiveSheet>
    </section>
  );
}
