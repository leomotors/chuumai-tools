import { integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { jobTable } from "../../shared";
import {
  chartType,
  comboMarkType,
  rarityLevelType,
  ratingType,
  stdChartDifficultyType,
  syncMarkType,
} from "../enum";

export { jobTable };

const chartIdentifierFragment = {
  musicTitle: text("music_title").notNull(),

  chartType: chartType("chart_type").notNull(),
  difficulty: stdChartDifficultyType().notNull(),
} as const;

const playDataFragment = {
  score: integer().notNull(),
  dxScore: integer("dx_score").notNull(),
  dxScoreMax: integer("dx_score_max").notNull(),

  comboMark: comboMarkType("combo_mark").notNull(),
  syncMark: syncMarkType("sync_mark").notNull(),
};

/**
 * Table for storing player data at each job.
 */
export const playerDataTable = pgTable("player_data", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  jobId: integer("job_id").references(() => jobTable.id),

  // Home Page
  // From left to right, top to bottom
  characterImage: text("character_image").notNull(),

  honorText: text("honor_text").notNull(),
  honorRarity: rarityLevelType("honor_rarity").notNull(),

  playerName: text("player_name").notNull(),

  courseRank: integer("course_rank").notNull(), // Course Mode
  classRank: integer("class_rank").notNull(), // オトモダチ

  rating: integer("rating").notNull(),

  star: integer().notNull(),

  playCountCurrent: integer("play_count_current").notNull(),
  playCountTotal: integer("play_count_total").notNull(),
  lastPlayed: timestamp("last_played").notNull(),
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

    ...chartIdentifierFragment,
    ...playDataFragment,
  },
  (t) => [
    unique("music_record_unique")
      .on(
        t.musicTitle,
        t.chartType,
        t.difficulty,
        t.score,
        t.dxScore,
        t.dxScoreMax,
        t.comboMark,
        t.syncMark,
      )
      .nullsNotDistinct(),
  ],
);

export const playHistoryTable = pgTable("play_history", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  jobId: integer("job_id").references(() => jobTable.id),

  // Chart Identifier
  ...chartIdentifierFragment,
  ...playDataFragment,

  // Play History Specific
  trackNo: integer("track_no").notNull(),
  playedAt: timestamp("played_at").notNull().unique(),
});

/**
 * Table for showing Music for Rating for each job.
 */
export const forRatingTable = pgTable("for_rating", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  jobId: integer("job_id").references(() => jobTable.id),

  musicTitle: text("music_title").notNull(),
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
