import { error, json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

import { db } from "$lib/db";
import { getUserIdFromRequest } from "$lib/server/auth";

import { jobLogQuerySchema } from "@repo/core/web";
import { jobTable } from "@repo/database/maimai";

import type { RequestHandler } from "./$types";

/**
 * GET /api/jobs/log?jobId=123
 * Retrieve error and log text for a scraper job.
 */
export const GET: RequestHandler = async ({ request, url, locals }) => {
  const userId = await getUserIdFromRequest(request, locals);
  const queryResult = jobLogQuerySchema.safeParse({
    jobId: url.searchParams.get("jobId"),
  });

  if (!queryResult.success) {
    error(400, `Invalid query: ${queryResult.error.message}`);
  }

  const { jobId } = queryResult.data;

  const [job] = await db
    .select({
      userId: jobTable.userId,
      jobError: jobTable.jobError,
      jobLog: jobTable.jobLog,
    })
    .from(jobTable)
    .where(eq(jobTable.id, jobId))
    .limit(1);

  if (!job) {
    error(400, `Job ${jobId} not found`);
  }

  if (job.userId !== userId) {
    error(403, `Forbidden: Job ${jobId} does not belong to authenticated user`);
  }

  return json({
    jobId,
    jobError: job.jobError,
    jobLog: job.jobLog,
  });
};
