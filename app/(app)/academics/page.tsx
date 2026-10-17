"use client";

import {
  IconAlertTriangle,
  IconBook2,
  IconChevronDown,
  IconClipboardList,
  IconFileCertificate,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useId, useMemo, useState } from "react";
import { EmptyState } from "@/components/system/empty-state";
import { PageHeader } from "@/components/system/page-header";
import { ListSkeleton } from "@/components/system/page-loader";
import { rowList } from "@/components/system/row-list";
import { PdfButton } from "@/components/system/pdf-button";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import { StatusPill } from "@/components/system/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildLevelRows, toLevel } from "@/lib/academic-levels";
import { pdfPaths } from "@/lib/api/student";
import { formatGpa } from "@/lib/format";
import { useCourseForms, useResults, useStudent } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { ResultSitting } from "@/types/student";

function GradeBadge({ grade, pass }: { grade: string; pass: boolean }) {
  return (
    <span
      className={cn(
        "num inline-grid h-7 min-w-8 place-items-center rounded-md px-1.5 text-sm font-extrabold",
        pass ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
      )}
      aria-label={`Grade ${grade}, ${pass ? "pass" : "fail"}`}
    >
      {grade}
    </span>
  );
}

const slug = (v: string) => v.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase();

function Sitting({
  sitting,
  decimals,
  defaultOpen,
}: {
  sitting: ResultSitting;
  decimals: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const level = sitting.classLevel ? toLevel(sitting.classLevel.level) : null;
  const failed = sitting.courses.filter((c) => !c.isPass).length;
  const sessionName = sitting.session?.name ?? "";
  const label = [sessionName, sitting.semester].filter(Boolean).join(" · ");

  return (
    <section className="bg-card overflow-hidden rounded-[var(--radius-xl)] border">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-5">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
          className="-my-1 flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-md)] text-left"
        >
          <IconChevronDown
            className={cn("text-muted-foreground size-5 shrink-0 transition-transform", open && "rotate-180")}
            aria-hidden
          />
          <span className="min-w-0">
            <span className="block font-bold">
              {sitting.semester}
              {level ? <span className="text-muted-foreground font-semibold"> · {level} level</span> : null}
            </span>
            <span className="text-muted-foreground block text-sm">
              GPA <span className="num text-foreground font-semibold">{formatGpa(sitting.gpa, decimals)}</span> · CGPA{" "}
              <span className="num text-foreground font-semibold">{formatGpa(sitting.cgpa, decimals)}</span> ·{" "}
              <span className="num">{sitting.courses.length}</span> {sitting.courses.length === 1 ? "course" : "courses"}
              {failed ? (
                <span className="text-danger font-semibold">
                  {" "}
                  · <span className="num">{failed}</span> failed
                </span>
              ) : null}
            </span>
          </span>
        </button>
        <PdfButton
          size="sm"
          endpoint={pdfPaths.resultSlip(sitting.semester, {
            sessionId: sitting.session?.id,
            yearId: level ? String(level) : undefined,
          })}
          filename={`result-${slug(label)}`}
          title={`Result slip · ${label}`}
          disabled={!sitting.session?.id && !level}
        >
          Result slip
        </PdfButton>
      </header>

      {open ? (
        <div id={bodyId} className="border-t">

      {/* phone: one row per course */}
      <ul className="divide-y md:hidden">
        {sitting.courses.map((c) => (
          <li key={c.resultId} className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                <span className="num">{c.code}</span>
                {c.isCarryOver ? (
                  <span className="bg-warning-soft ml-2 rounded px-1.5 py-0.5 text-xs font-semibold">Carry-over</span>
                ) : null}
                {c.attempt > 1 ? (
                  <span className="bg-muted ml-2 rounded px-1.5 py-0.5 text-xs font-semibold">
                    Attempt <span className="num">{c.attempt}</span>
                  </span>
                ) : null}
              </p>
              <p className="text-muted-foreground truncate text-sm">{c.name}</p>
              <p className="text-muted-foreground text-xs">
                <span className="num">{c.credit}</span> units · score <span className="num">{c.score}</span> · GP{" "}
                <span className="num">{c.gradePoint}</span>
              </p>
            </div>
            <GradeBadge grade={c.grade} pass={c.isPass} />
          </li>
        ))}
      </ul>

      {/* md+: real table */}
      <table className="hidden w-full table-fixed text-left text-sm md:table">
        <thead className="text-muted-foreground bg-muted/50 text-xs">
          <tr>
            <th className="w-32 px-4 py-2.5 font-semibold">Code</th>
            <th className="py-2.5 font-semibold">Course</th>
            <th className="w-16 py-2.5 text-right font-semibold">Units</th>
            <th className="w-16 py-2.5 text-right font-semibold">Score</th>
            <th className="w-20 py-2.5 text-center font-semibold">Grade</th>
            <th className="w-12 py-2.5 text-right font-semibold">GP</th>
            <th className="w-32 py-2.5 pr-4 pl-6 font-semibold">Remark</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sitting.courses.map((c) => (
            <tr key={c.resultId} className="hover:bg-muted/40 transition-colors">
              <td className="num px-4 py-3 font-semibold whitespace-nowrap">
                {c.code}
                {c.isCarryOver ? (
                  <span className="bg-warning-soft ml-2 rounded px-1.5 py-0.5 font-sans text-xs font-semibold">CO</span>
                ) : null}
                {c.attempt > 1 ? (
                  <span
                    className="bg-muted ml-2 rounded px-1.5 py-0.5 font-sans text-xs font-semibold"
                    title={`Attempt ${c.attempt}`}
                  >
                    ×{c.attempt}
                  </span>
                ) : null}
              </td>
              <td className="py-3 pr-3">{c.name}</td>
              <td className="num py-3 text-right">{c.credit}</td>
              <td className="num py-3 text-right">{c.score}</td>
              <td className="py-3 text-center">
                <GradeBadge grade={c.grade} pass={c.isPass} />
              </td>
              <td className="num py-3 text-right">{c.gradePoint}</td>
              <td className="text-muted-foreground truncate py-3 pr-4 pl-6">{c.remark}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      ) : null}
    </section>
  );
}

type SessionGroup = { key: string; name: string; sittings: ResultSitting[] };

/** Newest session first; within a session, the API's order (first semester first). */
function groupBySession(sittings: ResultSitting[]): SessionGroup[] {
  const groups = new Map<string, SessionGroup>();
  sittings.forEach((s) => {
    const key = s.session?.id ?? "none";
    if (!groups.has(key)) groups.set(key, { key, name: s.session?.name ?? "Session not recorded", sittings: [] });
    groups.get(key)!.sittings.push(s);
  });
  return [...groups.values()].reverse();
}

/** Every sitting, grouped by session, with a session filter once there's more than one. */
function SessionResults({ sittings, decimals }: { sittings: ResultSitting[]; decimals: number }) {
  const groups = useMemo(() => groupBySession(sittings), [sittings]);
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? groups : groups.filter((g) => g.key === filter);
  const latest = sittings[sittings.length - 1];

  return (
    <div className="flex flex-col gap-5">
      {groups.length > 1 ? (
        <div
          role="group"
          aria-label="Filter by session"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {[{ key: "all", name: "All sessions" }, ...groups].map((g) => (
            <button
              key={g.key}
              type="button"
              aria-pressed={filter === g.key}
              onClick={() => setFilter(g.key)}
              className={cn(
                "num h-9 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                filter === g.key
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {g.name}
            </button>
          ))}
        </div>
      ) : null}

      {shown.map((g) => (
        <section key={g.key} aria-labelledby={`session-${g.key}`} className="flex flex-col gap-3">
          <h3 id={`session-${g.key}`} className="num text-muted-foreground text-sm font-bold tracking-wide uppercase">
            {g.name} session
          </h3>
          {g.sittings.map((sitting) => (
            <Sitting
              key={`${g.key}-${sitting.semester}-${filter}`}
              sitting={sitting}
              decimals={decimals}
              defaultOpen={sitting === latest || filter !== "all"}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

function ResultsTab() {
  const q = useResults();
  if (q.isPending)
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-full rounded-[var(--radius-xl)]" />
        <ListSkeleton rows={4} />
      </div>
    );
  if (q.isError) return <QueryErrorPanel message={q.error.message} onRetry={() => q.refetch()} />;

  const s = q.data;
  const scheme = s?.gradingScheme;
  const decimals = scheme?.gpaDecimals ?? 2;
  const sittings = s?.semesters ?? [];

  if (!s || !sittings.length) {
    return (
      <EmptyState
        icon={<IconBook2 />}
        title="No published results yet"
        description="Your results appear here as soon as the school publishes them."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="border-b pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-end gap-5">
            <div>
              <p className="text-muted-foreground text-sm">CGPA</p>
              <p className="num text-[2.75rem] leading-none font-extrabold">{formatGpa(s.cgpa, decimals)}</p>
            </div>
            <div className="pb-1">
              <p className={cn("text-lg font-bold", s.classification && !s.classification.isPass && "text-danger")}>
                {s.classification?.name ?? "Not classified"}
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="num">{s.creditsEarned}</span> of <span className="num">{s.totalCredits}</span> units earned
              </p>
            </div>
          </div>
          <PdfButton endpoint={pdfPaths.transcript()} filename="transcript" icon={<IconFileCertificate />}>
            Transcript
          </PdfButton>
        </div>
        {scheme ? (
          <p className="text-muted-foreground mt-4 text-xs">
            {scheme.name} · {scheme.maxPoint}-point scale
            {scheme.passMark != null ? ` · pass mark ${scheme.passMark}` : ""}
          </p>
        ) : null}
      </section>

      {s.outstanding.length ? (
        <section className="bg-danger-soft/60 rounded-[var(--radius-xl)] border border-[color-mix(in_oklch,var(--destructive)_22%,transparent)] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <IconAlertTriangle className="text-danger mt-0.5 size-5 shrink-0" aria-hidden />
            <div className="min-w-0">
              <p className="font-semibold">
                You have {s.outstanding.length} carry-over {s.outstanding.length === 1 ? "course" : "courses"} to retake
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {s.outstanding.map((c) => (
                  <li key={c.courseId}>
                    <span className="num font-semibold">{c.code}</span> {c.name}{" "}
                    <span className="text-muted-foreground">
                      · {c.credit} units · {c.semester}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <SessionResults sittings={sittings} decimals={decimals} />
    </div>
  );
}

function CourseFormsTab() {
  const { data: student, isPending: studentPending } = useStudent();
  const forms = useCourseForms();
  if (studentPending || forms.isPending) return <ListSkeleton rows={3} />;
  if (forms.isError) return <QueryErrorPanel message={forms.error.message} onRetry={() => forms.refetch()} />;

  const rows = buildLevelRows(student, forms.data);
  if (!rows.length) {
    return (
      <EmptyState
        icon={<IconClipboardList />}
        title="No course forms"
        description="Your programme or level isn't set on your record yet. Contact the registry."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        Print the course form for each semester you&apos;ve reached. Forms open as PDFs.
      </p>
      <ul className={rowList}>
        {rows.map((row) => (
          <li key={row.level} className="px-4 py-4 sm:px-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="num text-lg font-extrabold">{row.level} level</p>
              <StatusPill tone={row.status === "Current" ? "warning" : row.status === "Past" ? "success" : "neutral"}>
                {row.status === "Past" ? "Completed" : row.status}
              </StatusPill>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {row.semesters.map((cell) =>
                cell.available ? (
                  <PdfButton
                    key={cell.semester}
                    className="h-12 justify-between"
                    endpoint={pdfPaths.courseForm(cell.semester, String(row.level))}
                    filename={`course-form-${row.level}-${cell.semester.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <span className="flex flex-col items-start leading-tight">
                      <span>{cell.semester}</span>
                      <span className="text-muted-foreground text-xs font-medium">
                        {cell.courseCount} {cell.courseCount === 1 ? "course" : "courses"}
                      </span>
                    </span>
                  </PdfButton>
                ) : (
                  <div
                    key={cell.semester}
                    className="bg-muted/50 text-muted-foreground flex h-12 items-center justify-between rounded-[var(--radius-md)] px-4 text-sm"
                  >
                    <span className="font-medium">{cell.semester}</span>
                    <span className="text-xs">{row.status === "Upcoming" ? "Not yet" : "No courses set"}</span>
                  </div>
                ),
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AcademicsTabs() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get("tab") === "forms" ? "forms" : "results";

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => router.replace(v === "forms" ? "/academics?tab=forms" : "/academics", { scroll: false })}
      className="gap-5"
    >
      <TabsList className="bg-muted h-11 w-full rounded-full p-1 sm:w-auto sm:self-start">
        <TabsTrigger value="results" className="h-9 rounded-full px-5 text-sm font-semibold">
          Results
        </TabsTrigger>
        <TabsTrigger value="forms" className="h-9 rounded-full px-5 text-sm font-semibold">
          Course forms
        </TabsTrigger>
      </TabsList>
      <TabsContent value="results">
        <ResultsTab />
      </TabsContent>
      <TabsContent value="forms">
        <CourseFormsTab />
      </TabsContent>
    </Tabs>
  );
}

export default function AcademicsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Academics" description="Your published results, CGPA, and course forms." />
      <Suspense fallback={<ListSkeleton rows={3} />}>
        <AcademicsTabs />
      </Suspense>
    </div>
  );
}
