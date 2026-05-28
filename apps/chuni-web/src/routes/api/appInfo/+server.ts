import { json } from "@sveltejs/kit";

import {
  CHUNI_MINIMUM_SCRAPER_VERSION,
  CHUNI_WEB_APP_NAME,
} from "@repo/core/web";

import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  return json({
    appName: CHUNI_WEB_APP_NAME,
    version: WEB_VERSION,
    minimumScraperVersion: CHUNI_MINIMUM_SCRAPER_VERSION,
  });
};
