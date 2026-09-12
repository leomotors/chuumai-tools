-- Custom SQL migration file, put your code below! --

-- Fill in the owner of rows written before "user_id" existed, so the per-user
-- uniqueness added in the previous migration keeps deduplicating re-uploaded
-- records instead of treating every legacy row as ownerless. Rows whose job is
-- missing or itself has no user stay NULL. Both tuples were globally unique
-- before, so adding the owner cannot create a duplicate.
UPDATE "music_record"
SET "user_id" = "job"."user_id"
FROM "job"
WHERE "music_record"."job_id" = "job"."id"
  AND "music_record"."user_id" IS NULL;
--> statement-breakpoint
UPDATE "play_history"
SET "user_id" = "job"."user_id"
FROM "job"
WHERE "play_history"."job_id" = "job"."id"
  AND "play_history"."user_id" IS NULL;
