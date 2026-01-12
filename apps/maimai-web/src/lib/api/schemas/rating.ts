import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import {
  chartForRenderSchema,
  chartSchema,
  fullPlayDataInputSchema,
  imgGenInputSchema,
  profileSchema,
  ratingDetailSchema,
  rawImageGenSchema,
} from "@repo/types/maimai";
import { z } from "@repo/types/zod";

// ============================================================================
// Request/Response schemas for rating endpoints
// ============================================================================

// CalcRating Request schema
export const calcRatingRequestSchema = z
  .object({
    data: imgGenInputSchema,
    version: z.string().openapi({ example: "CiRCLE" }),
  })
  .openapi("CalcRatingRequest");

export type CalcRatingRequest = z.infer<typeof calcRatingRequestSchema>;

// PreviewNext Request schema
export const previewNextRequestSchema = z
  .object({
    data: fullPlayDataInputSchema,
    version: z.string().openapi({ example: "CiRCLE" }),
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
  // Imported from @repo/types/maimai
  registry.register("Chart", chartSchema);
  registry.register("Profile", profileSchema);

  // Defined in this file
  registry.register("ChartForRender", chartForRenderSchema);
  registry.register("RatingDetail", ratingDetailSchema);
  registry.register("RawImageGen", rawImageGenSchema);
  registry.register("CalcRatingRequest", calcRatingRequestSchema);
  registry.register("PreviewNextRequest", previewNextRequestSchema);
  registry.register("PreviewNextResponse", previewNextResponseSchema);
}
