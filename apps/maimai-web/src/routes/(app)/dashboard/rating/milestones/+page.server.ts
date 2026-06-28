import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

import { db } from "$lib/db";

import { maimaiRatingMilestones } from "@repo/core/maimai";
import { buildRatingMilestoneProgress } from "@repo/core/web";
import { manualRatingTable } from "@repo/database/maimai";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { user, userStats } = await parent();

  if (!user.id) {
    error(401, "Unauthorized");
  }

  const manualRatings = await db
    .select({
      rating: manualRatingTable.rating,
      timestamp: manualRatingTable.timestamp,
    })
    .from(manualRatingTable)
    .where(eq(manualRatingTable.userId, user.id));

  const scrapedMilestoneRecords = userStats.map((stat) => ({
    date: stat.lastPlayed,
    rating: stat.rating,
    jobId: stat.jobId,
    playCount: stat.playCountTotal,
  }));
  const milestoneRecords = [
    ...scrapedMilestoneRecords,
    ...manualRatings.map((manualRating) => ({
      date: manualRating.timestamp,
      rating: Number(manualRating.rating),
      jobId: null,
    })),
  ];

  return {
    myMilestones: buildRatingMilestoneProgress(
      [...maimaiRatingMilestones],
      milestoneRecords,
      { resetRecords: scrapedMilestoneRecords },
    ),
  };
};
