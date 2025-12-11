import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";

import {
  registerCommonSchemas,
  registerImageSchemas,
  registerRatingSchemas,
} from "../schemas";
import { registerDataRoutes } from "./data";
import { registerImageRoutes } from "./image";
import { registerRatingRoutes } from "./rating";

export function generateOpenApiDocument(version: string) {
  // Create a fresh registry for each generation
  const registry = new OpenAPIRegistry();

  // Register all schemas
  registerCommonSchemas(registry);
  registerRatingSchemas(registry);
  registerImageSchemas(registry);

  // Register all routes
  registerRatingRoutes(registry);
  registerImageRoutes(registry);
  registerDataRoutes(registry);

  // Generate the document
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Chuni Web API",
      version,
      description: "API documentation for Chuni Web application",
    },
    servers: [
      {
        url: "/",
        description: "Current server",
      },
    ],
    tags: [
      {
        name: "Rating",
        description: "Endpoints related to rating calculations",
      },
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
