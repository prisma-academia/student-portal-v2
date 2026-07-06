import type { Fee, Memo, Student, StudentDocument } from "@/types/student";
import {
  apiGet,
  apiPatch,
  apiPost,
  apiPostPublic,
  apiPostPublicFormData,
  unwrapData,
} from "@/lib/api/client";
import { getConfig } from "@/lib/config";
import { useAuthStore } from "@/stores/auth-store";

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

export async function setupAccountJson(body: Record<string, unknown>) {
  return apiPostPublic<unknown>("/api/v1/student/setup", body);
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
  const list = unwrapData<unknown[]>(res.data);
  return { ...res, data: list } as typeof res & { data: unknown[] };
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

export function receiptPdfUrl(paymentId: string): string {
  const { baseUrl } = getConfig();
  const token = useAuthStore.getState().token;
  const q = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${baseUrl}/api/v1/student/me/receipt/${paymentId}${q}`;
}

export function courseFormPdfUrl(semester: string, yearId: string): string {
  const { baseUrl } = getConfig();
  const token = useAuthStore.getState().token;
  const params = new URLSearchParams({
    semester,
    yearId,
    ...(token ? { token } : {}),
  });
  return `${baseUrl}/api/v1/course/forms?${params.toString()}`;
}

export function resultsPdfUrl(semester: string, yearId: string): string {
  const { baseUrl } = getConfig();
  const token = useAuthStore.getState().token;
  const params = new URLSearchParams({
    semester,
    yearId,
    ...(token ? { token } : {}),
  });
  return `${baseUrl}/api/v1/student/results?${params.toString()}`;
}
