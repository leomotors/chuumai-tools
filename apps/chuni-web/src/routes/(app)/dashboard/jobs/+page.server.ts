import { env } from "$env/dynamic/private";
import { db } from "$lib/db";

import { ratingBreakdownImageExistsInS3 } from "@repo/core/web";
import { jobTable } from "@repo/database/chuni";
import { desc, eq } from "drizzle-orm";

import type { PageServerLoad } from "./$types";

const JOB_LIST_LIMIT = 100;

function hasStorageConfig() {
  return Boolean(
    env.AWS_ENDPOINT &&
      env.AWS_REGION &&
      env.AWS_ACCESS_KEY_ID &&
      env.AWS_SECRET_ACCESS_KEY &&
      env.AWS_BUCKET_NAME,
  );
}

function getStorageConfig() {
  return {
    endpoint: env.AWS_ENDPOINT,
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    bucketName: env.AWS_BUCKET_NAME,
  };
}

function normalizeJobEnd(jobStart: Date, jobEnd: Date | null) {
  if (!jobEnd || jobEnd >= jobStart) {
    return jobEnd;
  }

  const timezoneOffsetMs = jobEnd.getTimezoneOffset() * 60 * 1000;
  const correctedJobEnd = new Date(jobEnd.getTime() - timezoneOffsetMs);

  return correctedJobEnd >= jobStart ? correctedJobEnd : jobEnd;
}

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();

  const jobs = await db
    .select({
      id: jobTable.id,
      jobStart: jobTable.jobStart,
      jobEnd: jobTable.jobEnd,
      jobError: jobTable.jobError,
      jobLog: jobTable.jobLog,
      isFromOldVersion: jobTable.isFromOldVersion,
    })
    .from(jobTable)
    .where(eq(jobTable.userId, user.id))
    .orderBy(desc(jobTable.jobStart))
    .limit(JOB_LIST_LIMIT);

  const storageConfig = getStorageConfig();
  const canCheckImages = Boolean(user.id && hasStorageConfig());

  return {
    jobs: await Promise.all(
      jobs.map(async (job) => ({
        ...job,
        jobStart: job.jobStart.toISOString(),
        jobEnd: normalizeJobEnd(job.jobStart, job.jobEnd)?.toISOString() ?? null,
        hasRatingBreakdownImage: canCheckImages
          ? await ratingBreakdownImageExistsInS3({
              config: storageConfig,
              userId: user.id!,
              jobId: job.id,
            }).catch((err) => {
              console.error(
                `Error checking rating breakdown image for job ${job.id}:`,
                err,
              );
              return false;
            })
          : false,
      })),
    ),
  };
};
