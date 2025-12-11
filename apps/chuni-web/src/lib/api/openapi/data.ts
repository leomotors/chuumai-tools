import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { errorSchema, versionQuerySchema } from "$lib/api/schemas/common";
import { musicDataViewSchema } from "$lib/functions/musicData";

export function registerDataRoutes(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/musicData",
    tags: ["Data"],
    summary: "Get music data by version",
    description:
      "Retrieve all music data including chart information for a specific game version",
    request: {
      query: versionQuerySchema,
    },
    responses: {
      200: {
        description: "Music data successfully retrieved",
        content: {
          "application/json": {
            schema: musicDataViewSchema.array(),
          },
        },
      },
      400: {
        description: "Bad request - invalid or missing version parameter",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  });
}
