import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";

import {
  registerCommonSchemas,
  registerDataSchemas,
  registerImageSchemas,
} from "../schemas";
import { registerDataRoutes } from "./data";
import { registerImageRoutes } from "./image";

export function generateOpenApiDocument(version: string) {
  // Create a fresh registry for each generation
  const registry = new OpenAPIRegistry();

  // Register all schemas
  registerCommonSchemas(registry);
  registerDataSchemas(registry);
  registerImageSchemas(registry);

  // Register all routes
  registerImageRoutes(registry);
  registerDataRoutes(registry);

  // Generate the document
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Maimai Web API",
      version,
      description: "API documentation for Maimai Web application",
    },
    servers: [
      {
        url: "/",
        description: "Current server",
      },
    ],
    tags: [
      {
        name: "Images",
        description: "Endpoints related to image proxying",
      },
      {
        name: "Data",
        description: "Endpoints for game data retrieval",
      },
    ],
  });
}
