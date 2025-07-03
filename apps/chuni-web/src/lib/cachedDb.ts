import { and, eq } from "drizzle-orm";

import { musicDataTable, musicLevelTable } from "@repo/db-chuni/schema";
import { SimpleCache } from "@repo/utils";

import { db } from "./db";
import type { ChartConstantData, MusicData } from "./types";

// Create cache instances
export const chartConstantCache = new SimpleCache<ChartConstantData>(50);
export const musicDataCache = new SimpleCache<MusicData>(10);

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

/**
 * Get music data with caching
 */
export async function getCachedMusicData() {
  const cacheKey = "music_data";

  // Try to get from cache first
  const cached = musicDataCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // If not in cache, fetch from database
  console.log("[INFO]: Fetching music data");
  const data = await db
    .select({
      id: musicDataTable.id,
      title: musicDataTable.title,
      image: musicDataTable.image,
    })
    .from(musicDataTable);

  // Store in cache
  musicDataCache.set(cacheKey, data, MUSIC_DATA_TTL);

  return data;
}
