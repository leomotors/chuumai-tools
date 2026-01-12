import createClient from "openapi-fetch";

import { MaimaiWeb } from "@repo/api-types";

import { environment } from "./environment.js";

/**
 * Create API client for Chuni Web service
 * Returns null if CHUNI_SERVICE_URL is not configured
 */
export function createApiClient() {
  if (!environment.MAIMAI_SERVICE_URL) {
    return null;
  }

  return createClient<MaimaiWeb.Paths>({
    baseUrl: environment.MAIMAI_SERVICE_URL,
    headers: environment.MAIMAI_SERVICE_API_KEY
      ? {
          Authorization: `Bearer ${environment.MAIMAI_SERVICE_API_KEY}`,
        }
      : undefined,
  });
}

export type ApiClient = ReturnType<typeof createApiClient>;

export const apiClient = createApiClient();
