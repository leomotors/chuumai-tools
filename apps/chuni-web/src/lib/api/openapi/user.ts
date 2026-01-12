import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { forRatingSchema } from "$lib/functions/forRating";
import { musicRecordSchema } from "$lib/functions/musicRecord";
import { playCountSinceSchema } from "$lib/functions/playCount";
import { userStatsSchema } from "$lib/functions/userStats";

import {
  API_KEY_SECURITY_SCHEME,
  SECURITY_SCHEMES,
  SESSION_SECURITY_SCHEME,
} from "@repo/core/web";
import { z } from "@repo/types/zod";

import { errorSchema } from "../schemas/common";

// Registration function - called only when generating docs
export function registerUserRoutes(registry: OpenAPIRegistry) {
  // Register security schemes
  registry.registerComponent(
    "securitySchemes",
    API_KEY_SECURITY_SCHEME,
    SECURITY_SCHEMES[API_KEY_SECURITY_SCHEME],
  );

  registry.registerComponent(
    "securitySchemes",
    SESSION_SECURITY_SCHEME,
    SECURITY_SCHEMES[SESSION_SECURITY_SCHEME],
  );

  // GET /api/users/stats
  registry.registerPath({
    method: "get",
    path: "/api/users/stats",
    tags: ["Users"],
    summary: "Get user play stats history",
    description:
      "Returns the user's play statistics history including player level, play count, rating, and overpower value at each distinct play session. Requires authentication via API key or session.",
    security: [
      { [API_KEY_SECURITY_SCHEME]: [] },
      { [SESSION_SECURITY_SCHEME]: [] },
    ],
    responses: {
      200: {
        description: "User stats successfully retrieved",
        content: {
          "application/json": {
            schema: z.array(userStatsSchema),
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
    },
  });

  // GET /api/users/forRating
  registry.registerPath({
    method: "get",
    path: "/api/users/forRating",
    tags: ["Users"],
    summary: "Get user rating breakdown with profile",
    description:
      "Returns the user's complete rating data including profile information, best 30 songs, current 20 songs, and calculated rating averages. This endpoint provides all data needed for rating display and image generation. Requires authentication via API key or session.",
    security: [
      { [API_KEY_SECURITY_SCHEME]: [] },
      { [SESSION_SECURITY_SCHEME]: [] },
    ],
    responses: {
      200: {
        description:
          "Rating breakdown with profile successfully retrieved. Includes profile data, best 30 songs (BEST rating type), current 20 songs (CURRENT rating type), and rating averages.",
        content: {
          "application/json": {
            schema: forRatingSchema,
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
      404: {
        description: "Not Found - No rating data found for this user",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  });

  // GET /api/users/musicRecord
  registry.registerPath({
    method: "get",
    path: "/api/users/musicRecord",
    tags: ["Users"],
    summary: "Get user music record",
    description:
      "Returns the user's play records for a specific music ID across all difficulties. Requires authentication via API key or session.",
    security: [
      { [API_KEY_SECURITY_SCHEME]: [] },
      { [SESSION_SECURITY_SCHEME]: [] },
    ],
    request: {
      query: z.object({
        musicId: z.number().int().openapi({
          description: "The music ID to retrieve records for",
          example: 2844,
        }),
      }),
    },
    responses: {
      200: {
        description: "Music record successfully retrieved",
        content: {
          "application/json": {
            schema: musicRecordSchema,
          },
        },
      },
      400: {
        description: "Bad Request - Invalid or missing musicId parameter",
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
      404: {
        description: "Not Found - Music not found",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  });

  // GET /api/users/playCount
  registry.registerPath({
    method: "get",
    path: "/api/users/playCount",
    tags: ["Users"],
    summary: "Get play count since various time periods",
    description:
      "Returns the number of plays since today (7AM JST), this week (Monday 7AM JST), this month (1st day 7AM JST), last 30 days, and last 365 days.\nOptionally accepts a currentPlayCount parameter to use for calculation instead of the latest value from the database.\nRequires authentication via API key or session.",
    security: [
      { [API_KEY_SECURITY_SCHEME]: [] },
      { [SESSION_SECURITY_SCHEME]: [] },
    ],
    request: {
      query: z.object({
        currentPlayCount: z.number().int().nonnegative().optional().openapi({
          description:
            "Optional current play count to use for calculation. If not provided, the latest play count from the database will be used.",
        }),
      }),
    },
    responses: {
      200: {
        description:
          "Play count statistics successfully retrieved. Returns the number of plays since various time periods.",
        content: {
          "application/json": {
            schema: playCountSinceSchema,
          },
        },
      },
      400: {
        description:
          "Bad Request - Invalid currentPlayCount parameter (must be a non-negative integer)",
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
    },
  });
}

// Schema registration for user-related schemas
export function registerUserSchemas(registry: OpenAPIRegistry) {
  registry.register("UserStats", userStatsSchema);
  registry.register("ForRatingResult", forRatingSchema);
  registry.register("MusicRecord", musicRecordSchema);
  registry.register("PlayCountSince", playCountSinceSchema);
}
