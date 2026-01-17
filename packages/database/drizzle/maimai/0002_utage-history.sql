CREATE TYPE "public"."all_chart_difficulty" AS ENUM('basic', 'advanced', 'expert', 'master', 'remaster', 'utage');--> statement-breakpoint
CREATE TYPE "public"."chart_type_with_utage" AS ENUM('std', 'dx', 'utage', 'utage-buddy');--> statement-breakpoint
ALTER TABLE "play_history" ALTER COLUMN "chart_type" SET DATA TYPE chart_type_with_utage USING "chart_type"::text::chart_type_with_utage;--> statement-breakpoint
ALTER TABLE "play_history" ALTER COLUMN "difficulty" SET DATA TYPE "public"."all_chart_difficulty" USING "difficulty"::text::"public"."all_chart_difficulty";