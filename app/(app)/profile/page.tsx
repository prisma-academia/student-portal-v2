"use client";

import { IconKey } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { IdCard } from "@/components/student/id-card";
import { PageHeader } from "@/components/system/page-header";
import { QueryErrorPanel } from "@/components/system/query-error-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { levelLabel } from "@/lib/academic-levels";
import { patchMe } from "@/lib/api/student";
import { formatDate } from "@/lib/format";
import { qk, useStudent } from "@/lib/queries";
import { useAuthStore } from "@/stores/auth-store";
import type { Student } from "@/types/student";

type Form = {
  personalInfo: { firstName: string; lastName: string; middleName: string; dateOfBirth: string };
  contactInfo: { phone: string; email: string; address: string; state: string; lga: string };
  guardianInfo: { guardianName: string; guardianPhone: string; relationship: string };
};

function toForm(p: Student | undefined): Form {
  return {
    personalInfo: {
      firstName: p?.personalInfo?.firstName ?? "",
      lastName: p?.personalInfo?.lastName ?? "",
      middleName: p?.personalInfo?.middleName ?? "",
      dateOfBirth: p?.personalInfo?.dateOfBirth
        ? new Date(p.personalInfo.dateOfBirth).toISOString().slice(0, 10)
        : "",
    },
    contactInfo: {
      phone: p?.contactInfo?.phone ?? "",
      email: p?.contactInfo?.email ?? p?.email ?? "",
      address: p?.contactInfo?.address ?? "",
      state: p?.contactInfo?.state ?? "",
      lga: p?.contactInfo?.lga ?? "",
    },
    guardianInfo: {
      guardianName: p?.guardianInfo?.guardianName ?? "",
      guardianPhone: p?.guardianInfo?.guardianPhone ?? "",
      relationship: p?.guardianInfo?.relationship ?? "",
    },
  };
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="bg-card rounded-[var(--radius-xl)] border p-4 sm:p-6">
      <h2 className="text-base font-bold">{title}</h2>
      {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  className,
  ...input
}: React.ComponentProps<typeof Input> & { id: string; label: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...input} />
    </div>
  );
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const q = useStudent();
  const initial = useMemo(() => toForm(q.data), [q.data]);
  // Unsaved edits layered over the stored record; null means "showing the record".
  const [edits, setEdits] = useState<Form | null>(null);
  const form = edits ?? initial;
  const dirty = edits !== null && JSON.stringify(edits) !== JSON.stringify(initial);

  const set =
    <G extends keyof Form>(group: G, field: keyof Form[G]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEdits((prev) => {
        const base = prev ?? initial;
        return { ...base, [group]: { ...base[group], [field]: value } };
      });
    };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await patchMe(form);
      if (!res.ok) throw new Error(res.message);
      return res.data as Student;
    },
    onSuccess: (updated) => {
      toast.success("Profile saved");
      queryClient.setQueryData(qk.me, updated);
      setUser(updated);
      setEdits(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const student = q.data;

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      <PageHeader
        title="My profile"
        description="Keep your contact details current so the school can reach you."
        actions={
          <Button asChild variant="outline">
            <Link href="/auth/change-password">
              <IconKey />
              Change password
            </Link>
          </Button>
        }
      />

      {q.isError && !student ? (
        <QueryErrorPanel message={q.error.message} onRetry={() => q.refetch()} />
      ) : !student ? (
        <Skeleton className="h-48 w-full rounded-[1.5rem]" />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start">
          <div className="order-2 flex flex-col gap-4 lg:sticky lg:top-24 lg:order-1">
            <IdCard student={student} />
            <section className="bg-card rounded-[var(--radius-xl)] border p-4 sm:p-5">
              <h2 className="text-base font-bold">School record</h2>
              <p className="text-muted-foreground text-sm">Set by the registry. Contact them to correct these.</p>
              <dl className="mt-3 divide-y text-sm">
                {[
                  ["Reg number", <span key="r" className="num font-semibold">{student.regNumber}</span>],
                  ["Programme", student.program?.name ?? "—"],
                  ["Level", student.classLevel?.level != null ? levelLabel(student.classLevel.level) : "—"],
                  ["Set", student.classLevel?.set ?? "—"],
                  ["Sign-in email", student.email ?? "—"],
                  ["Enrolled", formatDate(student.enrollmentDate)],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-muted-foreground shrink-0">{k}</dt>
                    <dd className="min-w-0 truncate text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <form
            className="order-1 flex flex-col gap-4 lg:order-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (dirty) mutation.mutate();
            }}
          >
            <Section title="Contact" description="How the school reaches you.">
              <Field id="phone" label="Phone number" type="tel" autoComplete="tel" inputMode="tel" value={form.contactInfo.phone} onChange={set("contactInfo", "phone")} />
              <Field id="email" label="Email" type="email" autoComplete="email" value={form.contactInfo.email} onChange={set("contactInfo", "email")} />
              <Field id="address" label="Home address" autoComplete="street-address" className="sm:col-span-2" value={form.contactInfo.address} onChange={set("contactInfo", "address")} />
              <Field id="state" label="State" autoComplete="address-level1" value={form.contactInfo.state} onChange={set("contactInfo", "state")} />
              <Field id="lga" label="LGA" value={form.contactInfo.lga} onChange={set("contactInfo", "lga")} />
            </Section>

            <Section title="Next of kin" description="Who the school contacts in an emergency.">
              <Field id="guardianName" label="Full name" autoComplete="off" value={form.guardianInfo.guardianName} onChange={set("guardianInfo", "guardianName")} />
              <Field id="relationship" label="Relationship" placeholder="e.g. Mother" value={form.guardianInfo.relationship} onChange={set("guardianInfo", "relationship")} />
              <Field id="guardianPhone" label="Phone number" type="tel" inputMode="tel" className="sm:col-span-2" value={form.guardianInfo.guardianPhone} onChange={set("guardianInfo", "guardianPhone")} />
            </Section>

            <Section title="Personal" description="Your name and date of birth as on your school record.">
              <Field id="firstName" label="First name" autoComplete="given-name" value={form.personalInfo.firstName} onChange={set("personalInfo", "firstName")} />
              <Field id="lastName" label="Last name" autoComplete="family-name" value={form.personalInfo.lastName} onChange={set("personalInfo", "lastName")} />
              <Field id="middleName" label="Middle name" autoComplete="additional-name" value={form.personalInfo.middleName} onChange={set("personalInfo", "middleName")} />
              <Field id="dob" label="Date of birth" type="date" autoComplete="bday" value={form.personalInfo.dateOfBirth} onChange={set("personalInfo", "dateOfBirth")} />
            </Section>

            {/* Save bar: floats above the bottom nav on phones once something changed. */}
            <AnimatePresence>
              {dirty ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-card/95 fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-30 flex items-center justify-between gap-3 rounded-[var(--radius-xl)] border p-2.5 pl-4 shadow-[var(--shadow-lift)] backdrop-blur md:static md:inset-auto md:justify-end md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none"
                >
                  <p className="text-sm font-medium md:hidden">Unsaved changes</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => setEdits(null)} disabled={mutation.isPending}>
                      Discard
                    </Button>
                    <Button type="submit" loading={mutation.isPending}>
                      {mutation.isPending ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </form>
        </div>
      )}
    </div>
  );
}
