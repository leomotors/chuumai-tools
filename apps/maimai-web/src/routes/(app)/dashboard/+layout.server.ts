import { error } from "@sveltejs/kit";
import { count, eq } from "drizzle-orm";

import { db } from "$lib/db";
import { getUserStats } from "$lib/functions/userStats";

import { apiKey, jobTable, manualRatingTable } from "@repo/database/maimai";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent }) => {
  const { session } = await parent();

  if (!session?.user?.id) {
    error(401, "Unauthorized");
  }

  const [jobResult, apiKeyResult, userStats, manualRatings] = await Promise.all(
    [
      db
        .select({ count: count() })
        .from(jobTable)
        .where(eq(jobTable.userId, session.user.id)),
      db
        .select({ apiKey: apiKey.apiKey, createdAt: apiKey.createdAt })
        .from(apiKey)
        .where(eq(apiKey.userId, session.user.id)),
      getUserStats(session.user.id),
      db
        .select({
          rating: manualRatingTable.rating,
          timestamp: manualRatingTable.timestamp,
        })
        .from(manualRatingTable)
        .where(eq(manualRatingTable.userId, session.user.id)),
    ],
  );

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      image: session.user.image,
    },
    jobCount: jobResult[0]?.count,
    apiKey: apiKeyResult[0]?.apiKey ?? null,
    apiKeyCreatedAt: apiKeyResult[0]?.createdAt ?? null,
    userStats,
    manualRatings,
  };
};
