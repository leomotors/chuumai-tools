import { and, eq } from "drizzle-orm";

import { SimpleCache } from "@repo/core";
import type { ChartConstantData, MusicData } from "@repo/database/chuni";
import { musicDataTable, musicLevelTable } from "@repo/database/chuni";

import { db } from "./db";

// Create cache instances
export const chartConstantCache = new SimpleCache<ChartConstantData>(50);
export const musicDataCache = new SimpleCache<MusicData>(10);

export type VersionMapping = Map<number, string | null>;
export const musicIdVersionMapCache = new SimpleCache<VersionMapping>(10);

// Cache TTL constants (in milliseconds)
export const CHART_CONSTANT_TTL = 30 * 60 * 1000; // 30 minutes
export const MUSIC_DATA_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get chart constant data with caching
 */
export async function getCachedChartConstantData(version: string) {
  const cacheKey = `chart_constant_${version}`;

  // Try to get from cache first
  const cached = chartConstantCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // If not in cache, fetch from database
  console.log(`[INFO]: Fetching chart constant data for version ${version}`);
  const data = await db
    .select()
    .from(musicLevelTable)
    .where(and(eq(musicLevelTable.version, version)));

  // Store in cache
  chartConstantCache.set(cacheKey, data, CHART_CONSTANT_TTL);

  return data;
}

async function fetchAndCacheMusicData() {
  const musicCacheKey = "music_data";
  const mapCacheKey = "music_id_version_map";

  const cachedMusic = musicDataCache.get(musicCacheKey);
  if (cachedMusic) {
    return;
  }

  console.log("[INFO]: Fetching music data");
  const data = await db
    .select({
      id: musicDataTable.id,
      title: musicDataTable.title,
      image: musicDataTable.image,
      version: musicDataTable.version,
    })
    .from(musicDataTable);

  musicDataCache.set(musicCacheKey, data, MUSIC_DATA_TTL);

  const idVersionMap = new Map<number, string | null>();
  for (const row of data) {
    idVersionMap.set(row.id, row.version);
  }
  musicIdVersionMapCache.set(mapCacheKey, idVersionMap, MUSIC_DATA_TTL);
}

/**
 * Get music data with caching
 */
export async function getCachedMusicData() {
  const cached = musicDataCache.get("music_data");
  if (cached) {
    return cached;
  }

  await fetchAndCacheMusicData();
  return musicDataCache.get("music_data")!;
}

/**
 * Get a map from music id to version with caching
 */
export async function getCachedMusicIdVersionMap() {
  const cached = musicIdVersionMapCache.get("music_id_version_map");
  if (cached) {
    return cached;
  }

  await fetchAndCacheMusicData();
  return musicIdVersionMapCache.get("music_id_version_map")!;
}
