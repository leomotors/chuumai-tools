import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { z } from "@repo/utils/zod";

// Common error schema used across all endpoints
export const errorSchema = z
  .object({
    message: z.string().openapi({ example: "Bad Request" }),
  })
  .openapi("Error");

// Registration function - called only when generating docs
export function registerCommonSchemas(registry: OpenAPIRegistry) {
  registry.register("Error", errorSchema);
}
