import { and, eq } from "drizzle-orm";

import { db } from "$lib/db";

import { SimpleCache } from "@repo/core";
import {
  musicDataTable,
  musicLevelTable,
  musicVersionTable,
} from "@repo/database/maimai";
import { chartTypeValues, stdChartDifficultyValues } from "@repo/types/maimai";
import { z } from "@repo/types/zod";

export const chartLevelSchema = z
  .object({
    level: z.string(),
    constant: z.number().nullable(),
  })
  .openapi("ChartLevel");

export const musicDataViewSchema = z
  .object({
    title: z.string(),
    artist: z.string(),
    image: z.string(),
    chartType: z.enum(chartTypeValues),
    releaseDate: z.string().openapi({ format: "date" }),
    releasedVersion: z.string().openapi({ example: "CiRCLE" }),
    releasedVersionIntl: z.string().optional(),
    basic: chartLevelSchema.optional(),
    advanced: chartLevelSchema.optional(),
    expert: chartLevelSchema.optional(),
    master: chartLevelSchema.optional(),
    remaster: chartLevelSchema.optional(),
  })
  .openapi("MusicDataView");

export type MusicDataViewSchema = z.infer<typeof musicDataViewSchema>;

export async function getMusicData(version: string) {
  const data = await db
    .select({
      title: musicDataTable.title,
      artist: musicDataTable.artist,
      image: musicDataTable.image,
      chartType: musicLevelTable.chartType,
      difficulty: musicLevelTable.difficulty,
      level: musicLevelTable.level,
      constant: musicLevelTable.constant,
      releaseDate: musicVersionTable.releaseDate,
      releasedVersion: musicVersionTable.version,
      releasedVersionIntl: musicVersionTable.versionIntl,
    })
    .from(musicDataTable)
    .innerJoin(
      musicLevelTable,
      and(
        eq(musicDataTable.title, musicLevelTable.musicTitle),
        eq(musicLevelTable.version, version),
      ),
    )
    .innerJoin(
      musicVersionTable,
      and(
        eq(musicDataTable.title, musicVersionTable.title),
        eq(musicLevelTable.chartType, musicVersionTable.chartType),
      ),
    );

  const grouped = data.reduce(
    (acc, item) => {
      const key = `${item.title}-${item.chartType}`;

      if (!acc[key]) {
        acc[key] = {
          title: item.title,
          artist: item.artist,
          image: item.image,
          chartType: item.chartType,
          releaseDate: item.releaseDate,
          releasedVersion: item.releasedVersion,
          releasedVersionIntl: item.releasedVersionIntl || undefined,
          basic: undefined,
          advanced: undefined,
          expert: undefined,
          master: undefined,
          remaster: undefined,
        };
      }

      if (
        item.difficulty &&
        stdChartDifficultyValues.includes(item.difficulty) &&
        item.level !== null
      ) {
        acc[key][item.difficulty] = {
          level: item.level,
          constant: item.constant ? Number(item.constant) : null,
        };
      }

      return acc;
    },
    {} as Record<string, z.infer<typeof musicDataViewSchema>>,
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
