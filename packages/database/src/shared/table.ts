import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Table for storing job information.
 */
export const jobTable = pgTable("job", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id"),

  jobStart: timestamp("job_start", { withTimezone: true })
    .defaultNow()
    .notNull(),
  jobEnd: timestamp("job_end", { withTimezone: true }),

  jobError: text("job_error"),
  jobLog: text("job_log"),

  isFromOldVersion: boolean("is_from_old_version").default(false).notNull(),
});

export const apiKey = pgTable("api_key", {
  userId: text("user_id").primaryKey(),
  apiKey: text("api_key").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
