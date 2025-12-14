import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { forRatingSchema } from "$lib/functions/forRating";
import { musicRecordSchema } from "$lib/functions/musicRecord";
import { userStatsSchema } from "$lib/functions/userStats";

import { z } from "@repo/types/zod";

import { errorSchema } from "../schemas/common";

// Security scheme name for API key authentication
export const API_KEY_SECURITY_SCHEME = "BearerAuth";
export const SESSION_SECURITY_SCHEME = "SessionAuth";

// Registration function - called only when generating docs
export function registerUserRoutes(registry: OpenAPIRegistry) {
  // Register security schemes
  registry.registerComponent("securitySchemes", API_KEY_SECURITY_SCHEME, {
    type: "http",
    scheme: "bearer",
    bearerFormat: "API Key",
    description:
      "API key for authentication. Can be generated from dashboard. Use format: Authorization: Bearer <api-key>",
  });

  registry.registerComponent("securitySchemes", SESSION_SECURITY_SCHEME, {
    type: "apiKey",
    in: "cookie",
    name: "authjs.session-token",
    description: "Session cookie from Auth.js login.",
  });

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
        musicId: z.coerce.number().int().openapi({
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
}

// Schema registration for user-related schemas
export function registerUserSchemas(registry: OpenAPIRegistry) {
  registry.register("UserStats", userStatsSchema);
  registry.register("ForRatingResult", forRatingSchema);
  registry.register("MusicRecord", musicRecordSchema);
}
