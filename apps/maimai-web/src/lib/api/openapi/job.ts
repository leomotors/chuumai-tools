import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { API_KEY_SECURITY_SCHEME, SESSION_SECURITY_SCHEME } from "@repo/core/web";
import { z } from "@repo/types/zod";

import { errorSchema } from "../schemas/common";
import {
  createJobResponseSchema,
  finishJobRequestSchema,
  finishJobResponseSchema,
  ratingBreakdownImageQuerySchema,
  ratingBreakdownImageStatusResponseSchema,
  saveJobDataRequestSchema,
  saveJobDataResponseSchema,
  uploadRatingBreakdownImageRequestSchema,
  uploadRatingBreakdownImageResponseSchema,
} from "../schemas/job";

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

  // POST /api/jobs/ratingBreakdownImage
  registry.registerPath({
    method: "post",
    path: "/api/jobs/ratingBreakdownImage",
    tags: ["Jobs"],
    summary: "Upload generated rating breakdown image",
    description:
      "Uploads the generated rating breakdown image for a scraping job. Requires API key authentication.",
    security: [{ [API_KEY_SECURITY_SCHEME]: [] }],
    request: {
      body: {
        content: {
          "multipart/form-data": {
            schema: uploadRatingBreakdownImageRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Image uploaded successfully",
        content: {
          "application/json": {
            schema: uploadRatingBreakdownImageResponseSchema,
          },
        },
      },
      400: {
        description:
          "Bad request - Invalid upload, job not found, or job doesn't belong to user",
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

  // GET /api/jobs/ratingBreakdownImage
  registry.registerPath({
    method: "get",
    path: "/api/jobs/ratingBreakdownImage",
    tags: ["Jobs"],
    summary: "Check rating breakdown image",
    description:
      "Checks whether a scraping job has an uploaded rating breakdown image. Requires API key authentication or an active session.",
    security: [
      { [API_KEY_SECURITY_SCHEME]: [] },
      { [SESSION_SECURITY_SCHEME]: [] },
    ],
    request: {
      query: ratingBreakdownImageQuerySchema,
    },
    responses: {
      200: {
        description: "Image status checked successfully",
        content: {
          "application/json": {
            schema: ratingBreakdownImageStatusResponseSchema,
          },
        },
      },
      400: {
        description: "Bad request - Invalid query or job ID not found",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing API key/session",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      403: {
        description: "Forbidden - Job doesn't belong to user",
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

  // GET /api/jobs/ratingBreakdownImage/file
  registry.registerPath({
    method: "get",
    path: "/api/jobs/ratingBreakdownImage/file",
    tags: ["Jobs"],
    summary: "Retrieve rating breakdown image",
    description:
      "Retrieves the uploaded rating breakdown image for a scraping job from private storage. Requires API key authentication or an active session.",
    security: [
      { [API_KEY_SECURITY_SCHEME]: [] },
      { [SESSION_SECURITY_SCHEME]: [] },
    ],
    request: {
      query: ratingBreakdownImageQuerySchema,
    },
    responses: {
      200: {
        description: "Image returned successfully",
        content: {
          "image/png": {
            schema: z.string().openapi({ format: "binary" }),
          },
        },
      },
      400: {
        description: "Bad request - Invalid query or job ID not found",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      401: {
        description: "Unauthorized - Invalid or missing API key/session",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      403: {
        description: "Forbidden - Job doesn't belong to user",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      404: {
        description: "Rating breakdown image not found",
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
