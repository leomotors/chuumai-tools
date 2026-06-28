export function isMissingSortValue(value: unknown): boolean {
  return value == null || value === "";
}

export function compareSortableValues(
  aVal: unknown,
  bVal: unknown,
  sortDirection: "asc" | "desc",
  tiebreaker = 0,
): number {
  const aMissing = isMissingSortValue(aVal);
  const bMissing = isMissingSortValue(bVal);

  if (aMissing && bMissing) return tiebreaker;
  if (aMissing) return 1;
  if (bMissing) return -1;

  const comparison =
    typeof aVal === "number" && typeof bVal === "number"
      ? aVal - bVal
      : String(aVal).localeCompare(String(bVal));

  if (comparison === 0) return tiebreaker;
  return sortDirection === "asc" ? comparison : -comparison;
}
