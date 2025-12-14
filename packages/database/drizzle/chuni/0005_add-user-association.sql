CREATE TABLE "api_key" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"api_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "manual_rating" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "user_id" integer;