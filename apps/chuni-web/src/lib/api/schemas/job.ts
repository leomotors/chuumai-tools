import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  chartSchemaWithFullChain,
  imgGenInputSchema,
  rarityLevelValues,
  teamRarityLevelValues,
} from "@repo/types/chuni";

extendZodWithOpenApi(z);

/**
 * Response schema for job creation
 */
export const createJobResponseSchema = z
  .object({
    jobId: z.number().int().positive().openapi({
      description: "The unique identifier for the created job",
      example: 12345,
    }),
    jobStart: z.iso.datetime().openapi({
      description: "The timestamp when the job was created (ISO 8601 format)",
      example: "2026-01-10T12:00:00.000Z",
    }),
  })
  .openapi("CreateJobResponse");

/**
 * Base request schema for finishing a job with success
 */
export const finishJobSuccessSchema = z
  .object({
    jobId: z.number().int().positive().openapi({
      description: "The ID of the job to finish",
      example: 12345,
    }),
    status: z.literal("success").openapi({
      description: "Status discriminator for successful job completion",
    }),
    jobLog: z.string().openapi({
      description: "Execution logs from the job",
      example: "Step 1: Login completed\nStep 2: Data fetched successfully",
    }),
  })
  .openapi("FinishJobSuccess");

/**
 * Base request schema for finishing a job with failure
 */
export const finishJobFailureSchema = z
  .object({
    jobId: z.number().int().positive().openapi({
      description: "The ID of the job to finish",
      example: 12345,
    }),
    status: z.literal("failure").openapi({
      description: "Status discriminator for failed job completion",
    }),
    jobError: z.string().openapi({
      description: "Error message or stack trace from the failed job",
      example: "Error: Failed to connect to database",
    }),
    jobLog: z.string().optional().openapi({
      description: "Execution logs from the job (if any were captured)",
      example: "Step 1: Login completed\nStep 2: Connection failed",
    }),
  })
  .openapi("FinishJobFailure");

/**
 * Union schema for job finish request
 */
export const finishJobRequestSchema = z.discriminatedUnion("status", [
  finishJobSuccessSchema,
  finishJobFailureSchema,
]);

/**
 * Response schema for job finish
 */
export const finishJobResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: "Whether the job was successfully marked as finished",
      example: true,
    }),
    message: z.string().openapi({
      description: "Confirmation message",
      example: "Job 12345 finished successfully",
    }),
  })
  .openapi("FinishJobResponse");

/**
 * Schema for player data to be saved
 */
export const savePlayerDataSchema = z
  .object({
    characterRarity: z.enum(rarityLevelValues),
    characterImage: z.string(),
    teamName: z.string().nullable(),
    teamEmblem: z.enum(teamRarityLevelValues).nullable(),
    mainHonorText: z.string(),
    mainHonorRarity: z.enum(rarityLevelValues),
    subHonor1Text: z.string().nullable(),
    subHonor1Rarity: z.enum(rarityLevelValues).nullable(),
    subHonor2Text: z.string().nullable(),
    subHonor2Rarity: z.enum(rarityLevelValues).nullable(),
    playerLevel: z.number().int(),
    playerName: z.string(),
    classBand: z.number().int().nullable(),
    classEmblem: z.number().int().nullable(),
    rating: z.number(),
    overpowerValue: z.number(),
    overpowerPercent: z.number(),
    lastPlayed: z.iso.datetime().openapi({
      description: "Last played timestamp (ISO 8601 format)",
      example: "2026-01-10T12:00:00.000Z",
    }),
    currentCurrency: z.number().int(),
    totalCurrency: z.number().int(),
    playCount: z.number().int(),
  })
  .openapi("SavePlayerData");

/**
 * Schema for rating records (best, current, selection)
 */
export const saveRatingRecordsSchema = z
  .object({
    best: z.array(chartSchemaWithFullChain).openapi({
      description: "Best 30 songs for rating",
    }),
    current: z.array(chartSchemaWithFullChain).openapi({
      description: "Recent 20 songs for rating",
    }),
    selectionBest: z.array(chartSchemaWithFullChain).openapi({
      description: "Selection best candidates",
    }),
    selectionCurrent: z.array(chartSchemaWithFullChain).openapi({
      description: "Selection current candidates",
    }),
    allRecords: z.array(chartSchemaWithFullChain).openapi({
      description: "All play records",
    }),
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
      example: 16.4521,
    }),
    version: z.string().openapi({
      description: "Game version",
      example: "XVRS",
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
