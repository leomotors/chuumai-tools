CREATE TYPE "public"."team_rarity_level" AS ENUM('NORMAL', 'GREEN', 'YELLOW', 'RED', 'PURPLE', 'SILVER', 'GOLD', 'RAINBOW');--> statement-breakpoint
ALTER TABLE "music_data" ADD COLUMN "version" text;