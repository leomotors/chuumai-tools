import type { MusicDataViewSchema } from "$lib/functions/musicData";

import { calculateRating } from "@repo/core/maimai";
import type { ChartForRender, ChartSchema } from "@repo/types/maimai";

/**
 * Add rating calculation information to a chart
 */
export function addForRenderInfo(
  chart: ChartSchema,
  musicData: MusicDataViewSchema[],
): ChartForRender {
  // Find matching music data
  const music = musicData.find(
    (m) => m.title === chart.title && m.chartType === chart.chartType,
  );

  if (!music) {
    return {
      ...chart,
      level: 0,
      levelSure: false,
      rating: null,
      image: null,
    };
  }

  // Get level data for the specific difficulty
  const levelData = music[chart.difficulty];

  if (!levelData) {
    return {
      ...chart,
      level: 0,
      levelSure: false,
      rating: null,
      image: music.image,
    };
  }

  const level = levelData.constant ?? parseFloat(levelData.level);
  const rating = calculateRating(chart.score, level, chart.comboMark || "NONE");

  return {
    ...chart,
    level,
    levelSure: levelData.constant !== null,
    rating,
    image: music.image,
  };
}

/**
 * Calculate rating totals for maimai (summation, not average)
 * Old/best: 35 songs, New/current: 15 songs
 */
export function calculateRatingTotals(
  oldSongs: ChartForRender[],
  newSongs: ChartForRender[],
) {
  const bestSum = oldSongs.reduce((sum, chart) => sum + (chart.rating ?? 0), 0);
  const currentSum = newSongs.reduce(
    (sum, chart) => sum + (chart.rating ?? 0),
    0,
  );

  return {
    bestSum,
    currentSum,
    total: bestSum + currentSum,
  };
}
