import { describe, expect, it } from "vitest";

import {
  analyzeProgressionRegression,
  computeLinearRegression,
  findNextRatingMilestone,
  formatProgressionRegressionEta,
} from "./progressionLinearRegression.js";
import type { RatingMilestoneDefinition } from "./ratingMilestones.js";

const milestones: RatingMilestoneDefinition[] = [
  { id: "start", label: "Start", rating: 0, isStartingPoint: true },
  { id: "orange", label: "Orange", rating: 4 },
  { id: "red", label: "Red", rating: 7 },
];

describe("computeLinearRegression", () => {
  it("returns null with fewer than two points", () => {
    expect(
      computeLinearRegression([{ date: new Date("2026-01-01"), value: 10 }]),
    ).toBeNull();
  });

  it("returns null when slope is zero", () => {
    expect(
      computeLinearRegression([
        { date: new Date("2026-01-01"), value: 10 },
        { date: new Date("2026-01-02"), value: 10 },
      ]),
    ).toBeNull();
  });

  it("returns null when slope is negative", () => {
    expect(
      computeLinearRegression([
        { date: new Date("2026-01-01"), value: 15 },
        { date: new Date("2026-01-02"), value: 14 },
      ]),
    ).toBeNull();
  });

  it("fits a positive trend", () => {
    const regression = computeLinearRegression([
      { date: new Date("2026-01-01T00:00:00Z"), value: 10 },
      { date: new Date("2026-02-01T00:00:00Z"), value: 11 },
    ]);

    expect(regression).not.toBeNull();
    expect(
      regression!.predictValue(new Date("2026-01-01T00:00:00Z")),
    ).toBeCloseTo(10);
    expect(
      regression!.predictValue(new Date("2026-02-01T00:00:00Z")),
    ).toBeCloseTo(11);
    expect(regression!.predictDate(12)?.getTime()).toBeGreaterThan(
      new Date("2026-02-01T00:00:00Z").getTime(),
    );
  });
});

describe("findNextRatingMilestone", () => {
  it("skips starting points and already reached milestones", () => {
    expect(findNextRatingMilestone(milestones, 3.5)?.id).toBe("orange");
    expect(findNextRatingMilestone(milestones, 4)?.id).toBe("red");
    expect(findNextRatingMilestone(milestones, 7)).toBeNull();
  });
});

describe("analyzeProgressionRegression", () => {
  it("builds a line through the selected timeframe and predicts the next milestone", () => {
    const points = [
      { date: new Date("2026-01-01T00:00:00Z"), value: 3 },
      { date: new Date("2026-02-01T00:00:00Z"), value: 3.5 },
    ];

    const analysis = analyzeProgressionRegression({
      points,
      milestones,
      currentRating: 3.5,
    });

    expect(analysis).not.toBeNull();
    expect(analysis!.nextMilestone.id).toBe("orange");
    expect(
      analysis!.futureMilestones.map((entry) => entry.milestone.id),
    ).toEqual(["orange", "red"]);
    expect(analysis!.linePoints[0].date).toEqual(points[0].date);
    expect(analysis!.linePoints.at(-1)!.date).toEqual(points[1].date);
    expect(analysis!.predictedDate.getTime()).toBeGreaterThan(
      points[1].date.getTime(),
    );
  });

  it("returns null when the trend is flat", () => {
    expect(
      analyzeProgressionRegression({
        points: [
          { date: new Date("2026-01-01"), value: 3 },
          { date: new Date("2026-02-01"), value: 3 },
        ],
        milestones,
        currentRating: 3,
      }),
    ).toBeNull();
  });
});

describe("formatProgressionRegressionEta", () => {
  it("formats relative milestone dates", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(
      formatProgressionRegressionEta(new Date("2026-01-10T00:00:00Z"), now),
    ).toBe("in 9 days");
    expect(
      formatProgressionRegressionEta(new Date("2025-12-31T00:00:00Z"), now),
    ).toBe("soon");
  });
});
