import { expect, test } from "vitest";

import {
  buildRatingMilestoneProgress,
  findLatestRatingReset,
  formatRatingMilestoneElapsed,
  type RatingMilestoneDefinition,
  type RatingMilestoneRecord,
} from "./ratingMilestones.js";

const milestones: RatingMilestoneDefinition[] = [
  { id: "ten", label: "Ten", rating: 10 },
  { id: "twelve", label: "Twelve", rating: 12 },
  { id: "fourteen", label: "Fourteen", rating: 14 },
];

test("builds all-time and current-version milestone achievements", () => {
  const records: RatingMilestoneRecord[] = [
    { date: new Date("2025-01-01T10:00:00"), rating: 10.5, jobId: 1 },
    { date: new Date("2025-02-01T10:00:00"), rating: 12.25, jobId: 2 },
    { date: new Date("2025-03-01T10:00:00"), rating: 9.75, jobId: 3 },
    { date: new Date("2025-04-01T10:00:00"), rating: 11.5, jobId: 4 },
  ];

  const progress = buildRatingMilestoneProgress(milestones, records);

  expect(progress.currentVersionStart).toStrictEqual(records[2].date);
  expect(progress.allTime.map((m) => m.jobId)).toStrictEqual([1, 2, null]);
  expect(progress.allTime.map((m) => m.previousAchievedAt)).toStrictEqual([
    null,
    records[0].date,
    records[1].date,
  ]);
  expect(progress.currentVersion.map((m) => m.jobId)).toStrictEqual([
    4,
    null,
    null,
  ]);
});

test("current-version milestones use all records when no reset is detected", () => {
  const records: RatingMilestoneRecord[] = [
    { date: new Date("2025-01-01T10:00:00"), rating: 10.5, jobId: 1 },
    { date: new Date("2025-02-01T10:00:00"), rating: 12.25, jobId: 2 },
  ];

  const progress = buildRatingMilestoneProgress(milestones, records);

  expect(progress.currentVersionStart).toBeNull();
  expect(progress.currentVersion).toStrictEqual(progress.allTime);
});

test("formats elapsed time between milestone achievements", () => {
  expect(
    formatRatingMilestoneElapsed(
      new Date("2025-01-01T10:00:00"),
      new Date("2025-01-01T18:00:00"),
    ),
  ).toBe("same day");
  expect(
    formatRatingMilestoneElapsed(
      new Date("2025-01-01T10:00:00"),
      new Date("2025-01-08T10:00:00"),
    ),
  ).toBe("7 days");
  expect(
    formatRatingMilestoneElapsed(
      new Date("2025-01-01T10:00:00"),
      new Date("2025-04-01T10:00:00"),
    ),
  ).toBe("3 months");
  expect(
    formatRatingMilestoneElapsed(
      new Date("2024-01-01T10:00:00"),
      new Date("2025-03-01T10:00:00"),
    ),
  ).toBe("1 year 2 months");
});

test("can detect reset from a separate record series", () => {
  const milestoneRecords: RatingMilestoneRecord[] = [
    { date: new Date("2024-12-01T10:00:00"), rating: 14.25 },
    { date: new Date("2025-02-01T10:00:00"), rating: 12.25, jobId: 2 },
    { date: new Date("2025-03-01T10:00:00"), rating: 9.75, jobId: 3 },
    { date: new Date("2025-04-01T10:00:00"), rating: 11.5, jobId: 4 },
  ];
  const resetRecords = milestoneRecords.filter((record) => record.jobId);

  const progress = buildRatingMilestoneProgress(milestones, milestoneRecords, {
    resetRecords,
  });

  expect(progress.currentVersionStart).toStrictEqual(
    new Date("2025-03-01T10:00:00"),
  );
  expect(progress.currentVersion.map((m) => m.jobId)).toStrictEqual([
    4,
    null,
    null,
  ]);
});

test("reset detection mirrors heatmap daily-latest behavior", () => {
  const records: RatingMilestoneRecord[] = [
    { date: new Date("2025-01-01T09:00:00"), rating: 13, jobId: 1 },
    { date: new Date("2025-01-01T21:00:00"), rating: 12, jobId: 2 },
    { date: new Date("2025-01-02T09:00:00"), rating: 12.5, jobId: 3 },
    { date: new Date("2025-01-03T09:00:00"), rating: 11, jobId: 4 },
  ];

  expect(findLatestRatingReset(records)?.jobId).toBe(4);
});
