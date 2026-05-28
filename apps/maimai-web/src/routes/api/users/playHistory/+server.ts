import { error, json } from "@sveltejs/kit";

import { getPlayHistory } from "$lib/functions/playHistory";
import { getUserIdFromRequest } from "$lib/server/auth";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, locals, url }) => {
  const userId = await getUserIdFromRequest(request, locals);

  const musicTitle = url.searchParams.get("musicTitle");

  if (!musicTitle) {
    error(400, "musicTitle query parameter is required");
  }

  const playHistory = await getPlayHistory(userId, musicTitle);

  return json(playHistory);
};
