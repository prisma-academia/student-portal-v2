import { getConfig } from "@/lib/config";
import { useAuthStore } from "@/stores/auth-store";

export type ApiResult<T> =
  | { ok: true; data: T; message: string }
  | { ok: false; data: null; message: string };

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function redirectSignIn() {
  if (typeof window !== "undefined") {
    window.location.href = "/auth/sign-in";
  }
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  skipAuth = false,
): Promise<ApiResult<T>> {
  const { baseUrl } = getConfig();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = useAuthStore.getState().token;

  const headers = new Headers(options.headers);
  if (!skipAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = (await parseBody(response)) as T | Record<string, unknown> | null;

    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().logOut();
        redirectSignIn();
        return {
          ok: false,
          data: null,
          message: "Unauthorized",
        };
      }
      const msg =
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : `HTTP error ${response.status}`;
      return { ok: false, data: null, message: msg };
    }

    return {
      ok: true,
      data: data as T,
      message: "Request successful",
    };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Network error";
    return { ok: false, data: null, message };
  }
}

export function apiGet<T = unknown>(endpoint: string) {
  return apiRequest<T>(endpoint, { method: "GET" });
}

export function apiPost<T = unknown>(endpoint: string, body: unknown) {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

export function apiPatch<T = unknown>(endpoint: string, body: unknown) {
  return apiRequest<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

export function apiPostPublic<T = unknown>(endpoint: string, body: unknown) {
  return apiRequest<T>(
    endpoint,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    },
    true,
  );
}

export function apiPostPublicFormData<T = unknown>(
  endpoint: string,
  formData: FormData,
) {
  return apiRequest<T>(endpoint, { method: "POST", body: formData }, true);
}

/** Query envelope `{ ok, data }` from backend JSON body */
export function unwrapData<T>(body: unknown): T {
  if (Array.isArray(body)) return body as T;
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    (body as { ok?: boolean }).ok === true
  ) {
    return (body as { data: T }).data;
  }
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}
