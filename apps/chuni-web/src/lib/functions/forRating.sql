-- SQL queries used in forRating.ts

SELECT job.id
FROM player_data
         LEFT JOIN job ON player_data.job_id = job.id
WHERE job.user_id = <USER_ID>
ORDER BY job.id DESC
LIMIT 1;

SELECT for_rating.rating_type,
       for_rating.order,
       music_data.id,
       music_data.title,
       music_record.difficulty,
       music_level.level,
       music_level.constant,
       music_record.score,
       music_record.clear_mark,
       music_record.fc,
       music_record.aj,
       music_record.full_chain
FROM for_rating
         LEFT JOIN music_record ON for_rating.record_id = music_record.id
         LEFT JOIN music_data ON music_record.music_id = music_data.id
         LEFT JOIN music_level
                   ON music_data.id = music_level.music_id AND music_record.difficulty = music_level.difficulty AND
                      for_rating.version = music_level.version
WHERE for_rating.job_id = <JOB_ID>;
