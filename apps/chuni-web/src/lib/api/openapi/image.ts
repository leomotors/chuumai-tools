import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { z } from "@repo/types/zod";

import { imageProxyQuerySchema } from "../schemas/image";

// Registration function - called only when generating docs
export function registerImageRoutes(registry: OpenAPIRegistry) {
  // GET /api/imageProxy
  registry.registerPath({
    method: "get",
    path: "/api/imageProxy",
    summary: "Proxy for music images",
    description:
      "Proxies requests for music cover images to internal S3 bucket. Returns the image with appropriate caching headers.",
    tags: ["Images"],
    request: {
      query: imageProxyQuerySchema,
    },
    responses: {
      200: {
        description: "Image returned successfully",
        content: {
          "image/jpeg": {
            schema: z.string().openapi({ format: "binary" }),
          },
          "image/png": {
            schema: z.string().openapi({ format: "binary" }),
          },
        },
      },
      400: {
        description: "Invalid image parameter or not an image",
        content: {
          "text/plain": {
            schema: z.string().openapi({ example: "Bad Request" }),
          },
        },
      },
    },
  });
}
