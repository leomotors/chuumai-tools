import { error, json } from "@sveltejs/kit";

import { env } from "$env/dynamic/private";
import {
  getMusicDataCached,
  updateMusicLevel,
  updateMusicLevelRequestSchema,
} from "$lib/functions/musicData";
import { getEnabledVersions } from "$lib/version";

import { isAdminUser } from "@repo/core/web";

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
      `Invalid version ${version}. Valid versions are: ${enabledVersions.join(", ")}`,
    );
  }

  return json(await getMusicDataCached(version));
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth();

  if (!session?.user?.id) {
    error(401, "Unauthorized");
  }

  if (!isAdminUser(session.user.id, env.ADMIN_USER_ID)) {
    error(403, "Forbidden");
  }

  const parsed = updateMusicLevelRequestSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    error(400, "Invalid request body");
  }

  if (!getEnabledVersions().includes(parsed.data.version)) {
    error(400, "Invalid version");
  }

  await updateMusicLevel(parsed.data);

  return json({ status: "success" });
};
