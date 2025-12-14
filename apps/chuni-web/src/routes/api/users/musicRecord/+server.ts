import { error, json } from "@sveltejs/kit";

import { getMusicRecord } from "$lib/functions/musicRecord";
import { getUserIdFromRequest } from "$lib/server/auth";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, locals, url }) => {
  const userId = await getUserIdFromRequest(request, locals);

  const musicIdParam = url.searchParams.get("musicId");

  if (!musicIdParam) {
    error(400, "musicId query parameter is required");
  }

  const musicId = parseInt(musicIdParam, 10);

  if (isNaN(musicId)) {
    error(400, "musicId must be a valid number");
  }

  const musicRecord = await getMusicRecord(userId, musicId);

  return json(musicRecord);
};
