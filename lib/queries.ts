"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchCourseFormSummary,
  fetchDocuments,
  fetchEvents,
  fetchFees,
  fetchMe,
  fetchMemos,
  fetchResultsSummary,
} from "@/lib/api/student";
import { useAuthStore } from "@/stores/auth-store";
import type { Fee, Student } from "@/types/student";

/** Shared query keys so Home, Payments and Academics reuse one cache. */
export const qk = {
  me: ["student", "me"] as const,
  fees: ["student", "fees"] as const,
  results: ["student", "results-summary"] as const,
  events: ["student", "events"] as const,
  memos: ["student", "memos"] as const,
  documents: ["student", "documents"] as const,
  courseForms: ["student", "course-form-summary"] as const,
};

async function unwrap<T>(p: Promise<{ ok: boolean; data: T | null; message: string }>) {
  const res = await p;
  if (!res.ok) throw new Error(res.message);
  return res.data as T;
}

/**
 * The signed-in student, fresh from GET /student/me. Seeds from the persisted
 * login copy so the photo and name render instantly, then keeps the store in sync.
 */
export function useStudent() {
  const cached = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: qk.me,
    queryFn: async () => {
      const me = await unwrap(fetchMe() as Promise<{ ok: boolean; data: Student | null; message: string }>);
      setUser(me);
      return me;
    },
    placeholderData: cached ?? undefined,
    staleTime: 5 * 60_000,
  });
}

export function useFees() {
  return useQuery({ queryKey: qk.fees, queryFn: () => unwrap(fetchFees()) });
}

export function useResults() {
  return useQuery({ queryKey: qk.results, queryFn: () => unwrap(fetchResultsSummary()) });
}

export function useEvents() {
  return useQuery({ queryKey: qk.events, queryFn: () => unwrap(fetchEvents()) });
}

export function useMemos() {
  return useQuery({ queryKey: qk.memos, queryFn: () => unwrap(fetchMemos()) });
}

export function useDocuments() {
  return useQuery({ queryKey: qk.documents, queryFn: () => unwrap(fetchDocuments()) });
}

export function useCourseForms() {
  return useQuery({ queryKey: qk.courseForms, queryFn: () => unwrap(fetchCourseFormSummary()) });
}

/** Outstanding vs settled fees, outstanding sorted by due date. */
export function splitFees(fees: Fee[] | undefined) {
  const all = fees ?? [];
  const outstanding = all
    .filter((f) => !f.isPaid)
    .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime());
  const paid = all
    .filter((f) => f.isPaid)
    .sort(
      (a, b) =>
        new Date(b.userPayment?.createdAt ?? 0).getTime() -
        new Date(a.userPayment?.createdAt ?? 0).getTime(),
    );
  const owed = outstanding.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const settled = paid.reduce(
    (sum, f) => sum + (Number(f.userPayment?.amount ?? f.amount) || 0),
    0,
  );
  return { outstanding, paid, owed, settled };
}

/** "Overdue" when the API says so or the due date has passed. */
export function isOverdue(fee: Fee) {
  if (fee.isPaid) return false;
  if (fee.status?.toLowerCase() === "overdue") return true;
  return fee.dueDate ? new Date(fee.dueDate).getTime() < Date.now() : false;
}
