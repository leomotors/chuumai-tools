ALTER TABLE "music_record" DROP CONSTRAINT "music_record_unique";--> statement-breakpoint
ALTER TABLE "play_history" DROP CONSTRAINT "play_history_played_at_unique";--> statement-breakpoint
ALTER TABLE "music_record" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "play_history" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "music_record" ADD CONSTRAINT "music_record_unique" UNIQUE NULLS NOT DISTINCT("user_id","music_id","difficulty","score","clear_mark","fc","aj","full_chain");--> statement-breakpoint
ALTER TABLE "play_history" ADD CONSTRAINT "play_history_user_played_at_unique" UNIQUE("user_id","played_at");