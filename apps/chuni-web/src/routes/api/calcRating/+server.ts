import { error, json } from "@sveltejs/kit";

import { calcRatingRequestSchema } from "$lib/api/schemas";
import { getCachedChartConstantData, getCachedMusicData } from "$lib/cachedDb";
import { addForRenderInfo } from "$lib/calculation";
import { getEnabledVersions } from "$lib/version";

import { floorDecimalPlaces } from "@repo/core/chuni";
import type { MusicData } from "@repo/database/chuni";
import {
  type BaseChartSchema,
  type HiddenChart,
  rawImageGenSchema,
} from "@repo/types/chuni";

import type { RequestHandler } from "./$types";

function hiddenChartToData(
  data: HiddenChart,
  chartData: MusicData,
): BaseChartSchema {
  const chart = chartData.find(
    (c) =>
      c.title.toLowerCase().replace(/\s/g, "") ===
      data.search.toLowerCase().replace(/\s/g, ""),
  );

  if (!chart) {
    error(400, `Chart not found: ${data.search}`);
  }

  return {
    id: chart.id,
    title: chart.title,
    difficulty: data.difficulty,
    score: data.score,
    clearMark: data.clearMark,
    fc: data.fc,
    aj: data.aj,
    isHidden: true,
  };
}

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

  const { profile, best, current, hidden } = data;

  const chartConstantData = await getCachedChartConstantData(version);

  const musicData = await getCachedMusicData();

  const bestWithRating = best
    .map((c) => addForRenderInfo(c, chartConstantData, musicData, version))
    .concat(
      (hidden || [])
        .filter((c) => c.ratingType === "BEST")
        .map((c) =>
          addForRenderInfo(
            hiddenChartToData(c, musicData),
            chartConstantData,
            musicData,
            version,
          ),
        ),
    )
    .slice(0, 30);

  const currentWithRating = current
    .map((c) => addForRenderInfo(c, chartConstantData, musicData, version))
    .concat(
      (hidden || [])
        .filter((c) => c.ratingType === "CURRENT")
        .map((c) =>
          addForRenderInfo(
            hiddenChartToData(c, musicData),
            chartConstantData,
            musicData,
            version,
          ),
        ),
    )
    .slice(0, 20);

  const rating = {
    bestAvg: floorDecimalPlaces(
      bestWithRating.reduce((prev, curr) => prev + (curr.rating ?? 0), 0) / 30,
      4,
    ),
    currentAvg: floorDecimalPlaces(
      currentWithRating.reduce((prev, curr) => prev + (curr.rating ?? 0), 0) /
        20,
      4,
    ),
    totalAvg: floorDecimalPlaces(
      (bestWithRating.reduce((prev, curr) => prev + (curr.rating ?? 0), 0) +
        currentWithRating.reduce(
          (prev, curr) => prev + (curr.rating ?? 0),
          0,
        )) /
        50,
      4,
    ),
  };

  return json(
    rawImageGenSchema.parse({
      profile,
      best: bestWithRating,
      current: currentWithRating,
      rating,
    }),
  );
};
