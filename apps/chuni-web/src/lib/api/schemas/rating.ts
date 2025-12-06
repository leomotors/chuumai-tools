import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { chartForRenderSchema, rawImageGenSchema } from "$lib/types";

import {
  chartSchema,
  fullPlayDataInputSchema,
  hiddenChartSchema,
  imgGenInputSchema,
  profileSchema,
} from "@repo/types/chuni";

import { z } from "./openapi-zod";

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

// Registration function - called only when generating docs
export function registerRatingSchemas(registry: OpenAPIRegistry) {
  registry.register("Chart", chartSchema.openapi("Chart"));
  registry.register("Profile", profileSchema.openapi("Profile"));
  registry.register("HiddenChart", hiddenChartSchema.openapi("HiddenChart"));
  registry.register(
    "ChartForRender",
    chartForRenderSchema.openapi("ChartForRender"),
  );
  registry.register("CalcRatingRequest", calcRatingRequestSchema);
  registry.register(
    "CalcRatingResponse",
    rawImageGenSchema.openapi("CalcRatingResponse"),
  );
  registry.register("PreviewNextRequest", previewNextRequestSchema);
  registry.register("PreviewNextResponse", previewNextResponseSchema);
}
