import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  createJobResponseSchema,
  finishJobFailureSchema,
  finishJobRequestSchema,
  finishJobResponseSchema,
  finishJobSuccessSchema,
} from "@repo/core/web";
import {
  chartSchema,
  historyRecordSchema,
  imgGenInputSchema,
  rarityLevelValues,
} from "@repo/types/maimai";

extendZodWithOpenApi(z);

// Re-export common schemas
export {
  createJobResponseSchema,
  finishJobFailureSchema,
  finishJobRequestSchema,
  finishJobResponseSchema,
  finishJobSuccessSchema,
};

/**
 * Schema for player data to be saved (maimai-specific)
 */
export const savePlayerDataSchema = z
  .object({
    characterImage: z.string(),
    honorText: z.string(),
    honorRarity: z.enum(rarityLevelValues),
    playerName: z.string(),
    courseRank: z.number().int(),
    classRank: z.number().int(),
    rating: z.number().int(),
    star: z.number().int(),
    playCountCurrent: z.number().int(),
    playCountTotal: z.number().int(),
    lastPlayed: z.iso.datetime().openapi({
      description: "Last played timestamp (ISO 8601 format)",
      example: "2026-01-10T12:00:00.000Z",
    }),
  })
  .openapi("SavePlayerData");

/**
 * Schema for rating records (old, new, selection)
 */
export const saveRatingRecordsSchema = z
  .object({
    best: z.array(chartSchema).openapi({
      description: "Old (Best) 35 songs for rating",
    }),
    current: z.array(chartSchema).openapi({
      description: "New (Current) 15 songs for rating",
    }),
    selectionBest: z.array(chartSchema).openapi({
      description: "Selection old candidates",
    }),
    selectionCurrent: z.array(chartSchema).openapi({
      description: "Selection new candidates",
    }),
    allRecords: z.array(chartSchema).openapi({
      description: "All play records",
    }),
    history: z.array(historyRecordSchema).optional(),
  })
  .openapi("SaveRatingRecords");

/**
 * Request schema for saving scrape data
 */
export const saveJobDataRequestSchema = z
  .object({
    jobId: z.number().int().positive().openapi({
      description: "The ID of the job to save data for",
      example: 12345,
    }),
    playerData: savePlayerDataSchema.openapi({
      description: "Player profile and stats data",
    }),
    recordData: saveRatingRecordsSchema.openapi({
      description: "Music records including rating breakdown",
    }),
    playerDataHtml: z.string().openapi({
      description: "Raw HTML from player data page (for debugging)",
    }),
    allMusicRecordHtml: z.string().openapi({
      description: "Raw HTML from music record pages (for debugging)",
    }),
    imgGenInput: imgGenInputSchema.openapi({
      description: "Data formatted for image generation",
    }),
    calculatedRating: z.number().optional().openapi({
      description: "Calculated rating from image generation service",
      example: 15420,
    }),
    version: z.string().openapi({
      description: "Game version",
      example: "CiRCLE",
    }),
  })
  .openapi("SaveJobDataRequest");

/**
 * Response schema for save job data
 */
export const saveJobDataResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: "Whether the data was successfully saved",
      example: true,
    }),
    message: z.string().openapi({
      description: "Confirmation message",
      example: "Job data saved successfully",
    }),
    recordsInserted: z.number().int().openapi({
      description: "Number of music records inserted",
      example: 450,
    }),
  })
  .openapi("SaveJobDataResponse");

/**
 * Register job schemas with OpenAPI
 */
export function registerJobSchemas(registry: OpenAPIRegistry) {
  registry.register("CreateJobResponse", createJobResponseSchema);
  registry.register("FinishJobSuccess", finishJobSuccessSchema);
  registry.register("FinishJobFailure", finishJobFailureSchema);
  registry.register("FinishJobResponse", finishJobResponseSchema);
  registry.register("SavePlayerData", savePlayerDataSchema);
  registry.register("SaveRatingRecords", saveRatingRecordsSchema);
  registry.register("SaveJobDataRequest", saveJobDataRequestSchema);
  registry.register("SaveJobDataResponse", saveJobDataResponseSchema);
}
