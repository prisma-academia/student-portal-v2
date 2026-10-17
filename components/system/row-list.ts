/**
 * Statement-style list: hairline rules on the page ground, no boxed card.
 * Bleeds to the screen edge on phones/tablets so rows read like a native list
 * and row content lines up with section headings (rows use px-4 / sm:px-5).
 * On desktop the rules stay inside the layout grid (two-column pages).
 */
export const rowList =
  "-mx-4 divide-y border-y border-[color-mix(in_oklch,var(--border)_90%,transparent)] sm:-mx-5 lg:mx-0";

/** Row padding that pairs with rowList. */
export const rowPad = "px-4 sm:px-5";
