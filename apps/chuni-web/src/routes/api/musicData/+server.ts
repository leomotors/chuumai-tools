import { error, json } from "@sveltejs/kit";

import { env } from "$env/dynamic/public";
import { getMusicDataCached } from "$lib/functions/musicData";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  if (!env.PUBLIC_ENABLED_VERSION) {
    error(503, "PUBLIC_ENABLED_VERSION is not set");
  }

  const version = url.searchParams.get("version");

  if (!version) {
    error(400, "Version parameter is required");
  }

  const enabledVersions = env.PUBLIC_ENABLED_VERSION.split(",");
  if (!enabledVersions.includes(version)) {
    error(
      400,
      `Invalid version. Valid versions are: ${enabledVersions.join(", ")}`,
    );
  }

  return json(await getMusicDataCached(version));
};
