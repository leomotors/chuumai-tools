import { json } from "@sveltejs/kit";

import { getPlayCountSince } from "$lib/functions/playCount";
import { getUserIdFromRequest } from "$lib/server/auth";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, locals, url }) => {
  const userId = await getUserIdFromRequest(request, locals);

  // Get optional currentPlayCount query parameter
  const currentPlayCountParam = url.searchParams.get("currentPlayCount");
  let currentPlayCount: number | undefined;

  if (currentPlayCountParam) {
    currentPlayCount = parseInt(currentPlayCountParam, 10);

    if (isNaN(currentPlayCount) || currentPlayCount < 0) {
      return json(
        { message: "currentPlayCount must be a non-negative integer" },
        { status: 400 },
      );
    }
  }

  const playCountSince = await getPlayCountSince(userId, currentPlayCount);

  return json(playCountSince);
};
