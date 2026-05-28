import createClient, { type Client } from "openapi-fetch";

import { ChuniWeb } from "@repo/api-types";
import {
  formatScraperAppCompatibilityError,
  getScraperAppCompatibilityError,
} from "@repo/core/scraper";
import { type AppInfo, CHUNI_WEB_APP_NAME } from "@repo/core/web";

import { environment } from "./environment.js";

/**
 * Create API client for Chuni Web service
 * Returns null if CHUNI_SERVICE_URL is not configured
 */
export type ApiClient = Client<ChuniWeb.Paths> | null;

export function createApiClient(): ApiClient {
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

async function getAppInfoResponse(apiClient: Client<ChuniWeb.Paths>) {
  try {
    return await apiClient.GET("/api/appInfo");
  } catch (err) {
    throw new Error(
      formatScraperAppCompatibilityError(
        [
          "Could not reach or parse application information from the configured Chuni Web service.",
          `Service URL: ${environment.CHUNI_SERVICE_URL}`,
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
          "Could not read Chuni Web application information.",
          `Service URL: ${environment.CHUNI_SERVICE_URL}`,
          `HTTP: ${response.response.status} ${response.response.statusText}`,
        ].join("\n"),
      ),
    );
  }

  const compatibilityError = getScraperAppCompatibilityError({
    appInfo: response.data,
    expectedAppName: CHUNI_WEB_APP_NAME,
    scraperName: "chunithm-scraper",
    scraperVersion: APP_VERSION,
  });

  if (compatibilityError) {
    throw new Error(formatScraperAppCompatibilityError(compatibilityError));
  }

  return response.data;
}
