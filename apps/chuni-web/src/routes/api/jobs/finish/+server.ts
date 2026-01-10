import { error, json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

import { finishJobRequestSchema } from "$lib/api/schemas/job";
import { db } from "$lib/db";
import { getUserIdFromApiKey } from "$lib/server/auth";

import { jobTable } from "@repo/database/chuni";

import type { RequestHandler } from "./$types";

/**
 * PUT /api/jobs/finish
 * Mark a job as finished (success or failure)
 */
export const PUT: RequestHandler = async ({ request }) => {
  // Authenticate using API key
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    error(401, "Unauthorized: API key required in Authorization Bearer header");
  }

  const apiKey = authHeader.substring(7);
  const userId = await getUserIdFromApiKey(apiKey);

  // Parse and validate request body using Zod
  const bodyResult = finishJobRequestSchema.safeParse(await request.json());

  if (!bodyResult.success) {
    error(400, `Invalid request body: ${bodyResult.error.message}`);
  }

  const body = bodyResult.data;

  try {
    // First, verify the job exists and belongs to the user
    const [existingJob] = await db
      .select({ userId: jobTable.userId })
      .from(jobTable)
      .where(eq(jobTable.id, body.jobId))
      .limit(1);

    if (!existingJob) {
      error(400, `Job ${body.jobId} not found`);
    }

    if (existingJob.userId !== userId) {
      error(
        403,
        `Forbidden: Job ${body.jobId} does not belong to authenticated user`,
      );
    }

    // Update the job based on status
    const updateData: {
      jobEnd: Date;
      jobLog?: string;
      jobError?: string;
    } = {
      jobEnd: new Date(),
    };

    if (body.status === "success") {
      updateData.jobLog = body.jobLog;
    } else {
      updateData.jobError = body.jobError;
      if (body.jobLog) {
        updateData.jobLog = body.jobLog;
      }
    }

    await db
      .update(jobTable)
      .set(updateData)
      .where(eq(jobTable.id, body.jobId));

    return json({
      success: true,
      message: `Job ${body.jobId} finished with status: ${body.status}`,
    });
  } catch (err) {
    // Re-throw known errors
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }

    console.error("Error finishing job:", err);
    error(500, "Failed to finish job");
  }
};
