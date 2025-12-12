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

export const stdChartDifficultyValues = [
  "basic",
  "advanced",
  "expert",
  "master",
  "ultima",
] as const;
export type StdChartDifficulty = (typeof stdChartDifficultyValues)[number];

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

export const ranks = [
  "D",
  "C",
  "B",
  "BB",
  "BBB",
  "A",
  "AA",
  "AAA",
  "S",
  "S+",
  "SS",
  "SS+",
  "SSS",
  "SSS+",
] as const;

export const rankCutoffs = [
  0, 500000, 600000, 700000, 800000, 900000, 925000, 950000, 975000, 990000,
  1000000, 1005000, 1007500, 1009000,
] as const;

export const clearMarkValues = [
  "CLEAR",
  "HARD",
  "BRAVE",
  "ABSOLUTE",
  "CATASTROPHY",
] as const;
export type ClearMark = (typeof clearMarkValues)[number];

export const ratingTypeValues = [
  "BEST",
  "CURRENT",
  "SELECTION_BEST",
  "SELECTION_CURRENT",
] as const;
export type RatingType = (typeof ratingTypeValues)[number];
