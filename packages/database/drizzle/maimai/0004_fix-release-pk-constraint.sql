/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'music_version'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

ALTER TABLE "music_version" DROP CONSTRAINT "music_version_pkey";--> statement-breakpoint
ALTER TABLE "music_version" ADD CONSTRAINT "music_version_title_chart_type_unique" UNIQUE("title","chart_type");