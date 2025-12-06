import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { z } from "@repo/utils/zod";

// Extend Zod with OpenAPI support - must be done before any schema definitions
extendZodWithOpenApi(z);

// Re-export all schemas for convenient imports
export * from "./common";
export * from "./image";
export * from "./rating";
