import type { Page } from "playwright";

import type { AppInfo } from "../web/appInfo";

export * from "./ratingBreakdownImage";

export async function fetchPath(
  page: Page,
  path: string,
  method = "GET",
  headers?: Record<string, string>,
  body?: RequestInit["body"],
) {
  const response = await page.evaluate(
    async ({ fetchPath, method, headers, body }) => {
      const response = await fetch(fetchPath, {
        method,
        headers,
        body,
      });
      const text = await response.text();

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        text,
      };
    },
    { fetchPath: `${path}`, method, headers, body },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${path}: ${response.status} ${response.statusText}, content: ${response.text}`,
    );
  }

  return response.text;
}

type ParsedSemver = [major: number, minor: number, patch: number];

function parseSemver(version: string): ParsedSemver | null {
  const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);

  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function isVersionAtLeast(version: string, minimumVersion: string) {
  const parsedVersion = parseSemver(version);
  const parsedMinimumVersion = parseSemver(minimumVersion);

  if (!parsedVersion || !parsedMinimumVersion) {
    return false;
  }

  for (let i = 0; i < parsedVersion.length; i++) {
    if (parsedVersion[i] > parsedMinimumVersion[i]) {
      return true;
    }

    if (parsedVersion[i] < parsedMinimumVersion[i]) {
      return false;
    }
  }

  return true;
}

export function getScraperAppCompatibilityError({
  appInfo,
  expectedAppName,
  scraperName,
  scraperVersion,
}: {
  appInfo: AppInfo;
  expectedAppName: AppInfo["appName"];
  scraperName: string;
  scraperVersion: string;
}) {
  if (appInfo.appName !== expectedAppName) {
    return [
      "Connected to the wrong Chuumai Tools app.",
      `${scraperName} expected ${expectedAppName}, but the server reported ${appInfo.appName}.`,
      "Check the service URL environment variable before running again.",
    ].join("\n");
  }

  if (!isVersionAtLeast(scraperVersion, appInfo.minimumScraperVersion)) {
    return [
      "Scraper version is not supported by this Chuumai Tools app.",
      `${scraperName} is ${scraperVersion}, but ${appInfo.appName} requires scraper version ${appInfo.minimumScraperVersion} or newer.`,
      "Update the scraper before running again.",
    ].join("\n");
  }

  return null;
}

export function formatScraperAppCompatibilityError(message: string) {
  return [
    "",
    "============================================================",
    "CHUUMAI TOOLS APP COMPATIBILITY CHECK FAILED",
    "============================================================",
    message,
    "============================================================",
  ].join("\n");
}
