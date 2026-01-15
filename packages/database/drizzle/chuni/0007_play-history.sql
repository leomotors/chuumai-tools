CREATE TABLE "play_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "play_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer,
	"music_title" text NOT NULL,
	"difficulty" "std_chart_difficulty",
	"score" integer NOT NULL,
	"clear_mark" "clear_mark",
	"fc" boolean NOT NULL,
	"aj" boolean NOT NULL,
	"full_chain" integer NOT NULL,
	"track_no" integer NOT NULL,
	"played_at" timestamp NOT NULL,
	CONSTRAINT "play_history_played_at_unique" UNIQUE("played_at")
);
--> statement-breakpoint
ALTER TABLE "play_history" ADD CONSTRAINT "play_history_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;