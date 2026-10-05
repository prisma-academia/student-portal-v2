"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  IconDownload,
  IconReceipt,
  IconCreditCard,
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/system/empty-state";
import { PageLoader } from "@/components/system/page-loader";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import {
  FIRST_SEMESTER,
  SECOND_SEMESTER,
  buildClassRows,
} from "@/lib/academic-levels";
import {
  courseFormPdfUrl,
  fetchFees,
  fetchResultsSummary,
  initializePayment,
  receiptPdfUrl,
  resultsPdfUrl,
  transcriptPdfUrl,
} from "@/lib/api/student";
import { formatDate, formatNaira } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import type { Fee } from "@/types/student";

function PaymentTab() {
  const [openFee, setOpenFee] = useState<Fee | null>(null);
  const q = useQuery({
    queryKey: ["student", "fees"],
    queryFn: async () => {
      const res = await fetchFees();
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });

  const payMutation = useMutation({
    mutationFn: async (feeId: string) => {
      const res = await initializePayment(feeId);
      if (!res.ok) throw new Error(res.message);
      const url = res.data?.authorizationUrl;
      if (!url) throw new Error("No payment URL returned.");
      return url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isPending) return <PageLoader className="min-h-[160px] py-6" />;
  if (q.isError) {
    return (
      <QueryErrorPanel
        message={q.error.message}
        onRetry={() => q.refetch()}
      />
    );
  }
  if (!q.data?.length) {
    return (
      <EmptyState title="No fees" description="No fee items are assigned." />
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {q.data.map((fee) => (
          <li key={fee._id}>
            <button
              type="button"
              onClick={() => setOpenFee(fee)}
              className="hover:bg-muted/80 flex w-full flex-col gap-1 rounded-lg border px-3 py-3 text-left sm:flex-row sm:items-center sm:justify-between sm:px-4"
            >
              <div>
                <p className="text-sm font-medium">{fee.name}</p>
                <p className="text-muted-foreground text-xs">
                  Due {formatDate(fee.dueDate)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">
                  {formatNaira(fee.amount)}
                </span>
                {fee.isPaid ? (
                  <Badge variant="secondary">Paid</Badge>
                ) : (
                  <Badge variant="outline">Unpaid</Badge>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={!!openFee} onOpenChange={(o) => !o && setOpenFee(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {openFee ? (
            <>
              <DialogHeader>
                <DialogTitle>{openFee.name}</DialogTitle>
                <DialogDescription>
                  Review details and pay or download your receipt.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total</CardDescription>
                    <CardTitle className="text-base">
                      {formatNaira(openFee.amount)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Due date</CardDescription>
                    <CardTitle className="text-base">
                      {formatDate(openFee.dueDate)}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
              {openFee.items && openFee.items.length > 0 ? (
                <ul className="text-muted-foreground space-y-1 text-xs">
                  {openFee.items.map((it, i) => (
                    <li key={i}>
                      {it.name} × {it.quantity ?? 1} —{" "}
                      {formatNaira(it.price)}
                    </li>
                  ))}
                </ul>
              ) : null}
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                {openFee.isPaid && openFee.userPayment?._id ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => {
                      window.location.href = receiptPdfUrl(
                        openFee.userPayment!._id!,
                      );
                    }}
                  >
                    <IconReceipt className="size-4" />
                    Receipt
                  </Button>
                ) : null}
                {!openFee.isPaid ? (
                  <Button
                    type="button"
                    className="w-full gap-2 sm:w-auto"
                    disabled={payMutation.isPending}
                    onClick={() => payMutation.mutate(openFee._id)}
                  >
                    <IconCreditCard className="size-4" />
                    {payMutation.isPending ? "Starting…" : "Pay now"}
                  </Button>
                ) : null}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SessionTab() {
  const user = useAuthStore((s) => s.user);
  const rows = buildClassRows(user);

  if (!user?.program || !user?.classLevel) {
    return (
      <EmptyState
        title="Program unavailable"
        description="Program or class information is missing for your account."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Academic overview</CardTitle>
          <CardDescription>
            Program: {user.program.name} ({user.program.durationInYears}{" "}
            years)
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course forms</CardTitle>
          <CardDescription>
            Download PDFs by level and semester (opens in browser).
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto px-2 sm:px-4">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead>
              <tr className="border-b">
                <th className="p-2 font-medium">Class</th>
                <th className="p-2 font-medium">Status</th>
                <th className="p-2 font-medium">First semester</th>
                <th className="p-2 font-medium">Second semester</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{row.classLabel}</td>
                  <td className="p-2">
                    <Badge variant="outline" className="text-[0.6rem]">
                      {row.status}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <SemesterDownload
                      label={row.firstSemester}
                      semester={FIRST_SEMESTER}
                      yearId={row.id}
                    />
                  </td>
                  <td className="p-2">
                    <SemesterDownload
                      label={row.secondSemester}
                      semester={SECOND_SEMESTER}
                      yearId={row.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function SemesterDownload({
  label,
  semester,
  yearId,
}: {
  label: string;
  semester: string;
  yearId: string;
}) {
  if (label !== "Completed" && label !== "Ongoing") {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1 text-[0.65rem]"
      onClick={() => {
        window.location.href = courseFormPdfUrl(semester, yearId);
      }}
    >
      <IconDownload className="size-3.5" />
      PDF
    </Button>
  );
}

function formatGpa(value: number | null, decimals = 2) {
  return value === null || value === undefined ? "—" : value.toFixed(decimals);
}

function ResultTab() {
  const q = useQuery({
    queryKey: ["student", "results-summary"],
    queryFn: async () => {
      const res = await fetchResultsSummary();
      if (!res.ok) throw new Error(res.message);
      return res.data;
    },
  });

  if (q.isPending) return <PageLoader className="min-h-[160px] py-6" />;
  if (q.isError) {
    return (
      <QueryErrorPanel message={q.error.message} onRetry={() => q.refetch()} />
    );
  }

  const summary = q.data;
  const scheme = summary?.gradingScheme;
  const decimals = scheme?.gpaDecimals ?? 2;
  const sittings = summary?.semesters ?? [];

  if (!summary || sittings.length === 0) {
    return (
      <EmptyState
        title="No published results yet"
        description="Your results appear here once the college publishes them."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Academic standing</CardTitle>
            {scheme && (
              <CardDescription>
                {scheme.name} · {scheme.maxPoint}-point scale · pass mark{" "}
                {scheme.passMark}
              </CardDescription>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => {
              window.location.href = transcriptPdfUrl();
            }}
          >
            <IconDownload className="size-3.5" />
            Transcript
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="CGPA" value={formatGpa(summary.cgpa, decimals)} />
          <Stat label="Class" value={summary.classification?.name ?? "—"} />
          <Stat label="Units registered" value={String(summary.totalCredits)} />
          <Stat label="Units earned" value={String(summary.creditsEarned)} />
        </CardContent>
        {summary.outstanding.length > 0 && (
          <CardContent className="pt-0">
            <Alert variant="destructive">
              <AlertTitle>Carry-over courses</AlertTitle>
              <AlertDescription className="text-xs">
                You still owe:{" "}
                {summary.outstanding.map((c) => `${c.code} (${c.name})`).join(", ")}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {[...sittings].reverse().map((sitting) => (
        <Card key={`${sitting.session?.id}-${sitting.semester}`}>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-sm">
                {sitting.session?.name} · {sitting.semester}
              </CardTitle>
              <CardDescription>
                {sitting.classLevel?.name ?? ""} · GPA{" "}
                {formatGpa(sitting.gpa, decimals)} · CGPA{" "}
                {formatGpa(sitting.cgpa, decimals)}
              </CardDescription>
            </div>
            {sitting.classLevel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-[0.65rem]"
                onClick={() => {
                  window.location.href = resultsPdfUrl(
                    sitting.semester,
                    String(sitting.classLevel?.level ?? ""),
                  );
                }}
              >
                <IconDownload className="size-3.5" />
                PDF
              </Button>
            )}
          </CardHeader>
          <CardContent className="overflow-x-auto px-2 sm:px-4">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead>
                <tr className="border-b">
                  <th className="p-2 font-medium">Code</th>
                  <th className="p-2 font-medium">Course</th>
                  <th className="p-2 font-medium">Units</th>
                  <th className="p-2 font-medium">Score</th>
                  <th className="p-2 font-medium">Grade</th>
                  <th className="p-2 font-medium">GP</th>
                  <th className="p-2 font-medium">Remark</th>
                </tr>
              </thead>
              <tbody>
                {sitting.courses.map((course) => (
                  <tr key={course.resultId} className="border-b last:border-0">
                    <td className="p-2 font-medium">
                      {course.code}
                      {course.isCarryOver && (
                        <Badge variant="outline" className="ml-1 text-[0.55rem]">
                          CO
                        </Badge>
                      )}
                    </td>
                    <td className="p-2">{course.name}</td>
                    <td className="p-2">{course.credit}</td>
                    <td className="p-2">{course.score}</td>
                    <td className="p-2">
                      <Badge
                        variant={course.isPass ? "secondary" : "outline"}
                        className={
                          course.isPass
                            ? "text-[0.6rem]"
                            : "border-destructive text-[0.6rem] text-destructive"
                        }
                      >
                        {course.grade}
                      </Badge>
                    </td>
                    <td className="p-2">{course.gradePoint}</td>
                    <td className="p-2 text-muted-foreground">{course.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3 text-center">
      <p className="text-[0.65rem] text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

export default function SchoolPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">School</h1>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
          Payments, course forms, and results.
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 p-1 sm:inline-flex sm:w-auto">
          <TabsTrigger value="payment" className="min-h-10 text-[0.7rem] sm:text-xs">
            Payment
          </TabsTrigger>
          <TabsTrigger value="session" className="min-h-10 text-[0.7rem] sm:text-xs">
            Session
          </TabsTrigger>
          <TabsTrigger value="result" className="min-h-10 text-[0.7rem] sm:text-xs">
            Result
          </TabsTrigger>
        </TabsList>
        <TabsContent value="payment" className="mt-4">
          <PaymentTab />
        </TabsContent>
        <TabsContent value="session" className="mt-4">
          <SessionTab />
        </TabsContent>
        <TabsContent value="result" className="mt-4">
          <ResultTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
