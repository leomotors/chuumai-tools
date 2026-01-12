import { error, json } from "@sveltejs/kit";

import { db } from "$lib/db";
import { getUserIdFromApiKey } from "$lib/server/auth";

import { jobTable } from "@repo/database/maimai";

import type { RequestHandler } from "./$types";

/**
 * POST /api/jobs/create
 * Create a new job entry for tracking scraper execution
 */
export const POST: RequestHandler = async ({ request }) => {
  // Authenticate using API key
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    error(401, "Unauthorized: API key required in Authorization Bearer header");
  }

  const apiKey = authHeader.substring(7);
  const userId = await getUserIdFromApiKey(apiKey);

  try {
    // Create new job entry
    const [newJob] = await db
      .insert(jobTable)
      .values({
        userId,
      })
      .returning({
        id: jobTable.id,
        jobStart: jobTable.jobStart,
      });

    return json(
      {
        jobId: newJob.id,
        jobStart: newJob.jobStart.toISOString(),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error creating job:", err);
    error(500, "Failed to create job");
  }
};
