import { json } from "@sveltejs/kit";

import { getUserStats } from "$lib/functions/userStats";
import { getUserIdFromRequest } from "$lib/server/auth";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, locals }) => {
  const userId = await getUserIdFromRequest(request, locals);
  const stats = await getUserStats(userId);

  return json(stats);
};
