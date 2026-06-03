import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { z } from "@repo/types/zod";

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
}
