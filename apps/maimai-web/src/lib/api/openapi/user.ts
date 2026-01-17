import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

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
      "Returns the user's play statistics history including play count (current and total), rating, and star count at each distinct play session. Requires authentication via API key or session.",
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
