import { pgEnum } from "drizzle-orm/pg-core";

import { ranks } from "@repo/utils/chuni";

export const categoryValues = [
  "POPS & ANIME",
  "niconico",
  "東方Project",
  "VARIETY",
  "イロドリミドリ",
  "ゲキマイ",
  "ORIGINAL",
] as const;
export type Category = (typeof categoryValues)[number];
export const categoryType = pgEnum("category", categoryValues);

export const stdChartDifficultyValues = [
  "basic",
  "advanced",
  "expert",
  "master",
  "ultima",
] as const;
export type StdChartDifficulty = (typeof stdChartDifficultyValues)[number];
export const stdChartDifficultyType = pgEnum(
  "std_chart_difficulty",
  stdChartDifficultyValues,
);

export const rarityLevelValues = [
  "NORMAL",
  "BRONZE", // aka COPPER
  "SILVER",
  "GOLD",
  "PLATINUM", // aka PLATINA
  "RAINBOW",
  "HOLOGRAPHIC",
] as const;
export type RarityLevel = (typeof rarityLevelValues)[number];
export const rarityLevelType = pgEnum("rarity_level", rarityLevelValues);

export const teamRarityLevelValues = [
  "NORMAL",
  "GREEN",
  "YELLOW",
  "RED",
  "PURPLE",
  "SILVER",
  "GOLD",
  "RAINBOW",
] as const;
export type TeamRarityLevel = (typeof teamRarityLevelValues)[number];
export const teamRarityLevelType = pgEnum(
  "team_rarity_level",
  teamRarityLevelValues,
);

export const ranksType = pgEnum("ranks", ranks);

export const clearMarkValues = [
  "CLEAR",
  "HARD",
  "BRAVE",
  "ABSOLUTE",
  "CATASTROPHY",
] as const;
export type ClearMark = (typeof clearMarkValues)[number];
export const clearMarkType = pgEnum("clear_mark", clearMarkValues);

export const ratingTypeValues = [
  "BEST",
  "CURRENT",
  "SELECTION_BEST",
  "SELECTION_CURRENT",
] as const;
export type RatingType = (typeof ratingTypeValues)[number];
export const ratingType = pgEnum("rating_type", ratingTypeValues);
