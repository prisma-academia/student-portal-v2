"use client";

import { IconAlertTriangle, IconBook2, IconClipboardList, IconFileCertificate } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
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

function Sitting({ sitting, decimals }: { sitting: ResultSitting; decimals: number }) {
  const level = sitting.classLevel ? toLevel(sitting.classLevel.level) : null;
  return (
    <section>
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold">
            {sitting.session?.name} · {sitting.semester}
          </h3>
          <p className="text-muted-foreground text-sm">
            {level ? `${level} level · ` : ""}GPA <span className="num text-foreground font-semibold">{formatGpa(sitting.gpa, decimals)}</span> · CGPA{" "}
            <span className="num text-foreground font-semibold">{formatGpa(sitting.cgpa, decimals)}</span>
          </p>
        </div>
        {level ? (
          <PdfButton
            size="sm"
            endpoint={pdfPaths.resultSlip(sitting.semester, String(level))}
            filename={`result-${level}-${sitting.semester.replace(/\s+/g, "-").toLowerCase()}`}
          >
            Result slip
          </PdfButton>
        ) : null}
      </header>

      {/* phone: one row per course */}
      <ul className={cn(rowList, "md:hidden")}>
        {sitting.courses.map((c) => (
          <li key={c.resultId} className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                <span className="num">{c.code}</span>
                {c.isCarryOver ? (
                  <span className="bg-warning-soft ml-2 rounded px-1.5 py-0.5 text-xs font-semibold">Carry-over</span>
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
      <table className="hidden w-full table-fixed border-y text-left text-sm md:table">
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
    </section>
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

      <div className="flex flex-col gap-4">
        {[...sittings].reverse().map((sitting) => (
          <Sitting key={`${sitting.session?.id}-${sitting.semester}`} sitting={sitting} decimals={decimals} />
        ))}
      </div>
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
