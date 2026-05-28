import { describe, expect, it } from "vitest";

import { buildImprovementTimeline } from "./improvementTimeline.js";

type Improvement = {
  score: number;
  mark: string;
  scraperTime: string;
};

type HistoryRecord = {
  score: number;
  mark: string;
  playedAt: string;
  trackNo: number;
};

function buildTimeline(
  improvements: Improvement[],
  historyRecords: HistoryRecord[],
) {
  return buildImprovementTimeline({
    improvements,
    historyRecords,
    getImprovementTime: (record) => record.scraperTime,
    getHistoryTime: (record) => record.playedAt,
    isSamePlay: (improvement, historyRecord) =>
      improvement.score === historyRecord.score &&
      improvement.mark === historyRecord.mark,
  });
}

describe("buildImprovementTimeline", () => {
  it("matches improvements to history and removes matched history duplicates", () => {
    const timeline = buildTimeline(
      [
        {
          score: 1_000_000,
          mark: "FC",
          scraperTime: "2026-05-01T12:00:00.000Z",
        },
        {
          score: 990_000,
          mark: "CLEAR",
          scraperTime: "2026-04-30T12:00:00.000Z",
        },
      ],
      [
        {
          score: 1_000_000,
          mark: "FC",
          playedAt: "2026-05-01T10:00:00.000Z",
          trackNo: 1,
        },
        {
          score: 990_000,
          mark: "CLEAR",
          playedAt: "2026-04-30T10:00:00.000Z",
          trackNo: 1,
        },
      ],
    );

    expect(timeline.topHistoryRecords).toEqual([]);
    expect(timeline.entries).toHaveLength(2);
    expect(timeline.entries[0].matchedHistory?.trackNo).toBe(1);
    expect(timeline.entries[0].displayDate?.toISOString()).toBe(
      "2026-05-01T10:00:00.000Z",
    );
    expect(timeline.entries[0].historyRecords).toEqual([]);
    expect(timeline.entries[1].historyRecords).toEqual([]);
  });

  it("keeps history after the latest improvement in the top group", () => {
    const timeline = buildTimeline(
      [
        {
          score: 1_000_000,
          mark: "FC",
          scraperTime: "2026-05-01T12:00:00.000Z",
        },
      ],
      [
        {
          score: 1_001_000,
          mark: "FC",
          playedAt: "2026-05-01T11:00:00.000Z",
          trackNo: 2,
        },
        {
          score: 1_000_000,
          mark: "FC",
          playedAt: "2026-05-01T10:00:00.000Z",
          trackNo: 1,
        },
      ],
    );

    expect(timeline.topHistoryRecords.map((record) => record.trackNo)).toEqual([
      2,
    ]);
    expect(timeline.entries[0].matchedHistory?.trackNo).toBe(1);
  });

  it("groups unmatched history between adjacent improvements", () => {
    const timeline = buildTimeline(
      [
        {
          score: 1_000_000,
          mark: "FC",
          scraperTime: "2026-05-01T12:00:00.000Z",
        },
        {
          score: 990_000,
          mark: "CLEAR",
          scraperTime: "2026-04-30T12:00:00.000Z",
        },
      ],
      [
        {
          score: 1_000_000,
          mark: "FC",
          playedAt: "2026-05-01T10:00:00.000Z",
          trackNo: 1,
        },
        {
          score: 995_000,
          mark: "CLEAR",
          playedAt: "2026-05-01T09:00:00.000Z",
          trackNo: 2,
        },
        {
          score: 990_000,
          mark: "CLEAR",
          playedAt: "2026-04-30T10:00:00.000Z",
          trackNo: 3,
        },
      ],
    );

    expect(
      timeline.entries[0].historyRecords.map((record) => record.trackNo),
    ).toEqual([2]);
    expect(timeline.entries[1].historyRecords).toEqual([]);
  });

  it("matches the latest identical history and leaves older duplicates expandable", () => {
    const timeline = buildTimeline(
      [
        {
          score: 1_000_000,
          mark: "FC",
          scraperTime: "2026-05-01T12:00:00.000Z",
        },
      ],
      [
        {
          score: 1_000_000,
          mark: "FC",
          playedAt: "2026-05-01T10:00:00.000Z",
          trackNo: 1,
        },
        {
          score: 1_000_000,
          mark: "FC",
          playedAt: "2026-05-01T09:00:00.000Z",
          trackNo: 2,
        },
      ],
    );

    expect(timeline.entries[0].matchedHistory?.trackNo).toBe(1);
    expect(
      timeline.entries[0].historyRecords.map((record) => record.trackNo),
    ).toEqual([2]);
  });

  it("falls back to scraper time when no history row matches the improvement", () => {
    const timeline = buildTimeline(
      [
        {
          score: 1_000_000,
          mark: "FC",
          scraperTime: "2026-05-01T12:00:00.000Z",
        },
      ],
      [
        {
          score: 999_000,
          mark: "FC",
          playedAt: "2026-05-01T11:00:00.000Z",
          trackNo: 1,
        },
      ],
    );

    expect(timeline.entries[0].matchedHistory).toBeNull();
    expect(timeline.entries[0].displayDate?.toISOString()).toBe(
      "2026-05-01T12:00:00.000Z",
    );
    expect(
      timeline.entries[0].historyRecords.map((record) => record.trackNo),
    ).toEqual([1]);
  });

  it("does not match history newer than the scraper time", () => {
    const timeline = buildTimeline(
      [
        {
          score: 1_000_000,
          mark: "FC",
          scraperTime: "2026-05-01T10:00:00.000Z",
        },
      ],
      [
        {
          score: 1_000_000,
          mark: "FC",
          playedAt: "2026-05-01T11:00:00.000Z",
          trackNo: 1,
        },
      ],
    );

    expect(timeline.entries[0].matchedHistory).toBeNull();
    expect(timeline.topHistoryRecords.map((record) => record.trackNo)).toEqual([
      1,
    ]);
  });

  it("does not steal a match from below the next improvement window", () => {
    const timeline = buildTimeline(
      [
        {
          score: 1_000_000,
          mark: "FC",
          scraperTime: "2026-05-02T12:00:00.000Z",
        },
        {
          score: 990_000,
          mark: "CLEAR",
          scraperTime: "2026-05-01T12:00:00.000Z",
        },
      ],
      [
        {
          score: 1_000_000,
          mark: "FC",
          playedAt: "2026-04-30T10:00:00.000Z",
          trackNo: 1,
        },
        {
          score: 990_000,
          mark: "CLEAR",
          playedAt: "2026-05-01T10:00:00.000Z",
          trackNo: 2,
        },
      ],
    );

    expect(timeline.entries[0].matchedHistory).toBeNull();
    expect(timeline.entries[1].matchedHistory?.trackNo).toBe(2);
    expect(
      timeline.entries[1].historyRecords.map((record) => record.trackNo),
    ).toEqual([1]);
  });

  it("allows fallback matching when adjacent improvements share a scrape time", () => {
    const timeline = buildTimeline(
      [
        {
          score: 1_000_000,
          mark: "FC",
          scraperTime: "2026-05-02T12:00:00.000Z",
        },
        {
          score: 990_000,
          mark: "CLEAR",
          scraperTime: "2026-05-02T12:00:00.000Z",
        },
      ],
      [
        {
          score: 1_000_000,
          mark: "FC",
          playedAt: "2026-05-01T10:00:00.000Z",
          trackNo: 1,
        },
        {
          score: 990_000,
          mark: "CLEAR",
          playedAt: "2026-04-30T10:00:00.000Z",
          trackNo: 2,
        },
      ],
    );

    expect(timeline.entries[0].matchedHistory?.trackNo).toBe(1);
    expect(timeline.entries[1].matchedHistory?.trackNo).toBe(2);
  });
});
