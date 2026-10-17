/** Relative luminance (WCAG) of a #rrggbb colour. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: number, b: number): number {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Text colour to sit on a tenant's primary colour: white unless a near-black
 * ink reads better (e.g. a yellow or light green school colour).
 */
export function foregroundOn(hex: string): string {
  const l = luminance(hex);
  const white = contrast(l, 1);
  const ink = contrast(l, luminance("#1f1a17"));
  return white >= 3 || white >= ink ? "#ffffff" : "#1f1a17";
}
