import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { z } from "@repo/types/zod";

export const JOB_LIST_DEFAULT_LIMIT = 25;
export const JOB_LIST_LIMIT_STEP = 25;
export const JOB_LIST_MAX_LIMIT = 250;

export function parseJobListLimit(value: string | null) {
  if (value === null) return JOB_LIST_DEFAULT_LIMIT;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return JOB_LIST_DEFAULT_LIMIT;

  return Math.min(
    JOB_LIST_MAX_LIMIT,
    Math.max(JOB_LIST_DEFAULT_LIMIT, Math.floor(parsed)),
  );
}

export function getNextJobListLimit(currentLimit: number, hasMore: boolean) {
  if (!hasMore || currentLimit >= JOB_LIST_MAX_LIMIT) return null;

  return Math.min(JOB_LIST_MAX_LIMIT, currentLimit + JOB_LIST_LIMIT_STEP);
}

/**
 * Response schema for job creation
 * Common to both Chunithm and maimai
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
 * Multipart request schema for uploading a generated rating breakdown image.
 */
export const uploadRatingBreakdownImageRequestSchema = z
  .object({
    jobId: z.number().int().positive().openapi({
      description: "The ID of the job to attach the image to",
      example: 12345,
    }),
    image: z.string().openapi({
      description: "Generated rating breakdown image file",
      format: "binary",
    }),
  })
  .openapi("UploadRatingBreakdownImageRequest");

/**
 * Response schema for rating breakdown image uploads.
 */
export const uploadRatingBreakdownImageResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: "Whether the image was successfully saved",
      example: true,
    }),
    message: z.string().openapi({
      description: "Confirmation message",
      example: "Rating breakdown image uploaded successfully",
    }),
    byteSize: z.number().int().nonnegative().openapi({
      description: "Uploaded image size in bytes",
      example: 123456,
    }),
    imageKey: z.string().openapi({
      description: "S3 object key where the image was stored",
      example: "ratingBreakdownImages/1234567890/12345.png",
    }),
  })
  .openapi("UploadRatingBreakdownImageResponse");

/**
 * Query schema for rating breakdown image lookup.
 */
export const ratingBreakdownImageQuerySchema = z
  .object({
    jobId: z.coerce.number().int().positive().openapi({
      description: "The ID of the job to check or retrieve an image for",
      example: 12345,
    }),
  })
  .openapi("RatingBreakdownImageQuery");

/**
 * Query schema for authenticated job log lookup.
 */
export const jobLogQuerySchema = z
  .object({
    jobId: z.coerce.number().int().positive().openapi({
      description: "The ID of the job to retrieve logs for",
      example: 12345,
    }),
  })
  .openapi("JobLogQuery");

/**
 * Query schema for authenticated full play data download.
 */
export const jobFullDataQuerySchema = z
  .object({
    jobId: z.coerce.number().int().positive().openapi({
      description: "The ID of the job to download full play data for",
      example: 12345,
    }),
  })
  .openapi("JobFullDataQuery");

/**
 * Response schema for authenticated job log lookup.
 */
export const jobLogResponseSchema = z
  .object({
    jobId: z.number().int().positive().openapi({
      description: "The ID of the job",
      example: 12345,
    }),
    jobError: z.string().nullable().openapi({
      description: "Error text captured by a failed scraper job",
      example: "Error: Failed to connect to database",
    }),
    jobLog: z.string().nullable().openapi({
      description: "Execution logs captured by the scraper job",
      example: "Step 1: Login completed\nStep 2: Data fetched successfully",
    }),
  })
  .openapi("JobLogResponse");

/**
 * Response schema for rating breakdown image status.
 */
export const ratingBreakdownImageStatusResponseSchema = z
  .object({
    jobId: z.number().int().positive().openapi({
      description: "The ID of the job that was checked",
      example: 12345,
    }),
    hasImage: z.boolean().openapi({
      description: "Whether the job has an uploaded rating breakdown image",
      example: true,
    }),
    imageUrl: z.string().nullable().openapi({
      description:
        "Authenticated API URL to retrieve the image, or null when no image exists",
      example: "/api/jobs/ratingBreakdownImage/file?jobId=12345",
    }),
  })
  .openapi("RatingBreakdownImageStatusResponse");

/**
 * Register common job schemas with OpenAPI
 */
export function registerCommonJobSchemas(registry: OpenAPIRegistry) {
  registry.register("CreateJobResponse", createJobResponseSchema);
  registry.register("FinishJobSuccess", finishJobSuccessSchema);
  registry.register("FinishJobFailure", finishJobFailureSchema);
  registry.register("FinishJobResponse", finishJobResponseSchema);
  registry.register(
    "UploadRatingBreakdownImageRequest",
    uploadRatingBreakdownImageRequestSchema,
  );
  registry.register(
    "UploadRatingBreakdownImageResponse",
    uploadRatingBreakdownImageResponseSchema,
  );
  registry.register(
    "RatingBreakdownImageQuery",
    ratingBreakdownImageQuerySchema,
  );
  registry.register(
    "RatingBreakdownImageStatusResponse",
    ratingBreakdownImageStatusResponseSchema,
  );
  registry.register("JobLogQuery", jobLogQuerySchema);
  registry.register("JobLogResponse", jobLogResponseSchema);
  registry.register("JobFullDataQuery", jobFullDataQuerySchema);
}
