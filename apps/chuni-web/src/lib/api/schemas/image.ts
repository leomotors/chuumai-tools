import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { z } from "./openapi-zod";

// ImageProxy Query schema
export const imageProxyQuerySchema = z
  .object({
    img: z
      .string()
      .regex(/^[a-zA-Z0-9]+\.(jpg|png)$/)
      .openapi({ example: "jacket_image.png" }),
  })
  .openapi("ImageProxyQuery");

export type ImageProxyQuery = z.infer<typeof imageProxyQuerySchema>;

// Registration function - called only when generating docs
export function registerImageSchemas(registry: OpenAPIRegistry) {
  registry.register("ImageProxyQuery", imageProxyQuerySchema);
}
