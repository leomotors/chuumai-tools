import { json } from "@sveltejs/kit";

import { previewNextRequestSchema } from "$lib/api/schemas";
import { getMusicDataCached } from "$lib/functions/musicData";
import {
  addForRenderInfo,
  calculateRatingTotals,
} from "$lib/functions/ratingCalculation";
import { getEnabledVersions } from "$lib/version";

import { chartSchema } from "@repo/types/maimai";

import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const enabledVersions = getEnabledVersions();

  const body = await request.json();
  const parseResult = previewNextRequestSchema.safeParse(body);

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

  const musicData = await getMusicDataCached(version);

  const { profile, allRecords } = data;

  // Process all records
  const processed = allRecords.map((record) => {
    try {
      return addForRenderInfo(record, musicData);
    } catch (_) {
      return null;
    }
  });

  // Sort by rating and take top 50 (35 old + 15 new)
  const top50 = processed
    .filter((c) => c !== null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 50);

  // Split into old 35 and new 15
  const old35 = top50.slice(0, 35);
  const new15 = top50.slice(35, 50);

  const rating = calculateRatingTotals(old35, new15);

  return json({
    profile: {
      ...profile,
      rating: rating.total,
    },
    best: old35.map((d) => chartSchema.parse(d)),
    current: new15.map((d) => chartSchema.parse(d)),
  });
};
