import { error, json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

import { env } from "$env/dynamic/private";
import { db } from "$lib/db";
import { getUserIdFromApiKey } from "$lib/server/auth";

import {
  parseRatingBreakdownImageUploadRequest,
  RatingBreakdownImageUploadError,
  uploadRatingBreakdownImageToS3,
} from "@repo/core/web";
import { jobTable } from "@repo/database/maimai";

import type { RequestHandler } from "./$types";

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
    const [existingJob] = await db
      .select({ userId: jobTable.userId })
      .from(jobTable)
      .where(eq(jobTable.id, upload.jobId))
      .limit(1);

    if (!existingJob) {
      error(400, `Job ${upload.jobId} not found`);
    }

    if (existingJob.userId !== userId) {
      error(
        403,
        `Forbidden: Job ${upload.jobId} does not belong to authenticated user`,
      );
    }

    const imageKey = await uploadRatingBreakdownImageToS3({
      config: {
        endpoint: env.AWS_ENDPOINT,
        region: env.AWS_REGION,
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        bucketName: env.AWS_BUCKET_NAME,
      },
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
