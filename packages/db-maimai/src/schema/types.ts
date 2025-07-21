import { pgEnum } from "drizzle-orm/pg-core";

import { ranks } from "@repo/utils/chuni";

export const categoryValues = [
  "POPS&アニメ",
  "niconico&ボーカロイド",
  "東方Project",
  "ゲーム&バラエティ",
  "maimai",
  "オンゲキ&CHUNITHM",
] as const;
export type Category = (typeof categoryValues)[number];
export const categoryType = pgEnum("category", categoryValues);

export const chartTypeValues = ["std", "dx"] as const;
export type ChartType = (typeof chartTypeValues)[number];
export const chartType = pgEnum("chart_type", chartTypeValues);

export const stdChartDifficultyValues = [
  "basic",
  "advanced",
  "expert",
  "master",
  "remaster",
] as const;
export type StdChartDifficulty = (typeof stdChartDifficultyValues)[number];
export const stdChartDifficultyType = pgEnum(
  "std_chart_difficulty",
  stdChartDifficultyValues,
);

export const rarityLevelValues = [
  "NORMAL",
  "BRONZE",
  "SILVER",
  "GOLD",
  "RAINBOW",
] as const;
export type RarityLevel = (typeof rarityLevelValues)[number];
export const rarityLevelType = pgEnum("rarity_level", rarityLevelValues);

export const ranksType = pgEnum("ranks", ranks);

export const ratingTypeValues = [
  "OLD",
  "NEW",
  "SELECTION_OLD",
  "SELECTION_NEW",
] as const;
export type RatingType = (typeof ratingTypeValues)[number];
export const ratingType = pgEnum("rating_type", ratingTypeValues);

export const comboMarkValues = ["NONE", "FC", "FC+", "AP", "AP+"] as const;
export type ComboMark = (typeof comboMarkValues)[number];
export const comboMarkType = pgEnum("combo_mark", comboMarkValues);

export const syncMarkValues = [
  "NONE",
  "SYNC",
  "FS",
  "FS+",
  "FDX",
  "FDX+",
] as const;
export type SyncMark = (typeof syncMarkValues)[number];
export const syncMarkType = pgEnum("sync_mark", syncMarkValues);
