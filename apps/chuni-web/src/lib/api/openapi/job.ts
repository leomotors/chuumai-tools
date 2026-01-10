import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { z } from "@repo/types/zod";

import { errorSchema } from "../schemas/common";
import {
  createJobResponseSchema,
  finishJobRequestSchema,
  finishJobResponseSchema,
} from "../schemas/job";

// Security scheme name for API key authentication
export const API_KEY_SECURITY_SCHEME = "BearerAuth";

/**
 * Register job management routes with OpenAPI
 */
export function registerJobRoutes(registry: OpenAPIRegistry) {
  // POST /api/jobs/create
  registry.registerPath({
    method: "post",
    path: "/api/jobs/create",
    tags: ["Jobs"],
    summary: "Create a new scraping job",
    description:
      "Creates a new job entry in the database to track a scraping session. Returns the job ID and start timestamp. This endpoint is used by the scraper at the beginning of execution. Requires API key authentication.",
    security: [{ [API_KEY_SECURITY_SCHEME]: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({}),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Job created successfully",
        content: {
          "application/json": {
            schema: createJobResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing API key",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  });

  // PUT /api/jobs/finish
  registry.registerPath({
    method: "put",
    path: "/api/jobs/finish",
    tags: ["Jobs"],
    summary: "Finish a scraping job",
    description:
      "Updates a job entry to mark it as completed or failed. Use the 'success' status to record successful completion with logs, or 'failure' status to record errors. The status field acts as a discriminator. Requires API key authentication.",
    security: [{ [API_KEY_SECURITY_SCHEME]: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: finishJobRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Job finished successfully",
        content: {
          "application/json": {
            schema: finishJobResponseSchema,
          },
        },
      },
      400: {
        description: "Bad request - Invalid request body or job ID not found",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing API key",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  });
}
