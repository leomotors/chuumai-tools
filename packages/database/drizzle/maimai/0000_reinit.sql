CREATE TYPE "public"."category" AS ENUM('POPS&アニメ', 'niconico&ボーカロイド', '東方Project', 'ゲーム&バラエティ', 'maimai', 'オンゲキ&CHUNITHM');--> statement-breakpoint
CREATE TYPE "public"."chart_type" AS ENUM('std', 'dx');--> statement-breakpoint
CREATE TYPE "public"."combo_mark" AS ENUM('NONE', 'FC', 'FC+', 'AP', 'AP+');--> statement-breakpoint
CREATE TYPE "public"."ranks" AS ENUM('D', 'C', 'B', 'BB', 'BBB', 'A', 'AA', 'AAA', 'S', 'S+', 'SS', 'SS+', 'SSS', 'SSS+');--> statement-breakpoint
CREATE TYPE "public"."rarity_level" AS ENUM('NORMAL', 'BRONZE', 'SILVER', 'GOLD', 'RAINBOW');--> statement-breakpoint
CREATE TYPE "public"."rating_type" AS ENUM('OLD', 'NEW', 'SELECTION_OLD', 'SELECTION_NEW');--> statement-breakpoint
CREATE TYPE "public"."std_chart_difficulty" AS ENUM('basic', 'advanced', 'expert', 'master', 'remaster');--> statement-breakpoint
CREATE TYPE "public"."sync_mark" AS ENUM('NONE', 'SYNC', 'FS', 'FS+', 'FDX', 'FDX+');--> statement-breakpoint
CREATE TABLE "music_data" (
	"title" text PRIMARY KEY NOT NULL,
	"category" "category" NOT NULL,
	"artist" text NOT NULL,
	"image" text NOT NULL,
	"version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_level" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "music_level_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"music_title" text NOT NULL,
	"chart_type" chart_type NOT NULL,
	"difficulty" "std_chart_difficulty" NOT NULL,
	"level" text NOT NULL,
	"constant" numeric(3, 1),
	"version" text NOT NULL,
	CONSTRAINT "music_level_music_title_chart_type_difficulty_version_unique" UNIQUE("music_title","chart_type","difficulty","version")
);
--> statement-breakpoint
CREATE TABLE "music_version" (
	"title" text PRIMARY KEY NOT NULL,
	"chart_type" chart_type NOT NULL,
	"version" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manual_rating" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "manual_rating_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text,
	"rating" integer NOT NULL,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "for_rating" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "for_rating_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer,
	"music_title" text NOT NULL,
	"record_id" integer NOT NULL,
	"rating_type" "rating_type" NOT NULL,
	"order" integer NOT NULL,
	"version" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text,
	"job_start" timestamp DEFAULT now() NOT NULL,
	"job_end" timestamp,
	"job_error" text,
	"job_log" text,
	"is_from_old_version" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_record" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "music_record_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer,
	"music_title" text NOT NULL,
	"chart_type" chart_type NOT NULL,
	"difficulty" "std_chart_difficulty" NOT NULL,
	"score" integer NOT NULL,
	"dx_score" integer NOT NULL,
	"dx_score_max" integer NOT NULL,
	"combo_mark" "combo_mark" NOT NULL,
	"sync_mark" "sync_mark" NOT NULL,
	CONSTRAINT "music_record_unique" UNIQUE NULLS NOT DISTINCT("music_title","chart_type","difficulty","score","dx_score","dx_score_max","combo_mark","sync_mark")
);
--> statement-breakpoint
CREATE TABLE "play_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "play_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer,
	"music_title" text NOT NULL,
	"chart_type" chart_type NOT NULL,
	"difficulty" "std_chart_difficulty" NOT NULL,
	"score" integer NOT NULL,
	"dx_score" integer NOT NULL,
	"dx_score_max" integer NOT NULL,
	"combo_mark" "combo_mark" NOT NULL,
	"sync_mark" "sync_mark" NOT NULL,
	"track_no" integer NOT NULL,
	"played_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_data" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "player_data_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer,
	"character_image" text NOT NULL,
	"honor_text" text NOT NULL,
	"honor_rarity" "rarity_level" NOT NULL,
	"player_name" text NOT NULL,
	"course_rank" integer NOT NULL,
	"class_rank" integer NOT NULL,
	"rating" integer NOT NULL,
	"star" integer NOT NULL,
	"play_count_current" integer NOT NULL,
	"play_count_total" integer NOT NULL,
	"last_played" timestamp NOT NULL
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
CREATE TABLE "api_key" (
	"user_id" text PRIMARY KEY NOT NULL,
	"api_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "music_level" ADD CONSTRAINT "music_level_music_title_music_data_title_fk" FOREIGN KEY ("music_title") REFERENCES "public"."music_data"("title") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_version" ADD CONSTRAINT "music_version_title_music_data_title_fk" FOREIGN KEY ("title") REFERENCES "public"."music_data"("title") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "for_rating" ADD CONSTRAINT "for_rating_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_record" ADD CONSTRAINT "music_record_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_history" ADD CONSTRAINT "play_history_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_data" ADD CONSTRAINT "player_data_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_scrape_data" ADD CONSTRAINT "raw_scrape_data_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;