import {
  IconAlertCircle,
  IconArrowRight,
  IconCircleCheck,
  IconCircleX,
  IconClockHour4,
} from "@tabler/icons-react";
import type { ExamOutcome } from "@/types/student";
import { cn } from "@/lib/utils";

export type OutcomeTone = "success" | "warning" | "danger" | "neutral";

export const outcomeTone = (o: ExamOutcome): OutcomeTone =>
  o.status === "pass" ? "success" : o.status === "pass_co" ? "warning" : "danger";

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The outcome's headline: the school's label plus what it means in numbers. */
export function outcomeHeadline(o: ExamOutcome) {
  if (o.status === "pass_co") return `${o.label} — ${plural(o.failedCount, "course")} to resit`;
  if (o.status === "fail") {
    return `${o.label} — you failed ${plural(o.failedCount, "course")} (limit: ${o.threshold})`;
  }
  return o.label;
}

export const TONE_PANEL: Record<OutcomeTone, string> = {
  success: "bg-success-soft/70 border-[color-mix(in_oklch,var(--success)_20%,transparent)]",
  warning: "bg-warning-soft/70 border-[color-mix(in_oklch,var(--warning)_28%,transparent)]",
  danger: "bg-danger-soft/60 border-[color-mix(in_oklch,var(--destructive)_22%,transparent)]",
  neutral: "bg-muted/60 border-border",
};

export const TONE_ICON: Record<OutcomeTone, string> = {
  success: "text-success",
  warning: "text-[color-mix(in_oklch,var(--warning)_75%,black)] dark:text-warning",
  danger: "text-danger",
  neutral: "text-muted-foreground",
};

export const OUTCOME_ICON = {
  success: IconCircleCheck,
  warning: IconAlertCircle,
  danger: IconCircleX,
  neutral: IconClockHour4,
} as const;

/**
 * The exam outcome of a sitting, or of a whole session when the school's rule works by
 * session: pass, pass with carry-over (with the courses to resit), or fail (with the
 * school's message). While results are still being published it says so instead.
 * Renders nothing when the school has no outcome rule.
 */
export function OutcomeBanner({
  outcome,
  pending,
  scope,
  resitHref,
  className,
}: {
  outcome: ExamOutcome | null | undefined;
  pending?: boolean;
  scope: "semester" | "session";
  /** Where "See resit options" goes (the resit section); hidden when omitted. */
  resitHref?: string;
  className?: string;
}) {
  if (!outcome && !pending) return null;
  const tone: OutcomeTone = outcome ? outcomeTone(outcome) : "neutral";
  const Icon = OUTCOME_ICON[tone];
  const what = scope === "session" ? "session" : "sitting";

  return (
    <div className={cn("flex items-start gap-3 border p-3 sm:p-4", TONE_PANEL[tone], className)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", TONE_ICON[tone])} aria-hidden />
      <div className="min-w-0 flex-1">
        {!outcome ? (
          <>
            <p className="font-semibold">Exam outcome pending</p>
            <p className="text-muted-foreground text-sm">
              Outcome will show when all results for this {what} are published.
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">
              <span className="sr-only">Exam outcome: </span>
              {outcomeHeadline(outcome)}
            </p>
            {outcome.status === "pass" ? (
              <p className="text-muted-foreground text-sm">No failed courses this {what}.</p>
            ) : null}
            {outcome.status !== "pass" && outcome.failedCourses.length ? (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Failed courses">
                {outcome.failedCourses.map((code) => (
                  <li
                    key={code}
                    className="bg-card/80 num inline-flex h-6 items-center rounded-[var(--radius-sm)] border px-2 text-xs font-bold"
                  >
                    {code}
                  </li>
                ))}
              </ul>
            ) : null}
            {outcome.status === "fail" && outcome.message ? (
              <p className="mt-2 text-sm whitespace-pre-line">{outcome.message}</p>
            ) : null}
            {outcome.status === "pass_co" && resitHref ? (
              <a
                href={resitHref}
                className="text-primary-ink mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold hover:underline"
              >
                See resit options <IconArrowRight className="size-4" aria-hidden />
              </a>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
