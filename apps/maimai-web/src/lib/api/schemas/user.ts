import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { userStatsSchema } from "$lib/functions/userStats";

/**
 * Register all user-related schemas with the OpenAPI registry
 */
export function registerUserSchemas(registry: OpenAPIRegistry) {
  registry.register("UserStats", userStatsSchema);
}
