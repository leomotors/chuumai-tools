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

  jobError: boolean("job_error").default(false).notNull(),

  isFromOldVersion: boolean("is_from_old_version").default(false).notNull(),
});

/**
 * Table for *storing image in database*. I know it's cursed.
 */
export const imageCacheTable = pgTable("image_cache", {
  key: text().primaryKey(),
  value: text().notNull(),
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
  characterImage: text("character_image").references(() => imageCacheTable.key),

  teamName: text("team_name").notNull(),
  teamEmblem: rarityLevelType("team_emblem"), // null for no team

  honorText: text("honor_text").notNull(),
  honorRarity: rarityLevelType("honor_rarity").notNull(),

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
    unique().on(
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

  boxPlayerProfileHtml: text("box_player_profile_html"),
  dataBottomBoxHtml: text("data_bottom_box_html"),

  forRatingBestHtml: text("for_rating_best_html"),
  forRatingNewHtml: text("for_rating_new_html"),
  forRatingSelectionHtml: text("for_rating_selection_html"),

  dataForImageGen: text("data_for_image_gen"),
});
