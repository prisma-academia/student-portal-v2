import type {
  AcademicSummary,
  CourseFormAvailability,
  Fee,
  Memo,
  SchoolEvent,
  Student,
  StudentDocument,
} from "@/types/student";
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

/** Paths for authenticated PDF downloads; open them with openPdf() (lib/api/download.ts). */
export const pdfPaths = {
  receipt: (paymentId: string) => `/api/v1/student/me/receipt/${paymentId}`,
  courseForm: (semester: string, yearId: string) =>
    `/api/v1/student/me/course-form?${new URLSearchParams({ semester, yearId })}`,
  resultSlip: (semester: string, yearId: string) =>
    `/api/v1/student/me/results?${new URLSearchParams({ semester, yearId })}`,
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
