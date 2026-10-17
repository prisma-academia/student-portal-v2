import { getConfig } from "@/lib/config";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Fetch an authenticated PDF with the Bearer header (never a token in the URL).
 * Throws an Error carrying the API's own message when the server answers with
 * JSON instead of a document.
 */
export async function fetchPdf(endpoint: string, signal?: AbortSignal): Promise<Blob> {
  const { baseUrl } = getConfig();
  const token = useAuthStore.getState().token;
  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    signal,
  });

  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || !type.includes("pdf")) {
    let message = `Couldn't load the document (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      // Not JSON: keep the status message.
    }
    if (res.status === 401) {
      useAuthStore.getState().logOut();
      window.location.href = "/auth/sign-in";
    }
    throw new Error(message);
  }
  return res.blob();
}

export function pdfFileName(filename: string) {
  return filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
}

/** Save an already-fetched PDF to the device. */
export function savePdf(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = pdfFileName(filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
