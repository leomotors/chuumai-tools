import { describe, expect, test } from "vitest";

import { mergeManualRatingRecords } from "./ratingHistory.js";

describe("mergeManualRatingRecords", () => {
  test("normalizes manual ratings and returns chronological records", () => {
    const records = [
      { date: new Date("2025-02-01T00:00:00Z"), rating: 15.2, jobId: 2 },
      { date: new Date("2025-01-01T00:00:00Z"), rating: 15, jobId: 1 },
    ];

    const result = mergeManualRatingRecords(records, [
      {
        timestamp: new Date("2024-12-01T00:00:00Z"),
        rating: "14.75",
      },
    ]);

    expect(result).toEqual([
      {
        date: new Date("2024-12-01T00:00:00Z"),
        rating: 14.75,
        isManual: true,
      },
      { date: new Date("2025-01-01T00:00:00Z"), rating: 15, jobId: 1 },
      { date: new Date("2025-02-01T00:00:00Z"), rating: 15.2, jobId: 2 },
    ]);
  });
});
