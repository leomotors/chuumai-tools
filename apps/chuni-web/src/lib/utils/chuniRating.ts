/**
 * Pick the most precise rating value to display.
 *
 * `rating` is the source of truth (2dp, what chuni shows). `calculatedRating`
 * is computed from B30/N20 entries (up to 4dp) and is preferred when it
 * truncates to the source-of-truth value — i.e. when it falls in the
 * half-open interval `[rating, rating + 0.01)`. Otherwise the data is
 * inconsistent (missing/wrong song scores), so fall back to `rating`.
 */
export function resolveChuniRating(
  rating: string,
  calculatedRating: string | null,
): number {
  const r = parseFloat(rating);
  if (calculatedRating === null) return r;
  const c = parseFloat(calculatedRating);
  return c >= r && c < r + 0.01 ? c : r;
}

/**
 * Format a chuni rating value (or rating delta). Shows 4 decimals only when
 * the extra precision is meaningful (i.e. the value isn't representable in 2dp).
 */
export function formatChuniRating(value: number): string {
  const rounded2 = Math.round(value * 100) / 100;
  if (Math.abs(value - rounded2) < 1e-9) return value.toFixed(2);
  return value.toFixed(4);
}
