import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { rawImageGenSchema } from "@repo/types/chuni";

import { errorSchema } from "../schemas/common";
import {
  calcRatingRequestSchema,
  previewNextRequestSchema,
  previewNextResponseSchema,
} from "../schemas/rating";

// Registration function - called only when generating docs
export function registerRatingRoutes(registry: OpenAPIRegistry) {
  // POST /api/calcRating
  registry.registerPath({
    method: "post",
    path: "/api/calcRating",
    summary: "Calculate rating from play data",
    description:
      "Calculates the player rating based on their best 30 and current 20 songs. Returns processed chart data with ratings.",
    tags: ["Rating"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: calcRatingRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully calculated rating",
        content: {
          "application/json": {
            schema: rawImageGenSchema,
          },
        },
      },
      400: {
        description: "Invalid input data or version",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
      503: {
        description: "Service unavailable - version configuration missing",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  });

  // POST /api/previewNext
  registry.registerPath({
    method: "post",
    path: "/api/previewNext",
    summary: "Preview next version rating calculation",
    description:
      "Calculates what the player rating would be in the next version based on all records.",
    tags: ["Rating"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: previewNextRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully calculated preview rating",
        content: {
          "application/json": {
            schema: previewNextResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid input data or version",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  });
}
