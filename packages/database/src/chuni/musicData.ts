import { decimal, integer, pgTable, text, unique } from "drizzle-orm/pg-core";

import { categoryType, stdChartDifficultyType } from "./enum";

export const musicDataTable = pgTable("music_data", {
  id: integer().primaryKey(),
  category: categoryType().notNull(),
  title: text().notNull(),
  artist: text().notNull(),
  image: text().notNull(),
  version: text(),
});

export const musicLevelTable = pgTable(
  "music_level",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    musicId: integer("music_id")
      .notNull()
      .references(() => musicDataTable.id),
    difficulty: stdChartDifficultyType().notNull(),
    level: text().notNull(),
    constant: decimal({ precision: 3, scale: 1 }),

    version: text().notNull(),
  },
  (t) => [unique().on(t.musicId, t.difficulty, t.version)],
);
