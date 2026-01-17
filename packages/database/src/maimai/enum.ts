import { pgEnum } from "drizzle-orm/pg-core";

import {
  allChartDifficultyValues,
  categoryValues,
  chartTypeValues,
  chartTypeWithUtageValues,
  comboMarkValues,
  ranks,
  rarityLevelValues,
  ratingTypeValues,
  stdChartDifficultyValues,
  syncMarkValues,
} from "@repo/types/maimai";

export const categoryType = pgEnum("category", categoryValues);

export const chartType = pgEnum("chart_type", chartTypeValues);
export const chartTypeWithUtageType = pgEnum(
  "chart_type_with_utage",
  chartTypeWithUtageValues,
);

export const stdChartDifficultyType = pgEnum(
  "std_chart_difficulty",
  stdChartDifficultyValues,
);

export const allChartDifficultyType = pgEnum(
  "all_chart_difficulty",
  allChartDifficultyValues,
);

export const rarityLevelType = pgEnum("rarity_level", rarityLevelValues);

export const ranksType = pgEnum("ranks", ranks);

export const ratingType = pgEnum("rating_type", ratingTypeValues);

export const comboMarkType = pgEnum("combo_mark", comboMarkValues);

export const syncMarkType = pgEnum("sync_mark", syncMarkValues);
