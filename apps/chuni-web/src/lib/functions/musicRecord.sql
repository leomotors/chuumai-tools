-- SQL queries used in musicRecord.ts

SELECT music_record.difficulty,
       music_record.score,
       music_record.clear_mark,
       music_record.fc,
       music_record.aj,
       music_record.full_chain,
       player_data.last_played
FROM music_record
         INNER JOIN job
                    ON music_record.job_id = job.id
         LEFT JOIN player_data ON job.id = player_data.job_id
WHERE user_id = <USER_ID>
  AND music_id = <MUSIC_ID>;