import { error } from "@sveltejs/kit";

import { maimaiRatingMilestones } from "@repo/core/maimai";
import { buildRatingMilestoneProgress } from "@repo/core/web";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { user, userStats, manualRatings } = await parent();

  if (!user.id) {
    error(401, "Unauthorized");
  }

  const scrapedMilestoneRecords = userStats.map((stat) => ({
    date: stat.lastPlayed,
    rating: stat.rating,
    jobId: stat.jobId,
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
