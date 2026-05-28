import createClient, { type Client } from "openapi-fetch";

import { MaimaiWeb } from "@repo/api-types";
import {
  formatScraperAppCompatibilityError,
  getScraperAppCompatibilityError,
} from "@repo/core/scraper";
import { type AppInfo, MAIMAI_WEB_APP_NAME } from "@repo/core/web";

import { environment } from "./environment.js";

/**
 * Create API client for Maimai Web service
 * Returns null if MAIMAI_SERVICE_URL is not configured
 */
export type ApiClient = Client<MaimaiWeb.Paths> | null;

export function createApiClient(): ApiClient {
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

async function getAppInfoResponse(apiClient: Client<MaimaiWeb.Paths>) {
  try {
    return await apiClient.GET("/api/appInfo");
  } catch (err) {
    throw new Error(
      formatScraperAppCompatibilityError(
        [
          "Could not reach or parse application information from the configured Maimai Web service.",
          `Service URL: ${environment.MAIMAI_SERVICE_URL}`,
          `Error: ${err}`,
        ].join("\n"),
      ),
      { cause: err },
    );
  }
}

export async function checkServiceCompatibility(
  apiClient: ApiClient = createApiClient(),
): Promise<AppInfo | null> {
  if (!apiClient) {
    return null;
  }

  const response = await getAppInfoResponse(apiClient);

  if (!response.response.ok || !response.data) {
    throw new Error(
      formatScraperAppCompatibilityError(
        [
          "Could not read Maimai Web application information.",
          `Service URL: ${environment.MAIMAI_SERVICE_URL}`,
          `HTTP: ${response.response.status} ${response.response.statusText}`,
        ].join("\n"),
      ),
    );
  }

  const compatibilityError = getScraperAppCompatibilityError({
    appInfo: response.data,
    expectedAppName: MAIMAI_WEB_APP_NAME,
    scraperName: "maimai-scraper",
    scraperVersion: APP_VERSION,
  });

  if (compatibilityError) {
    throw new Error(formatScraperAppCompatibilityError(compatibilityError));
  }

  return response.data;
}

export const apiClient = createApiClient();
