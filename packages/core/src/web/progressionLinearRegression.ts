import type { RatingMilestoneDefinition } from "./ratingMilestones.js";

export type ProgressionDataPoint = {
  date: Date;
  value: number;
};

export type LinearRegressionResult = {
  slope: number;
  intercept: number;
  predictValue: (date: Date) => number;
  predictDate: (value: number) => Date | null;
};

export type ProgressionMilestonePrediction = {
  milestone: RatingMilestoneDefinition;
  predictedDate: Date;
};

export type ProgressionRegressionAnalysis = {
  regression: LinearRegressionResult;
  linePoints: ProgressionDataPoint[];
  nextMilestone: RatingMilestoneDefinition;
  predictedDate: Date;
  futureMilestones: ProgressionMilestonePrediction[];
};

export function computeLinearRegression(
  points: ProgressionDataPoint[],
): LinearRegressionResult | null {
  if (points.length < 2) return null;

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const { date, value } of points) {
    const x = date.getTime();
    sumX += x;
    sumY += value;
    sumXY += x * value;
    sumX2 += x * x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  if (slope <= 0) return null;

  const intercept = (sumY - slope * sumX) / n;

  return {
    slope,
    intercept,
    predictValue: (date: Date) => slope * date.getTime() + intercept,
    predictDate: (value: number) => {
      const time = (value - intercept) / slope;
      if (!Number.isFinite(time)) return null;
      return new Date(time);
    },
  };
}

export function findNextRatingMilestone(
  milestones: RatingMilestoneDefinition[],
  currentRating: number,
): RatingMilestoneDefinition | null {
  return listFutureRatingMilestones(milestones, currentRating)[0] ?? null;
}

export function listFutureRatingMilestones(
  milestones: RatingMilestoneDefinition[],
  currentRating: number,
): RatingMilestoneDefinition[] {
  return [...milestones]
    .filter((milestone) => !milestone.isStartingPoint)
    .filter((milestone) => milestone.rating > currentRating)
    .sort((a, b) => a.rating - b.rating);
}

export function predictFutureMilestoneDates(
  regression: LinearRegressionResult,
  milestones: RatingMilestoneDefinition[],
  currentRating: number,
): ProgressionMilestonePrediction[] {
  return listFutureRatingMilestones(milestones, currentRating).flatMap(
    (milestone) => {
      const predictedDate = regression.predictDate(milestone.rating);
      if (!predictedDate) return [];
      return [{ milestone, predictedDate }];
    },
  );
}

export function analyzeProgressionRegression({
  points,
  milestones,
  currentRating,
}: {
  points: ProgressionDataPoint[];
  milestones: RatingMilestoneDefinition[];
  currentRating: number;
}): ProgressionRegressionAnalysis | null {
  const regression = computeLinearRegression(points);
  if (!regression) return null;

  const futureMilestones = predictFutureMilestoneDates(
    regression,
    milestones,
    currentRating,
  );
  if (futureMilestones.length === 0) return null;

  const startDate = points[0].date;
  const endDate = points[points.length - 1].date;
  const nextMilestone = futureMilestones[0].milestone;
  const predictedDate = futureMilestones[0].predictedDate;

  return {
    regression,
    linePoints: [
      { date: startDate, value: regression.predictValue(startDate) },
      { date: endDate, value: regression.predictValue(endDate) },
    ],
    nextMilestone,
    predictedDate,
    futureMilestones,
  };
}

export function formatProgressionRegressionEta(
  predictedDate: Date,
  now = new Date(),
): string {
  const elapsedDays = Math.round(
    (predictedDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (elapsedDays <= 0) return "soon";
  if (elapsedDays === 1) return "in 1 day";
  if (elapsedDays < 60) return `in ${elapsedDays} days`;

  if (elapsedDays < 365) {
    const months = Math.round(elapsedDays / 30);
    return months === 1 ? "in 1 month" : `in ${months} months`;
  }

  const years = Math.floor(elapsedDays / 365);
  const months = Math.round((elapsedDays % 365) / 30);
  if (months === 0) {
    return years === 1 ? "in 1 year" : `in ${years} years`;
  }
  const yearLabel = years === 1 ? "1 year" : `${years} years`;
  const monthLabel = months === 1 ? "1 month" : `${months} months`;
  return `in ${yearLabel} ${monthLabel}`;
}

export function formatProgressionMilestonePrediction(
  label: string,
  predictedDate: Date,
  now = new Date(),
): string {
  return `Projected ${label}: ${predictedDate.toLocaleDateString()} (${formatProgressionRegressionEta(predictedDate, now)})`;
}
