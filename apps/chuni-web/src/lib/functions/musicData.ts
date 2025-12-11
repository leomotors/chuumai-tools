import { and, eq } from "drizzle-orm";

import { db } from "$lib/db";

import {
  musicDataTable,
  musicLevelTable,
  stdChartDifficultyValues,
} from "@repo/db-chuni/schema";
import { SimpleCache } from "@repo/utils";
import { z } from "@repo/utils/zod";

export const chartLevelSchema = z
  .object({
    level: z.string(),
    constant: z.number().nullable(),
  })
  .openapi("ChartLevel");

export const musicDataViewSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    artist: z.string(),
    image: z.string(),
    releasedVersion: z.string().nullable(),
    basic: chartLevelSchema.optional(),
    advanced: chartLevelSchema.optional(),
    expert: chartLevelSchema.optional(),
    master: chartLevelSchema.optional(),
    ultima: chartLevelSchema.optional(),
  })
  .openapi("MusicDataView");

export type MusicDataViewSchema = z.infer<typeof musicDataViewSchema>;

export async function getMusicData(version: string) {
  const data = await db
    .select({
      id: musicDataTable.id,
      title: musicDataTable.title,
      artist: musicDataTable.artist,
      image: musicDataTable.image,
      releasedVersion: musicDataTable.version,
      difficulty: musicLevelTable.difficulty,
      level: musicLevelTable.level,
      constant: musicLevelTable.constant,
    })
    .from(musicDataTable)
    .innerJoin(
      musicLevelTable,
      and(
        eq(musicDataTable.id, musicLevelTable.musicId),
        eq(musicLevelTable.version, version),
      ),
    );

  const grouped = data.reduce(
    (acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = {
          id: item.id,
          title: item.title,
          artist: item.artist,
          image: item.image,
          releasedVersion: item.releasedVersion,
          basic: undefined,
          advanced: undefined,
          expert: undefined,
          master: undefined,
          ultima: undefined,
        };
      }

      if (
        item.difficulty &&
        stdChartDifficultyValues.includes(item.difficulty) &&
        item.level !== null
      ) {
        acc[item.id][item.difficulty] = {
          level: item.level,
          constant: item.constant ? Number(item.constant) : null,
        };
      }

      return acc;
    },
    {} as Record<number, z.infer<typeof musicDataViewSchema>>,
  );

  return Object.values(grouped);
}

const musicDataForTableCache = new SimpleCache<MusicDataViewSchema[]>(100);
const MUSIC_DATA_FOR_TABLE_TTL = 2 * 60 * 1000; // 2 minutes

export async function getMusicDataCached(version: string) {
  const cacheKey = `music_data_for_table_${version}`;

  // Try to get from cache first
  const cached = musicDataForTableCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  console.log(`[INFO]: Fetching music data (for table) for version ${version}`);
  const data = await getMusicData(version);
  musicDataForTableCache.set(cacheKey, data, MUSIC_DATA_FOR_TABLE_TTL);
  return data;
}
