import type {
  AcademicSummary,
  CourseFormAvailability,
  Fee,
  FeeStatement,
  Memo,
  ResitOverview,
  ResitRegistration,
  SchoolEvent,
  Student,
  StudentDocument,
} from "@/types/student";
import { toFeeStatement } from "@/lib/fee-statement";
import {
  apiGet,
  apiPatch,
  apiPost,
  apiPostPublic,
  apiPostPublicFormData,
  unwrapData,
} from "@/lib/api/client";

export type LoginBody =
  | { email: string; password: string; persistent?: boolean }
  | { regNumber: string; password: string; persistent?: boolean };

export type LoginResponse = {
  ok?: boolean;
  data?: { student?: Student; token?: string; refreshToken?: string };
  mustChangePassword?: boolean;
  redirectTo?: string;
  message?: string;
};

export async function login(body: LoginBody) {
  return apiPostPublic<LoginResponse>("/api/v1/student/login", body);
}

export async function setupAccountFormData(formData: FormData) {
  return apiPostPublicFormData<unknown>("/api/v1/student/setup", formData);
}

export async function forgotPassword(body: {
  email: string;
  regNumber: string;
}) {
  return apiPostPublic<{ ok?: boolean; message?: string }>(
    "/api/v1/student/forgot-password",
    body,
  );
}

export async function resetPassword(token: string, password: string) {
  const q = new URLSearchParams({ token });
  return apiPostPublic<{ ok?: boolean; message?: string }>(
    `/api/v1/student/reset-password?${q.toString()}`,
    { password },
  );
}

export async function changePassword(body: {
  email?: string;
  regNumber?: string;
  currentPassword: string;
  newPassword: string;
}) {
  return apiPostPublic<{ ok?: boolean; message?: string }>(
    "/api/v1/student/change-password",
    body,
  );
}

export async function fetchMe() {
  const res = await apiGet<unknown>("/api/v1/student/me");
  if (!res.ok) return res;
  const student = unwrapData<Student>(res.data);
  return { ...res, data: student as unknown } as typeof res & {
    data: Student;
  };
}

export async function patchMe(payload: {
  personalInfo?: Student["personalInfo"];
  contactInfo?: Student["contactInfo"];
  guardianInfo?: Student["guardianInfo"];
}) {
  const res = await apiPatch<unknown>("/api/v1/student/me", payload);
  if (!res.ok) return res;
  const student = unwrapData<Student>(res.data);
  return { ...res, data: student as unknown } as typeof res & {
    data: Student;
  };
}

export async function fetchEvents() {
  const res = await apiGet<unknown>("/api/v1/student/me/events");
  if (!res.ok) return res;
  const list = unwrapData<SchoolEvent[]>(res.data);
  return { ...res, data: list } as typeof res & { data: SchoolEvent[] };
}

export async function fetchMemos() {
  const res = await apiGet<unknown>("/api/v1/student/me/memos");
  if (!res.ok) return res;
  const list = unwrapData<Memo[]>(res.data);
  return { ...res, data: list } as typeof res & { data: Memo[] };
}

export async function fetchDocuments() {
  const res = await apiGet<unknown>("/api/v1/student/me/documents");
  if (!res.ok) return res;
  const list = unwrapData<StudentDocument[]>(res.data);
  return { ...res, data: list } as typeof res & { data: StudentDocument[] };
}

export async function fetchFees() {
  const res = await apiGet<unknown>("/api/v1/student/me/fees");
  if (!res.ok) return res;
  const list = unwrapData<Fee[]>(res.data);
  return { ...res, data: list } as typeof res & { data: Fee[] };
}

/**
 * Fees across sessions with totals, arrears and where the student was each session
 * (`session`: "all" or a session id). Older APIs ignore `session` and answer with a
 * plain array; that is read into a statement too (`legacy: true`).
 */
export async function fetchFeeStatement(session = "all") {
  const res = await apiGet<unknown>(`/api/v1/student/me/fees?${new URLSearchParams({ session })}`);
  if (!res.ok) return res;
  const statement = toFeeStatement(unwrapData<unknown>(res.data));
  return { ...res, data: statement } as typeof res & { data: FeeStatement };
}

/** Failed courses the student can resit, and their resit registrations. */
export async function fetchResits() {
  const res = await apiGet<unknown>("/api/v1/student/me/resits");
  if (!res.ok) return res;
  const inner = unwrapData<Partial<ResitOverview> | null>(res.data);
  const data: ResitOverview = {
    session: inner?.session ?? null,
    courses: Array.isArray(inner?.courses) ? inner.courses : [],
    registrations: Array.isArray(inner?.registrations) ? inner.registrations : [],
  };
  return { ...res, data } as typeof res & { data: ResitOverview };
}

export type ResitRegistered = { registration: ResitRegistration; feeId: string; total: number };

/** The API's own success message ("Registered for 2 resit(s)…"), if it sent one. */
function serverMessage(body: unknown, fallback: string) {
  const message = (body as { message?: unknown } | null)?.message;
  return typeof message === "string" && message ? message : fallback;
}

/** Register to resit failed results; answers with the fee to pay (POST /payment/initialize). */
export async function registerResits(resultIds: string[]) {
  const res = await apiPost<unknown>("/api/v1/student/me/resits", { resultIds });
  if (!res.ok) return res;
  const data = unwrapData<ResitRegistered>(res.data);
  return { ...res, data, message: serverMessage(res.data, "Registered for resit") } as typeof res & {
    data: ResitRegistered;
  };
}

/** Cancel an unpaid resit registration. */
export async function cancelResit(registrationId: string) {
  const res = await apiPost<unknown>(
    `/api/v1/student/me/resits/${encodeURIComponent(registrationId)}/cancel`,
    {},
  );
  if (!res.ok) return res;
  return { ...res, message: serverMessage(res.data, "Resit registration cancelled") };
}

export async function initializePayment(feeId: string) {
  const res = await apiPost<unknown>("/api/v1/payment/initialize", {
    fee: feeId,
  });
  if (!res.ok) return res;
  const inner = unwrapData<{ authorizationUrl?: string }>(res.data);
  return {
    ...res,
    data: inner,
  } as typeof res & { data: { authorizationUrl?: string } };
}

export async function verifyPayment(reference: string) {
  return apiPostPublic<unknown>("/api/v1/payment/verify", { reference });
}

/** Paths for authenticated PDFs; open them with <PdfButton> (in-app viewer). */
export const pdfPaths = {
  receipt: (paymentId: string) => `/api/v1/student/me/receipt/${paymentId}`,
  courseForm: (semester: string, yearId: string) =>
    `/api/v1/student/me/course-form?${new URLSearchParams({ semester, yearId })}`,
  /** One exact sitting (session + semester); the level is a fallback for older APIs. */
  resultSlip: (semester: string, sitting: { sessionId?: string; yearId?: string }) =>
    `/api/v1/student/me/results?${new URLSearchParams({
      semester,
      ...(sitting.sessionId ? { sessionId: sitting.sessionId } : {}),
      ...(sitting.yearId ? { yearId: sitting.yearId } : {}),
    })}`,
  transcript: () => "/api/v1/student/me/transcript",
};

/** Which level + semester course forms have courses (and can be printed). */
export async function fetchCourseFormSummary() {
  const res = await apiGet<unknown>("/api/v1/student/me/course-form-summary");
  if (!res.ok) return res;
  const inner = unwrapData<{ items?: CourseFormAvailability[] }>(res.data);
  return { ...res, data: inner?.items ?? [] } as typeof res & {
    data: CourseFormAvailability[];
  };
}

/** Published results: sittings, GPA, CGPA, class of award, outstanding courses. */
export async function fetchResultsSummary() {
  const res = await apiGet<unknown>("/api/v1/student/me/results-summary");
  if (!res.ok) return res;
  const summary = unwrapData<AcademicSummary>(res.data);
  return { ...res, data: summary as unknown } as typeof res & {
    data: AcademicSummary;
  };
}
