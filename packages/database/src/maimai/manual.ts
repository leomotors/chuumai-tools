import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";

/**
 * Table for storing manually inserted rating data,
 * to show rating history before start scraping.
 */
export const manualRatingTable = pgTable("manual_rating", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  rating: integer().notNull(),
  timestamp: timestamp().notNull(),
});
