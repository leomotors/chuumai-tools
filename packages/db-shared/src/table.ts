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
  jobStart: timestamp("job_start").defaultNow().notNull(),
  jobEnd: timestamp("job_end"),

  jobError: text("job_error"),
  jobLog: text("job_log"),

  isFromOldVersion: boolean("is_from_old_version").default(false).notNull(),
});
