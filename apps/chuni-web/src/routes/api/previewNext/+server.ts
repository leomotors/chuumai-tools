import { json } from "@sveltejs/kit";

import { previewNextRequestSchema } from "$lib/api/schemas";
import { getCachedChartConstantData, getCachedMusicData } from "$lib/cachedDb";
import { addForRenderInfo } from "$lib/calculation";
import { getEnabledVersions } from "$lib/version";

import { floorDecimalPlaces } from "@repo/core/chuni";
import {
  chartSchema,
  type ChartForRender,
  type ImgGenInput,
} from "@repo/types/chuni";

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

  const { data, version, aotMode } = parseResult.data;

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

  const nonNullProcessed = processed.filter((c) => c !== null);

  const best30 = nonNullProcessed
    .filter((c) => !aotMode || c.version !== version)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 30);

  const new20 = nonNullProcessed
    .filter((c) => aotMode && c.version === version)
    .slice(0, 20);

  const ratingReducer = (acc: number, cur: ChartForRender) =>
    acc + (cur.rating ?? 0);

  const newRating = floorDecimalPlaces(
    (best30.reduce(ratingReducer, 0) + new20.reduce(ratingReducer, 0)) / 50,
    4,
  );

  return json({
    profile: {
      ...profile,
      rating: newRating,
    },
    best: best30.map((d) => chartSchema.parse(d)),
    current: new20.map((d) => chartSchema.parse(d)),
  } satisfies ImgGenInput);
};
