import { decimal, integer, pgTable, text, unique } from "drizzle-orm/pg-core";

import { categoryType, chartType, stdChartDifficultyType } from "./types";

export const musicDataTable = pgTable("music_data", {
  title: text().notNull().primaryKey(),
  sort: integer().notNull().unique(),
  category: categoryType().notNull(),
  artist: text().notNull(),
  image: text().notNull(),
});

export const musicLevelTable = pgTable(
  "music_level",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    musicTitle: text("music_title")
      .notNull()
      .references(() => musicDataTable.title),
    chartType: chartType("chart_type").notNull(),
    difficulty: stdChartDifficultyType().notNull(),
    level: text().notNull(),
    constant: decimal({ precision: 3, scale: 1 }),

    version: text().notNull(),
  },
  (t) => [unique().on(t.musicTitle, t.chartType, t.difficulty, t.version)],
);
