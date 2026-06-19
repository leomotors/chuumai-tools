CREATE TABLE "rating_analysis_cache" (
	"user_id" text PRIMARY KEY NOT NULL,
	"latest_job_id" integer NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rating_analysis_cache" ADD CONSTRAINT "rating_analysis_cache_latest_job_id_job_id_fk" FOREIGN KEY ("latest_job_id") REFERENCES "public"."job"("id") ON DELETE no action ON UPDATE no action;