import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import {
  chartSchema,
  fullPlayDataInputSchema,
  imgGenInputSchema,
  profileSchema,
} from "@repo/types/maimai";
import { z } from "@repo/types/zod";

// ============================================================================
// ChartForRender - extends base chart with rating calculation info
// ============================================================================

export const chartForRenderSchema = chartSchema
  .extend({
    level: z.number(),
    levelSure: z.boolean(),
    rating: z.number().nullable(),
    image: z.string().nullable(),
  })
  .openapi("ChartForRender");

export type ChartForRender = z.infer<typeof chartForRenderSchema>;

// ============================================================================
// RawImageGen - processed data ready for image generation
// ============================================================================

export const ratingDetailSchema = z
  .object({
    bestSum: z.number().int().openapi({
      description: "Sum of best 35 songs rating",
      example: 14520,
    }),
    currentSum: z.number().int().openapi({
      description: "Sum of current 15 songs rating",
      example: 6230,
    }),
    total: z.number().int().openapi({
      description: "Total rating (bestSum + currentSum)",
      example: 20750,
    }),
  })
  .openapi("RatingDetail");

export const rawImageGenSchema = z
  .object({
    profile: profileSchema,
    best: z.array(chartForRenderSchema).openapi({
      description: "Best 35 songs with rating info",
    }),
    current: z.array(chartForRenderSchema).openapi({
      description: "Current 15 songs with rating info",
    }),
    rating: ratingDetailSchema,
  })
  .openapi("RawImageGen");

export type RawImageGen = z.infer<typeof rawImageGenSchema>;

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
