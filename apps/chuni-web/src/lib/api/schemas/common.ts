import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { z } from "@repo/utils/zod";

// Common error schema used across all endpoints
export const errorSchema = z
  .object({
    message: z.string().openapi({ example: "Bad Request" }),
  })
  .openapi("Error");

// Version query schema for endpoints that accept version parameter
export const versionQuerySchema = z
  .object({
    version: z.string().openapi({
      examples: ["XVRS", "VRS"],
      description: "Game version identifier",
    }),
  })
  .openapi("VersionQuery");

export type VersionQuery = z.infer<typeof versionQuerySchema>;

// Registration function - called only when generating docs
export function registerCommonSchemas(registry: OpenAPIRegistry) {
  registry.register("Error", errorSchema);
  registry.register("VersionQuery", versionQuerySchema);
}
