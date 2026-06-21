import { error } from "@sveltejs/kit";
import { and, desc, eq, isNotNull } from "drizzle-orm";

import { db } from "$lib/db";
import { getUserIdFromRequest } from "$lib/server/auth";

import { jobFullDataQuerySchema } from "@repo/core/web";
import { jobTable, rawScrapeDataTable } from "@repo/database/chuni";

import type { RequestHandler } from "./$types";

/**
 * GET /api/jobs/fullData?jobId=123
 * Download the full play data JSON captured for a scraper job.
 *
 * The full_play_data column is large (~200-300 kB) and is selected ONLY here,
 * so Postgres TOAST keeps it out-of-line and other queries are unaffected.
 * Ownership is verified before the large column is fetched.
 */
export const GET: RequestHandler = async ({ request, url, locals }) => {
  const userId = await getUserIdFromRequest(request, locals);
  const queryResult = jobFullDataQuerySchema.safeParse({
    jobId: url.searchParams.get("jobId"),
  });

  if (!queryResult.success) {
    error(400, `Invalid query: ${queryResult.error.message}`);
  }

  const { jobId } = queryResult.data;

  // Verify ownership without touching the large column.
  const [job] = await db
    .select({ userId: jobTable.userId })
    .from(jobTable)
    .where(eq(jobTable.id, jobId))
    .limit(1);

  if (!job) {
    error(404, `Job ${jobId} not found`);
  }

  if (job.userId !== userId) {
    error(403, `Forbidden: Job ${jobId} does not belong to authenticated user`);
  }

  // Only now fetch the large full_play_data column.
  const [row] = await db
    .select({ fullPlayData: rawScrapeDataTable.fullPlayData })
    .from(rawScrapeDataTable)
    .where(
      and(
        eq(rawScrapeDataTable.jobId, jobId),
        isNotNull(rawScrapeDataTable.fullPlayData),
      ),
    )
    .orderBy(desc(rawScrapeDataTable.id))
    .limit(1);

  if (!row?.fullPlayData) {
    error(404, `Full play data is not available for job ${jobId}`);
  }

  return new Response(row.fullPlayData, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="full-play-data-job-${jobId}.json"`,
    },
  });
};
