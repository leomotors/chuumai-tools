import { z } from "@repo/types/zod";

/**
 * Shared validation for admin edits to a single chart's level & constant.
 *
 * Used both client-side (to validate the edit form before sending) and
 * server-side (to validate the request body), so the two web apps agree on
 * what a valid chart edit looks like.
 */
export const chartLevelEditSchema = z.object({
  level: z
    .string()
    .trim()
    .min(1, "Level is required")
    .max(8, "Level is too long"),
  constant: z
    .number()
    .min(0, "Constant must be at least 0")
    .max(20, "Constant must be at most 20")
    .nullable(),
});

export type ChartLevelEdit = z.infer<typeof chartLevelEditSchema>;

/**
 * Parse a raw constant input (from an admin edit form) into a number rounded
 * to one decimal place, or `null` when the field is left blank / "-". Accepts
 * numbers as well as strings since binding to a number input yields
 * `number | null | undefined` at runtime.
 *
 * Throws when the value is present but not a finite number so the caller can
 * surface a friendly message.
 */
export function parseConstantInput(
  raw: string | number | null | undefined,
): number | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) {
      throw new Error("Constant must be a number");
    }

    return Math.round(raw * 10) / 10;
  }

  const trimmed = raw.trim();

  if (trimmed === "" || trimmed === "-") {
    return null;
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    throw new Error("Constant must be a number");
  }

  return Math.round(value * 10) / 10;
}
