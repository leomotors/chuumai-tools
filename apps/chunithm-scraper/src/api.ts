import createClient from "openapi-fetch";

import { ChuniWeb } from "@repo/api-types";

import { environment } from "./environment.js";

/**
 * Create API client for Chuni Web service
 * Returns null if CHUNI_SERVICE_URL is not configured
 */
export function createApiClient() {
  if (!environment.CHUNI_SERVICE_URL) {
    return null;
  }

  return createClient<ChuniWeb.Paths>({
    baseUrl: environment.CHUNI_SERVICE_URL,
    headers: environment.CHUNI_SERVICE_API_KEY
      ? {
          Authorization: `Bearer ${environment.CHUNI_SERVICE_API_KEY}`,
        }
      : undefined,
  });
}

export type ApiClient = ReturnType<typeof createApiClient>;
