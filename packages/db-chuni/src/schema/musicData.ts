import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  unique,
} from "drizzle-orm/pg-core";

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

export const musicDataTable = pgTable("music_data", {
  id: integer().primaryKey(),
  category: categoryType().notNull(),
  title: text().notNull(),
  artist: text().notNull(),
  image: text().notNull(),
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
