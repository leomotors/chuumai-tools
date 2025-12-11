import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { chartLevelSchema } from "$lib/functions/musicData";

export function registerDataSchemas(registry: OpenAPIRegistry) {
  registry.register("ChartLevel", chartLevelSchema);
}
