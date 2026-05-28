import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { z } from "@repo/types/zod";

import { OPENAPI_TAGS } from "./openapi";

export const CHUNI_WEB_APP_NAME = "chuni-web";
export const MAIMAI_WEB_APP_NAME = "maimai-web";

export const CHUNI_MINIMUM_SCRAPER_VERSION = "6.0.0";
export const MAIMAI_MINIMUM_SCRAPER_VERSION = "1.0.0";

export const appInfoSchema = z
  .object({
    appName: z.enum([CHUNI_WEB_APP_NAME, MAIMAI_WEB_APP_NAME]).openapi({
      description: "Application name",
      examples: [CHUNI_WEB_APP_NAME, MAIMAI_WEB_APP_NAME],
    }),
    version: z.string().openapi({
      description: "Application version",
      example: "1.0.0",
    }),
    minimumScraperVersion: z.string().openapi({
      description: "Minimum scraper version supported by this application",
      example: "1.0.0",
    }),
  })
  .openapi("AppInfo");

export type AppInfo = z.infer<typeof appInfoSchema>;

export function registerAppInfoSchemas(registry: OpenAPIRegistry) {
  registry.register("AppInfo", appInfoSchema);
}

export function registerAppInfoRoute(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "get",
    path: "/api/appInfo",
    tags: [OPENAPI_TAGS.APP.name],
    summary: "Get application information",
    description:
      "Returns the application name, application version, and minimum scraper version required by this application.",
    responses: {
      200: {
        description: "Application information returned successfully",
        content: {
          "application/json": {
            schema: appInfoSchema,
          },
        },
      },
    },
  });
}
