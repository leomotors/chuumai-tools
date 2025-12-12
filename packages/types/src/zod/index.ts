import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI support - must be done before any schema definitions
extendZodWithOpenApi(z);

export { z };
