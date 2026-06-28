import { eq } from "drizzle-orm";

import { db } from "$lib/db";

import { manualRatingTable } from "@repo/database/chuni";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();

  const manualRatings = await db
    .select({
      rating: manualRatingTable.rating,
      timestamp: manualRatingTable.timestamp,
    })
    .from(manualRatingTable)
    .where(eq(manualRatingTable.userId, user.id));

  return {
    manualRatings,
  };
};
