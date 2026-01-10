import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Table for storing manually inserted rating data,
 * to show rating history before start scraping.
 */
export const manualRatingTable = pgTable("manual_rating", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id"),

  rating: integer().notNull(),
  timestamp: timestamp().notNull(),
});
