import { json } from "@sveltejs/kit";
import { inArray } from "drizzle-orm";

import { db } from "$lib/db";

import { musicDataTable, musicLevelTable } from "@repo/db-chuni/schema";

import type { RequestHandler } from "./$types";

function getLevel(lv: string) {
  if (lv.endsWith("+")) {
    return Number(lv.slice(0, -1)) + 0.5;
  }

  return +lv;
}

async function getChartData(ids: number[]) {
  const levelData = await db
    .select()
    .from(musicLevelTable)
    .where(inArray(musicLevelTable.musicId, ids));

  const chartJacket = await db
    .select({
      id: musicDataTable.id,
      image: musicDataTable.image,
    })
    .from(musicDataTable)
    .where(inArray(musicDataTable.id, ids));

  const result = ids.map((id) => ({
    id: id,
    image: chartJacket.find((jacket) => jacket.id === id)?.image,
    constant: levelData
      .filter((level) => level.musicId === id)
      .map((lv) => ({
        difficulty: lv.difficulty,
        constant: lv.constant ?? getLevel(lv.level),
        constantSure: !!lv.constant,
      })),
  }));

  return result;
}

export type ResponseData = Awaited<ReturnType<typeof getChartData>>;

export const GET: RequestHandler = async ({ url }) => {
  const ids =
    url.searchParams
      .get("ids")
      ?.split(",")
      .map(Number)
      .filter(Number.isInteger) ?? [];

  const result = await getChartData(ids);

  return json(result);
};
