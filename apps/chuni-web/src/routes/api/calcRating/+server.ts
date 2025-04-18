import { json } from "@sveltejs/kit";
import { and, eq, inArray } from "drizzle-orm";

import { env } from "$env/dynamic/public";
import { db } from "$lib/db";
import { type ChartForRender, rawImageGenSchema } from "$lib/types";

import { musicDataTable, musicLevelTable } from "@repo/db-chuni/schema";
import { type BaseChartSchema, imgGenInputSchema } from "@repo/types-chuni";
import { calculateRating, floorDecimalPlaces } from "@repo/utils-chuni";

import type { RequestHandler } from "./$types";

function constantFromLevel(level: string) {
  if (level.endsWith("+")) {
    return parseInt(level.slice(0, -1)) + 0.5;
  }
  return parseInt(level);
}

function addForRenderInfo(
  data: BaseChartSchema,
  constantData: (typeof musicLevelTable.$inferSelect)[],
  imageData: Pick<typeof musicDataTable.$inferSelect, "id" | "image">[],
  version: string,
): ChartForRender {
  const chartLevel = constantData.find(
    (c) =>
      c.musicId === data.id &&
      c.difficulty === data.difficulty &&
      c.version === version,
  );

  if (!chartLevel) {
    throw new Error("Chart constant not found");
  }

  const constant = chartLevel.constant
    ? +chartLevel.constant
    : constantFromLevel(chartLevel.level);

  const rating = calculateRating(data.score, constant);

  const image = imageData.find((c) => c.id === data.id)!.image;

  return {
    ...data,
    constant,
    constantSure: !!chartLevel.constant,
    rating,
    image,
  };
}

export const POST: RequestHandler = async ({ request }) => {
  if (!env.PUBLIC_VERSION) {
    throw new Error("PUBLIC_VERSION is not set");
  }

  const { data, version } = await request.json();

  const inputParseResult = imgGenInputSchema.safeParse(data);

  if (typeof version !== "string" || !version) {
    return new Response("Invalid version", { status: 400 });
  }

  if (!inputParseResult.success) {
    return new Response(JSON.stringify(inputParseResult.error), {
      status: 400,
    });
  }
  const input = inputParseResult.data;

  const { profile, best, current } = input;

  const allIds = [...best.map((c) => c.id), ...current.map((c) => c.id)];

  const chartConstantData = await db
    .select()
    .from(musicLevelTable)
    .where(
      and(
        eq(musicLevelTable.version, env.PUBLIC_VERSION),
        inArray(musicLevelTable.musicId, allIds),
      ),
    );

  const musicImageData = await db
    .select({
      id: musicDataTable.id,
      image: musicDataTable.image,
    })
    .from(musicDataTable)
    .where(inArray(musicDataTable.id, allIds));

  const bestWithRating = best.map((c) =>
    addForRenderInfo(c, chartConstantData, musicImageData, version),
  );
  const currentWithRating = current.map((c) =>
    addForRenderInfo(c, chartConstantData, musicImageData, version),
  );

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
