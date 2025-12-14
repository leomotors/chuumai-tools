import { error, json } from "@sveltejs/kit";

import { getForRating } from "$lib/functions/forRating";
import { getUserIdFromRequest } from "$lib/server/auth";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, locals }) => {
  const userId = await getUserIdFromRequest(request, locals);
  const forRating = await getForRating(userId);

  if (!forRating) {
    error(404, "No rating data found for this user");
  }

  return json(forRating);
};
