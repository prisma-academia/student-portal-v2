import { getConfig } from "@/lib/config";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Fetch an authenticated PDF with the Bearer header (never a token in the URL)
 * and hand it to the browser. Throws an Error carrying the API's own message
 * when the server answers with JSON instead of a document.
 */
export async function openPdf(endpoint: string, filename: string): Promise<void> {
  const { baseUrl } = getConfig();
  const token = useAuthStore.getState().token;
  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || !type.includes("pdf")) {
    let message = `Download failed (${res.status})`;
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

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  // Phones handle a download better than a blob tab; desktops get a viewer tab.
  const touch = window.matchMedia("(pointer: coarse)").matches;
  // (No "noopener": it makes window.open return null; a blob: URL is same-origin anyway.)
  const opened = !touch && window.open(url, "_blank");
  if (!opened) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
