import { json } from "@sveltejs/kit";

import { calcRatingRequestSchema, rawImageGenSchema } from "$lib/api/schemas";
import { getMusicDataCached } from "$lib/functions/musicData";
import {
  addForRenderInfo,
  calculateRatingTotals,
} from "$lib/functions/ratingCalculation";
import { getEnabledVersions } from "$lib/version";

import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const enabledVersions = getEnabledVersions();

  const body = await request.json();
  const parseResult = calcRatingRequestSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response(JSON.stringify(parseResult.error), {
      status: 400,
    });
  }

  const { data, version } = parseResult.data;

  if (!enabledVersions.includes(version)) {
    return new Response(
      `Invalid version, valid versions are: ${enabledVersions.join(", ")}`,
      { status: 400 },
    );
  }

  const { profile, best, current } = data;

  const musicData = await getMusicDataCached(version);

  // Process old/best songs (35 songs)
  const oldWithRating = best
    .map((c) => addForRenderInfo(c, musicData))
    .slice(0, 35);

  // Process new/current songs (15 songs)
  const newWithRating = current
    .map((c) => addForRenderInfo(c, musicData))
    .slice(0, 15);

  const rating = calculateRatingTotals(oldWithRating, newWithRating);

  return json(
    rawImageGenSchema.parse({
      profile: {
        ...profile,
        rating: rating.total,
      },
      best: oldWithRating,
      current: newWithRating,
      rating,
    }),
  );
};
