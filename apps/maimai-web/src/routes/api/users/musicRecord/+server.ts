import { error, json } from "@sveltejs/kit";

import { getMusicRecord } from "$lib/functions/musicRecord";
import { getUserIdFromRequest } from "$lib/server/auth";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, locals, url }) => {
  const userId = await getUserIdFromRequest(request, locals);

  const musicTitle = url.searchParams.get("musicTitle");

  if (!musicTitle) {
    error(400, "musicTitle query parameter is required");
  }

  const musicRecord = await getMusicRecord(userId, musicTitle);

  return json(musicRecord);
};
