import { error, json } from "@sveltejs/kit";

import { env } from "$env/dynamic/public";
import { getCachedChartConstantData, getCachedMusicData } from "$lib/cachedDb";
import { addForRenderInfo } from "$lib/calculation";
import { type MusicData, rawImageGenSchema } from "$lib/types";

import {
  type BaseChartSchema,
  type HiddenChart,
  imgGenInputSchema,
} from "@repo/types/chuni";
import { floorDecimalPlaces } from "@repo/utils/chuni";

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
  if (!env.PUBLIC_ENABLED_VERSION) {
    throw new Error("PUBLIC_ENABLED_VERSION is not set");
  }

  const { data, version } = await request.json();

  const enabledVersions = env.PUBLIC_ENABLED_VERSION.split(",");
  if (
    typeof version !== "string" ||
    !version ||
    !enabledVersions.includes(version)
  ) {
    return new Response(
      `Invalid version, valid versions are: ${enabledVersions.join(", ")}`,
      { status: 400 },
    );
  }

  const inputParseResult = imgGenInputSchema.safeParse(data);

  if (!inputParseResult.success) {
    return new Response(JSON.stringify(inputParseResult.error), {
      status: 400,
    });
  }
  const input = inputParseResult.data;

  const { profile, best, current, hidden } = input;

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
      bestWithRating.reduce((prev, curr) => prev + curr.rating, 0) / 30,
      4,
    ),
    currentAvg: floorDecimalPlaces(
      currentWithRating.reduce((prev, curr) => prev + curr.rating, 0) / 20,
      4,
    ),
    totalAvg: floorDecimalPlaces(
      (bestWithRating.reduce((prev, curr) => prev + curr.rating, 0) +
        currentWithRating.reduce((prev, curr) => prev + curr.rating, 0)) /
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
