import millify from "millify";

export function formatNaira(amount: number | string | undefined): string {
  const num = typeof amount === "number" ? amount : Number(amount ?? 0);
  return `₦${millify(num, { precision: 2, locales: "en-NG" })}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
