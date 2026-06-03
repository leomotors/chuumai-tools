-- Existing values written from JS Date/ISO paths are treated as UTC wall time.
-- If manual_rating.timestamp was entered as Bangkok local wall time, change UTC to Asia/Bangkok before running.
ALTER TABLE "manual_rating" ALTER COLUMN "timestamp" SET DATA TYPE timestamp with time zone USING "timestamp" AT TIME ZONE 'UTC';--> statement-breakpoint
-- job_end has historically been mixed. Rows where the stored end is earlier than start are treated as UTC wall time;
-- the remaining rows are treated as Bangkok wall time.
ALTER TABLE "job" ALTER COLUMN "job_end" SET DATA TYPE timestamp with time zone USING CASE WHEN "job_end" IS NULL THEN NULL WHEN "job_end" < "job_start" THEN "job_end" AT TIME ZONE 'UTC' ELSE "job_end" AT TIME ZONE 'Asia/Bangkok' END;--> statement-breakpoint
-- DB-created job_start values are treated as Bangkok wall time.
ALTER TABLE "job" ALTER COLUMN "job_start" SET DATA TYPE timestamp with time zone USING "job_start" AT TIME ZONE 'Asia/Bangkok';--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_start" SET DEFAULT now();--> statement-breakpoint
-- Scraper-provided play times are converted to ISO UTC before insert.
ALTER TABLE "play_history" ALTER COLUMN "played_at" SET DATA TYPE timestamp with time zone USING "played_at" AT TIME ZONE 'UTC';--> statement-breakpoint
-- Scraper-provided last-played times are converted to ISO UTC before insert.
ALTER TABLE "player_data" ALTER COLUMN "last_played" SET DATA TYPE timestamp with time zone USING "last_played" AT TIME ZONE 'UTC';--> statement-breakpoint
-- DB-created api_key.created_at values are treated as Bangkok wall time.
-- If most existing rows came from key regeneration before this migration, change Asia/Bangkok to UTC before running.
ALTER TABLE "api_key" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'Asia/Bangkok';--> statement-breakpoint
ALTER TABLE "api_key" ALTER COLUMN "created_at" SET DEFAULT now();