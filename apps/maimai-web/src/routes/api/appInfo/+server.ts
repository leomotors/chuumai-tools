import { json } from "@sveltejs/kit";

import {
  MAIMAI_MINIMUM_SCRAPER_VERSION,
  MAIMAI_WEB_APP_NAME,
} from "@repo/core/web";

import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  return json({
    appName: MAIMAI_WEB_APP_NAME,
    version: WEB_VERSION,
    minimumScraperVersion: MAIMAI_MINIMUM_SCRAPER_VERSION,
  });
};
