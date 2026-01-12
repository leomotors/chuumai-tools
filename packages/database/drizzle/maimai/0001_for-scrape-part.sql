CREATE TABLE "music_version" (
	"title" text PRIMARY KEY NOT NULL,
	"chart_type" chart_type NOT NULL,
	"version" text NOT NULL
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
ALTER TABLE "music_record" DROP CONSTRAINT "music_record_unique";--> statement-breakpoint
ALTER TABLE "music_record" ADD COLUMN "dx_score" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "music_record" ADD COLUMN "dx_score_max" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "player_data" ADD COLUMN "last_played" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "music_version" ADD CONSTRAINT "music_version_title_music_data_title_fk" FOREIGN KEY ("title") REFERENCES "public"."music_data"("title") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_history" ADD CONSTRAINT "play_history_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_data" DROP COLUMN "version_name";--> statement-breakpoint
ALTER TABLE "music_record" ADD CONSTRAINT "music_record_unique" UNIQUE NULLS NOT DISTINCT("music_title","chart_type","difficulty","score","dx_score","dx_score_max","combo_mark","sync_mark");