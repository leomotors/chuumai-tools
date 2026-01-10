import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

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
 * Register job schemas with OpenAPI
 */
export function registerJobSchemas(registry: OpenAPIRegistry) {
  registry.register("CreateJobResponse", createJobResponseSchema);
  registry.register("FinishJobSuccess", finishJobSuccessSchema);
  registry.register("FinishJobFailure", finishJobFailureSchema);
  registry.register("FinishJobResponse", finishJobResponseSchema);
}
