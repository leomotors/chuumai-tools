CREATE TYPE "public"."category" AS ENUM('POPS & ANIME', 'niconico', '東方Project', 'VARIETY', 'イロドリミドリ', 'ゲキマイ', 'ORIGINAL');--> statement-breakpoint
CREATE TYPE "public"."clear_mark" AS ENUM('CLEAR', 'HARD', 'BRAVE', 'ABSOLUTE', 'CATASTROPHY');--> statement-breakpoint
CREATE TYPE "public"."ranks" AS ENUM('D', 'C', 'B', 'BB', 'BBB', 'A', 'AA', 'AAA', 'S', 'S+', 'SS', 'SS+', 'SSS', 'SSS+');--> statement-breakpoint
CREATE TYPE "public"."rarity_level" AS ENUM('NORMAL', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'RAINBOW', 'HOLOGRAPHIC');--> statement-breakpoint
CREATE TYPE "public"."rating_type" AS ENUM('BEST', 'NEW', 'SELECTION');--> statement-breakpoint
CREATE TYPE "public"."std_chart_difficulty" AS ENUM('basic', 'advanced', 'expert', 'master', 'ultima');--> statement-breakpoint
CREATE TABLE "manual_rating" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "manual_rating_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"rating" numeric(4, 2) NOT NULL,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
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
	"version" text NOT NULL,
	CONSTRAINT "music_level_music_id_difficulty_version_unique" UNIQUE("music_id","difficulty","version")
);
--> statement-breakpoint
CREATE TABLE "for_rating" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "for_rating_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer,
	"music_id" integer NOT NULL,
	"record_id" integer NOT NULL,
	"rating_type" "rating_type" NOT NULL,
	"order" integer NOT NULL,
	"version" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_start" timestamp DEFAULT now() NOT NULL,
	"job_end" timestamp,
	"job_error" text,
	"is_from_old_version" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_record" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "music_record_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer,
	"music_id" integer NOT NULL,
	"difficulty" "std_chart_difficulty" NOT NULL,
	"score" integer NOT NULL,
	"clear_mark" "clear_mark",
	"fc" boolean NOT NULL,
	"aj" boolean NOT NULL,
	"full_chain" integer NOT NULL,
	CONSTRAINT "music_record_unique" UNIQUE("music_id","difficulty","score","clear_mark","fc","aj","full_chain")
);
--> statement-breakpoint
CREATE TABLE "player_data" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "player_data_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer,
	"character_rarity" "rarity_level" NOT NULL,
	"character_image" text NOT NULL,
	"team_name" text,
	"team_emblem" "rarity_level",
	"honor1_text" text NOT NULL,
	"honor1_rarity" "rarity_level" NOT NULL,
	"honor2_text" text,
	"honor2_rarity" "rarity_level",
	"honor3_text" text,
	"honor3_rarity" "rarity_level",
	"player_level" integer NOT NULL,
	"player_name" text NOT NULL,
	"class_emblem" integer,
	"rating" numeric(4, 2) NOT NULL,
	"max_rating" numeric(4, 2),
	"overpower_value" numeric NOT NULL,
	"overpower_percent" numeric NOT NULL,
	"last_played" timestamp NOT NULL,
	"current_currency" integer NOT NULL,
	"total_currency" integer NOT NULL,
	"play_count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_scrape_data" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "raw_scrape_data_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer,
	"version" text NOT NULL,
	"player_data_html" text,
	"all_music_record_html" text,
	"data_for_image_gen" text
);
--> statement-breakpoint
ALTER TABLE "music_level" ADD CONSTRAINT "music_level_music_id_music_data_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."music_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "for_rating" ADD CONSTRAINT "for_rating_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_record" ADD CONSTRAINT "music_record_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_data" ADD CONSTRAINT "player_data_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_scrape_data" ADD CONSTRAINT "raw_scrape_data_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;