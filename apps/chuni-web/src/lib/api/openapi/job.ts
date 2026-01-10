import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { z } from "@repo/types/zod";

import { errorSchema } from "../schemas/common";
import {
  createJobResponseSchema,
  finishJobRequestSchema,
  finishJobResponseSchema,
  saveJobDataRequestSchema,
  saveJobDataResponseSchema,
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

  // POST /api/jobs/finish
  registry.registerPath({
    method: "post",
    path: "/api/jobs/finish",
    tags: ["Jobs"],
    summary: "Finish a scraping job",
    description:
      "Finish a scraping job by adding log (or error message if failed). Requires API key authentication.",
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

  // POST /api/jobs/data
  registry.registerPath({
    method: "post",
    path: "/api/jobs/data",
    tags: ["Jobs"],
    summary: "Save scraping data to database",
    description:
      "Saves all scraped data including player profile, music records, and rating breakdowns to the database. Requires API key authentication.",
    security: [{ [API_KEY_SECURITY_SCHEME]: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: saveJobDataRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Data saved successfully",
        content: {
          "application/json": {
            schema: saveJobDataResponseSchema,
          },
        },
      },
      400: {
        description:
          "Bad request - Invalid request body, job not found, or job doesn't belong to user",
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
