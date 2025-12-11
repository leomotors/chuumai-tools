import { json } from "@sveltejs/kit";

import { previewNextRequestSchema } from "$lib/api/schemas";
import { getCachedChartConstantData, getCachedMusicData } from "$lib/cachedDb";
import { addForRenderInfo } from "$lib/calculation";
import { getEnabledVersions } from "$lib/version";

import { chartSchema, type ImgGenInput } from "@repo/types/chuni";
import { floorDecimalPlaces } from "@repo/utils/chuni";

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

  const chartConstantData = await getCachedChartConstantData(version);
  const musicData = await getCachedMusicData();

  const { profile, allRecords } = data;

  const processed = allRecords.map((record) => {
    try {
      return addForRenderInfo(record, chartConstantData, musicData, version);
    } catch (_) {
      return null;
    }
  });

  const best30 = processed
    .filter((c) => c !== null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 30);

  const newRating = floorDecimalPlaces(
    best30.reduce((acc, cur) => acc + (cur.rating ?? 0), 0) / 50,
    4,
  );

  return json({
    profile: {
      ...profile,
      rating: newRating,
    },
    best: best30.map((d) => chartSchema.parse(d)),
    current: [],
  } satisfies ImgGenInput);
};
