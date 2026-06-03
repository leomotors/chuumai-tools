import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

import { env } from "$env/dynamic/private";
import { ratingBreakdownImageQuerySchema } from "$lib/api/schemas/job";
import { db } from "$lib/db";
import { getUserIdFromRequest } from "$lib/server/auth";

import {
  getRatingBreakdownImageFromS3,
  RatingBreakdownImageNotFoundError,
} from "@repo/core/web";
import { jobTable } from "@repo/database/maimai";

import type { RequestHandler } from "./$types";

function getStorageConfig() {
  return {
    endpoint: env.AWS_ENDPOINT,
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    bucketName: env.AWS_BUCKET_NAME,
  };
}

async function assertJobBelongsToUser(jobId: number, userId: string) {
  const [existingJob] = await db
    .select({ userId: jobTable.userId })
    .from(jobTable)
    .where(eq(jobTable.id, jobId))
    .limit(1);

  if (!existingJob) {
    error(400, `Job ${jobId} not found`);
  }

  if (existingJob.userId !== userId) {
    error(403, `Forbidden: Job ${jobId} does not belong to authenticated user`);
  }
}

/**
 * GET /api/jobs/ratingBreakdownImage/file?jobId=123
 * Retrieve the uploaded rating breakdown image for a job.
 */
export const GET: RequestHandler = async ({ request, url, locals }) => {
  const userId = await getUserIdFromRequest(request, locals);
  const queryResult = ratingBreakdownImageQuerySchema.safeParse({
    jobId: url.searchParams.get("jobId"),
  });

  if (!queryResult.success) {
    error(400, `Invalid query: ${queryResult.error.message}`);
  }

  const { jobId } = queryResult.data;

  try {
    await assertJobBelongsToUser(jobId, userId);

    const image = await getRatingBreakdownImageFromS3({
      config: getStorageConfig(),
      userId,
      jobId,
    });

    const headers = new Headers({
      "Content-Type": image.contentType,
      "Cache-Control": "private, max-age=300",
      "Cross-Origin-Resource-Policy": "same-origin",
    });

    if (image.contentLength !== null) {
      headers.set("Content-Length", image.contentLength.toString());
    }

    return new Response(image.body, { headers });
  } catch (err) {
    if (err instanceof RatingBreakdownImageNotFoundError) {
      error(404, "Rating breakdown image not found");
    }

    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }

    console.error("Error retrieving rating breakdown image:", err);
    error(500, "Failed to retrieve rating breakdown image");
  }
};
