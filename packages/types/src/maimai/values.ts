export const categoryValues = [
  "POPS&アニメ",
  "niconico&ボーカロイド",
  "東方Project",
  "ゲーム&バラエティ",
  "maimai",
  "オンゲキ&CHUNITHM",
] as const;
export type Category = (typeof categoryValues)[number];

export const chartTypeValues = ["std", "dx"] as const;
export type ChartType = (typeof chartTypeValues)[number];

export const stdChartDifficultyValues = [
  "basic",
  "advanced",
  "expert",
  "master",
  "remaster",
] as const;
export type StdChartDifficulty = (typeof stdChartDifficultyValues)[number];

export const rarityLevelValues = [
  "NORMAL",
  "BRONZE",
  "SILVER",
  "GOLD",
  "RAINBOW",
] as const;
export type RarityLevel = (typeof rarityLevelValues)[number];

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
  0, 50, 60, 70, 75, 80, 90, 94, 97, 98, 99, 99.5, 100, 100.5,
] as const;

export const ratingTypeValues = [
  "OLD",
  "NEW",
  "SELECTION_OLD",
  "SELECTION_NEW",
] as const;
export type RatingType = (typeof ratingTypeValues)[number];

export const comboMarkValues = ["NONE", "FC", "FC+", "AP", "AP+"] as const;
export type ComboMark = (typeof comboMarkValues)[number];

export const syncMarkValues = [
  "NONE",
  "SYNC",
  "FS",
  "FS+",
  "FDX",
  "FDX+",
] as const;
export type SyncMark = (typeof syncMarkValues)[number];
