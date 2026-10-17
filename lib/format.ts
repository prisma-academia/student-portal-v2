import millify from "millify";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Exact amount, e.g. ₦105,500. Use for anything a student pays or is owed. */
export function formatNaira(amount: number | string | undefined): string {
  const num = typeof amount === "number" ? amount : Number(amount ?? 0);
  return naira.format(Number.isFinite(num) ? num : 0);
}

/** Compact amount for tight spaces, e.g. ₦105.5K. */
export function formatNairaShort(amount: number | string | undefined): string {
  const num = typeof amount === "number" ? amount : Number(amount ?? 0);
  return `₦${millify(num, { precision: 1, locales: "en-NG" })}`;
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "in 3 days", "yesterday", "2 months ago". */
export function formatRelative(dateString: string | undefined | null): string {
  if (!dateString) return "";
  const d = new Date(dateString).getTime();
  if (Number.isNaN(d)) return "";
  const diff = d - Date.now();
  const abs = Math.abs(diff);
  const day = 86_400_000;
  if (abs < 60 * 60_000) return rtf.format(Math.round(diff / 60_000), "minute");
  if (abs < day) return rtf.format(Math.round(diff / 3_600_000), "hour");
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), "day");
  if (abs < 365 * day) return rtf.format(Math.round(diff / (30 * day)), "month");
  return rtf.format(Math.round(diff / (365 * day)), "year");
}

export function formatGpa(value: number | null | undefined, decimals = 2) {
  return value === null || value === undefined ? "—" : value.toFixed(decimals);
}

/** "Rumasau Aliyu" from personal info. */
export function fullName(p?: { firstName?: string; middleName?: string; lastName?: string }) {
  return [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim();
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Title-case names the registry stored in capitals ("RUMASAU" → "Rumasau"). */
export function displayName(raw: string): string {
  if (raw !== raw.toUpperCase()) return raw;
  return raw.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}
