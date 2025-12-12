import { pgEnum } from "drizzle-orm/pg-core";

import {
  categoryValues,
  clearMarkValues,
  ranks,
  rarityLevelValues,
  ratingTypeValues,
  stdChartDifficultyValues,
  teamRarityLevelValues,
} from "@repo/types/chuni";

export const categoryType = pgEnum("category", categoryValues);

export const stdChartDifficultyType = pgEnum(
  "std_chart_difficulty",
  stdChartDifficultyValues,
);

export const rarityLevelType = pgEnum("rarity_level", rarityLevelValues);

export const teamRarityLevelType = pgEnum(
  "team_rarity_level",
  teamRarityLevelValues,
);

export const ranksType = pgEnum("ranks", ranks);

export const clearMarkType = pgEnum("clear_mark", clearMarkValues);

export const ratingType = pgEnum("rating_type", ratingTypeValues);
