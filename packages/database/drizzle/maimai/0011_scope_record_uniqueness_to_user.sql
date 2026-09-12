ALTER TABLE "music_record" DROP CONSTRAINT "music_record_unique";--> statement-breakpoint
ALTER TABLE "play_history" DROP CONSTRAINT "play_history_played_at_unique";--> statement-breakpoint
ALTER TABLE "music_record" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "play_history" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "music_record" ADD CONSTRAINT "music_record_unique" UNIQUE NULLS NOT DISTINCT("user_id","music_title","chart_type","difficulty","score","dx_score","dx_score_max","combo_mark","sync_mark");--> statement-breakpoint
ALTER TABLE "play_history" ADD CONSTRAINT "play_history_user_played_at_unique" UNIQUE("user_id","played_at");