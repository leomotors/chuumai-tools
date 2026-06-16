import { desc, eq, sql } from "drizzle-orm";

import { env } from "$env/dynamic/private";
import { db } from "$lib/db";

import {
  getNextJobListLimit,
  parseJobListLimit,
  ratingBreakdownImageExistsInS3,
} from "@repo/core/web";
import { jobTable } from "@repo/database/maimai";

import type { PageServerLoad } from "./$types";

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

export const load: PageServerLoad = async ({ parent, url }) => {
  const { user } = await parent();
  const limit = parseJobListLimit(url.searchParams.get("limit"));

  const jobs = await db
    .select({
      id: jobTable.id,
      jobStart: jobTable.jobStart,
      jobEnd: jobTable.jobEnd,
      hasJobError: sql<boolean>`coalesce(${jobTable.jobError}, '') <> ''`,
      hasJobLog: sql<boolean>`coalesce(${jobTable.jobLog}, '') <> ''`,
      isFromOldVersion: jobTable.isFromOldVersion,
    })
    .from(jobTable)
    .where(eq(jobTable.userId, user.id))
    .orderBy(desc(jobTable.jobStart))
    .limit(limit + 1);

  const storageConfig = getStorageConfig();
  const canCheckImages = Boolean(user.id && hasStorageConfig());
  const visibleJobs = jobs.slice(0, limit);
  const hasMore = jobs.length > limit;

  return {
    limit,
    hasMore,
    nextLimit: getNextJobListLimit(limit, hasMore),
    jobs: await Promise.all(
      visibleJobs.map(async (job) => ({
        ...job,
        jobStart: job.jobStart.toISOString(),
        jobEnd: job.jobEnd?.toISOString() ?? null,
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
