import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { userStatsSchema } from "$lib/functions/userStats";

import { z } from "@repo/utils/zod";

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
}

// Schema registration for user-related schemas
export function registerUserSchemas(registry: OpenAPIRegistry) {
  registry.register("UserStats", userStatsSchema);
}
