import { error, json } from "@sveltejs/kit";

import { getMusicDataCached } from "$lib/functions/musicData";
import { getEnabledVersions } from "$lib/version";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const enabledVersions = getEnabledVersions();

  const version = url.searchParams.get("version");

  if (!version) {
    error(400, "Version parameter is required");
  }

  if (!enabledVersions.includes(version)) {
    error(
      400,
      `Invalid version. Valid versions are: ${enabledVersions.join(", ")}`,
    );
  }

  return json(await getMusicDataCached(version));
};
