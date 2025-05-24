ALTER TABLE "player_data" ADD COLUMN "class_band" integer;--> statement-breakpoint
ALTER TABLE "player_data" ADD COLUMN "calculated_rating" numeric(6, 4);--> statement-breakpoint
ALTER TABLE "player_data" DROP COLUMN "max_rating";