import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import {
  chartForRenderSchema,
  chartSchema,
  fullPlayDataInputSchema,
  hiddenChartSchema,
  imgGenInputSchema,
  profileSchema,
  rawImageGenSchema,
} from "@repo/types/chuni";
import { z } from "@repo/utils/zod";

// ============================================================================
// Schemas defined in this file
// ============================================================================

// CalcRating Request schema
export const calcRatingRequestSchema = z
  .object({
    data: imgGenInputSchema,
    version: z.string().openapi({ example: "XVRS" }),
  })
  .openapi("CalcRatingRequest");

export type CalcRatingRequest = z.infer<typeof calcRatingRequestSchema>;

// PreviewNext Request schema
export const previewNextRequestSchema = z
  .object({
    data: fullPlayDataInputSchema,
    version: z.string().openapi({ example: "XVRS" }),
  })
  .openapi("PreviewNextRequest");

export type PreviewNextRequest = z.infer<typeof previewNextRequestSchema>;

// PreviewNext Response schema
export const previewNextResponseSchema = z
  .object({
    profile: profileSchema,
    best: z.array(chartSchema),
    current: z.array(chartSchema),
  })
  .openapi("PreviewNextResponse");

export type PreviewNextResponse = z.infer<typeof previewNextResponseSchema>;

// ============================================================================
// Registration function - called only when generating docs
// ============================================================================
export function registerRatingSchemas(registry: OpenAPIRegistry) {
  // Imported from @repo/types/chuni
  registry.register("Chart", chartSchema);
  registry.register("Profile", profileSchema);
  registry.register("HiddenChart", hiddenChartSchema);

  // Imported from @repo/types/chuni
  registry.register("ChartForRender", chartForRenderSchema);
  registry.register("CalcRatingResponse", rawImageGenSchema);

  // Defined in this file
  registry.register("CalcRatingRequest", calcRatingRequestSchema);
  registry.register("PreviewNextRequest", previewNextRequestSchema);
  registry.register("PreviewNextResponse", previewNextResponseSchema);
}
