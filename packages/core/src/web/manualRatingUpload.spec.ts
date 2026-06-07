import { describe, expect, test } from "vitest";

import {
  parseManualRatingCsv,
  validateManualRatingUploadRecords,
} from "./manualRatingUpload.js";

describe("parseManualRatingCsv", () => {
  test("infers CHUNITHM date and rating columns with headers", () => {
    const preview = parseManualRatingCsv(
      [
        "memo,played_at,current_rating",
        "first,2026-06-01T12:00:00+07:00,16.5034",
        "second,2026-06-02T12:00:00+07:00,16.51",
      ].join("\n"),
      "chuni",
    );

    expect(preview.hasHeader).toBe(true);
    expect(preview.timeColumn.label).toBe("played_at");
    expect(preview.ratingColumn.label).toBe("current_rating");
    expect(preview.records).toHaveLength(2);
    expect(preview.records[0]).toMatchObject({
      rating: 16.5034,
      sourceRow: 2,
      ratingValue: "16.5034",
    });
  });

  test("infers maimai date and rating columns without headers", () => {
    const preview = parseManualRatingCsv(
      [
        "ignored,2026/06/01,15000",
        "ignored,2026/06/02,15025",
        "ignored,not a date,15050",
      ].join("\n"),
      "maimai",
    );

    expect(preview.hasHeader).toBe(false);
    expect(preview.timeColumn.label).toBe("Column 2");
    expect(preview.ratingColumn.label).toBe("Column 3");
    expect(preview.records.map((record) => record.rating)).toEqual([
      15000, 15025,
    ]);
    expect(preview.rejectedRows).toHaveLength(1);
  });

  test("does not treat decimal ratings as maimai ratings", () => {
    expect(() =>
      parseManualRatingCsv(
        ["date,rating", "2026-06-01,16.50"].join("\n"),
        "maimai",
      ),
    ).toThrow("Could not find");
  });

  test("parses quoted csv cells and comma thousands ratings", () => {
    const preview = parseManualRatingCsv(
      ['"rating","note","date"', '"15,000","quoted, note","2026-06-01"'].join(
        "\n",
      ),
      "maimai",
    );

    expect(preview.ratingColumn.label).toBe("rating");
    expect(preview.timeColumn.label).toBe("date");
    expect(preview.records[0].rating).toBe(15000);
  });

  test("treats timezone-less timestamps as UTC when selected", () => {
    const preview = parseManualRatingCsv(
      ["played_at,rating", "2026-06-01 12:00:00,16.50"].join("\n"),
      "chuni",
      { localTimeZone: "Asia/Bangkok", timeZoneMode: "utc" },
    );

    expect(preview.timeZoneMode).toBe("utc");
    expect(preview.localTimeZone).toBe("Asia/Bangkok");
    expect(preview.records[0]).toMatchObject({
      timestamp: "2026-06-01T12:00:00.000Z",
      localTimestamp: "2026-06-01 19:00:00 UTC+07:00",
    });
  });

  test("treats timezone-less timestamps as the selected local timezone", () => {
    const preview = parseManualRatingCsv(
      ["played_at,rating", "2026-06-01 12:00:00,16.50"].join("\n"),
      "chuni",
      { localTimeZone: "Asia/Bangkok", timeZoneMode: "local" },
    );

    expect(preview.timeZoneMode).toBe("local");
    expect(preview.localTimeZone).toBe("Asia/Bangkok");
    expect(preview.records[0]).toMatchObject({
      timestamp: "2026-06-01T05:00:00.000Z",
      localTimestamp: "2026-06-01 12:00:00 UTC+07:00",
    });
  });

  test("keeps explicit timezone offsets as absolute instants", () => {
    const preview = parseManualRatingCsv(
      ["played_at,rating", "2026-06-01T12:00:00+09:00,16.50"].join("\n"),
      "chuni",
      { localTimeZone: "Asia/Bangkok", timeZoneMode: "local" },
    );

    expect(preview.records[0]).toMatchObject({
      timestamp: "2026-06-01T03:00:00.000Z",
      localTimestamp: "2026-06-01 10:00:00 UTC+07:00",
    });
  });
});

describe("validateManualRatingUploadRecords", () => {
  test("normalizes accepted preview rows before insert", () => {
    expect(
      validateManualRatingUploadRecords(
        [{ timestamp: "2026-06-01T00:00:00.000Z", rating: "16.5034" }],
        "chuni",
      ),
    ).toEqual([{ timestamp: "2026-06-01T00:00:00.000Z", rating: 16.5034 }]);
  });
});
