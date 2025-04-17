import {
  boolean,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import {
  clearMarkType,
  rarityLevelType,
  ratingType,
  stdChartDifficultyType,
} from "./types";

/**
 * Table for storing job information.
 */
export const jobTable = pgTable("job", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  jobStart: timestamp("job_start").defaultNow().notNull(),
  jobEnd: timestamp("job_end"),

  jobError: text("job_error"),

  isFromOldVersion: boolean("is_from_old_version").default(false).notNull(),
});

/**
 * Table for storing player data at each job.
 */
export const playerDataTable = pgTable("player_data", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  jobId: integer("job_id").references(() => jobTable.id),

  // Home Page
  // From left to right, top to bottom
  characterRarity: rarityLevelType("character_rarity").notNull(),
  characterImage: text("character_image").notNull(),

  teamName: text("team_name"),
  teamEmblem: rarityLevelType("team_emblem"), // null for no team

  mainHonorText: text("main_honor_text").notNull(),
  mainHonorRarity: rarityLevelType("main_honor_rarity").notNull(),
  subHonor1Text: text("sub_honor1_text"),
  subHonor1Rarity: rarityLevelType("sub_honor1_rarity"),
  subHonor2Text: text("sub_honor2_text"),
  subHonor2Rarity: rarityLevelType("sub_honor2_rarity"),

  playerLevel: integer("player_level").notNull(),
  playerName: text("player_name").notNull(),
  classEmblem: integer("class_emblem"),

  rating: decimal({ precision: 4, scale: 2 }).notNull(),
  maxRating: decimal("max_rating", { precision: 4, scale: 2 }), // todo check verse

  overpowerValue: decimal("overpower_value", { scale: 2 }).notNull(),
  overpowerPercent: decimal("overpower_percent", { scale: 2 }).notNull(),

  lastPlayed: timestamp("last_played").notNull(),

  // Page Player Data
  currentCurrency: integer("current_currency").notNull(),
  totalCurrency: integer("total_currency").notNull(),

  playCount: integer("play_count").notNull(),
});

/**
 * Player for storing record for each music and difficuly,
 * new row is inserted for new record/mark/ramp.
 */
export const musicRecordTable = pgTable(
  "music_record",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    jobId: integer("job_id").references(() => jobTable.id),

    musicId: integer("music_id").notNull(),
    difficulty: stdChartDifficultyType().notNull(),

    score: integer().notNull(),

    clearMark: clearMarkType("clear_mark"),
    fc: boolean().notNull(),
    aj: boolean().notNull(),
    fullChain: integer("full_chain").notNull(),
  },
  (t) => [
    unique("music_record_unique").on(
      t.musicId,
      t.difficulty,
      t.score,
      t.clearMark,
      t.fc,
      t.aj,
      t.fullChain,
    ),
  ],
);

/**
 * Table for showing Music for Rating for each job.
 */
export const forRatingTable = pgTable("for_rating", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  jobId: integer("job_id").references(() => jobTable.id),

  musicId: integer("music_id").notNull(),
  recordId: integer("record_id").notNull(),

  ratingType: ratingType("rating_type").notNull(),
  order: integer().notNull(),

  version: text().notNull(),
});

/**
 * Raw scraping data table for debugging, can be clean to save space.
 */
export const rawScrapeDataTable = pgTable("raw_scrape_data", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  jobId: integer("job_id").references(() => jobTable.id),

  version: text().notNull(),

  playerDataHtml: text("player_data_html"),
  allMusicRecordHtml: text("all_music_record_html"),
  dataForImageGen: text("data_for_image_gen"),
});
