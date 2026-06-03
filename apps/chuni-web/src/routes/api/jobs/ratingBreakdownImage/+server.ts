import { error, json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

import { env } from "$env/dynamic/private";
import { ratingBreakdownImageQuerySchema } from "$lib/api/schemas/job";
import { db } from "$lib/db";
import { getUserIdFromApiKey, getUserIdFromRequest } from "$lib/server/auth";

import {
  parseRatingBreakdownImageUploadRequest,
  ratingBreakdownImageExistsInS3,
  RatingBreakdownImageUploadError,
  uploadRatingBreakdownImageToS3,
} from "@repo/core/web";
import { jobTable } from "@repo/database/chuni";

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
 * GET /api/jobs/ratingBreakdownImage?jobId=123
 * Check whether a job has an uploaded rating breakdown image.
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

    const hasImage = await ratingBreakdownImageExistsInS3({
      config: getStorageConfig(),
      userId,
      jobId,
    });

    return json({
      jobId,
      hasImage,
      imageUrl: hasImage
        ? `/api/jobs/ratingBreakdownImage/file?jobId=${jobId}`
        : null,
    });
  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }

    console.error("Error checking rating breakdown image:", err);
    error(500, "Failed to check rating breakdown image");
  }
};

/**
 * POST /api/jobs/ratingBreakdownImage
 * Upload the generated rating breakdown image for a job to S3.
 */
export const POST: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    error(401, "Unauthorized: API key required in Authorization Bearer header");
  }

  const apiKey = authHeader.substring(7);
  const userId = await getUserIdFromApiKey(apiKey);

  let upload: Awaited<
    ReturnType<typeof parseRatingBreakdownImageUploadRequest>
  >;

  try {
    upload = await parseRatingBreakdownImageUploadRequest(request);
  } catch (err) {
    if (err instanceof RatingBreakdownImageUploadError) {
      error(400, err.message);
    }

    throw err;
  }

  try {
    await assertJobBelongsToUser(upload.jobId, userId);

    const imageKey = await uploadRatingBreakdownImageToS3({
      config: getStorageConfig(),
      upload,
      userId,
    });

    return json({
      success: true,
      message: "Rating breakdown image uploaded successfully",
      byteSize: upload.byteSize,
      imageKey,
    });
  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }

    console.error("Error uploading rating breakdown image:", err);
    error(500, "Failed to upload rating breakdown image");
  }
};
