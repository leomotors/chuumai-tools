CREATE TYPE "public"."category" AS ENUM('POPS & ANIME', 'niconico', '東方Project', 'VARIETY', 'イロドリミドリ', 'ゲキマイ', 'ORIGINAL');--> statement-breakpoint
CREATE TYPE "public"."std_chart_difficulty" AS ENUM('basic', 'advanced', 'expert', 'master', 'ultima');--> statement-breakpoint
CREATE TABLE "music_data" (
	"id" integer PRIMARY KEY NOT NULL,
	"category" "category" NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"image" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_level" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "music_level_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"music_id" integer NOT NULL,
	"difficulty" "std_chart_difficulty" NOT NULL,
	"level" text NOT NULL,
	"constant" numeric(3, 1),
	"version" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "music_level" ADD CONSTRAINT "music_level_music_id_music_data_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."music_data"("id") ON DELETE no action ON UPDATE no action;