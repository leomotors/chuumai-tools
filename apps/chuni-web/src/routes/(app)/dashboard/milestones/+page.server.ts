import { error } from "@sveltejs/kit";

import { resolveChuniRating } from "$lib/utils/chuniRating";

import { chuniRatingMilestones } from "@repo/core/chuni";
import { buildRatingMilestoneProgress } from "@repo/core/web";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { user, userStats, manualRatings } = await parent();

  if (!user.id) {
    error(401, "Unauthorized");
  }

  const scrapedMilestoneRecords = userStats.map((stat) => ({
    date: stat.lastPlayed,
    rating: resolveChuniRating(stat.rating, stat.calculatedRating),
    jobId: stat.jobId,
    playCount: stat.playCount,
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
      [...chuniRatingMilestones],
      milestoneRecords,
      { resetRecords: scrapedMilestoneRecords },
    ),
  };
};
