import { json } from "@sveltejs/kit";

import { env } from "$env/dynamic/public";
import { getCachedChartConstantData, getCachedMusicData } from "$lib/cachedDb";
import { addForRenderInfo } from "$lib/calculation";

import {
  chartSchema,
  fullPlayDataInputSchema,
  type ImgGenInput,
} from "@repo/types/chuni";

import type { RequestHandler } from "./$types";

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

  const parseResult = fullPlayDataInputSchema.safeParse(data);

  if (!parseResult.success) {
    return new Response(JSON.stringify(parseResult.error), {
      status: 400,
    });
  }
  const input = parseResult.data;
  const chartConstantData = await getCachedChartConstantData(version);
  const musicData = await getCachedMusicData();

  const { profile, allRecords } = input;

  const processed = allRecords.map((record) => {
    try {
      return addForRenderInfo(record, chartConstantData, musicData, version);
    } catch (_) {
      return null;
    }
  });

  const best30 = processed
    .filter((c) => c !== null)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 30)
    .map((d) => chartSchema.parse(d));

  return json({
    profile,
    best: best30,
    current: [],
  } satisfies ImgGenInput);
};
