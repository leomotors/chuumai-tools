import { describe, expect, it } from "vitest";

import {
  buildRatingAnalysis,
  ratingAnalysisPayloadIsCurrent,
} from "./ratingAnalysis.js";

const computedAt = "2026-05-05T12:00:00.000Z";

function record(
  chartKey: string,
  title: string,
  chartLabel: string,
  score: number,
  rating: number,
  slot: "old" | "new" = "old",
  order = 1,
) {
  return {
    chartKey,
    songKey: title,
    title,
    image: `/${title.toLowerCase()}.png`,
    difficulty: chartLabel.toLowerCase(),
    level: "14.0",
    chartLabel,
    score,
    rating,
    slot,
    order,
  };
}

describe("buildRatingAnalysis", () => {
  it("detects whether a cached payload includes cover image fields", () => {
    const analysis = buildRatingAnalysis({
      computedAt,
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [record("a:mas", "Alpha", "MASTER", 1_007_000, 16.8)],
        },
      ],
    });

    expect(ratingAnalysisPayloadIsCurrent(analysis)).toBe(true);
    expect(
      ratingAnalysisPayloadIsCurrent({
        ...analysis,
        highestTimeline: analysis.highestTimeline.map((interval) => {
          const clone: Record<string, unknown> = { ...interval };
          delete clone.image;
          return clone;
        }),
      }),
    ).toBe(false);
  });

  it("compresses adjacent highest-rating snapshots with the same exact score", () => {
    const analysis = buildRatingAnalysis({
      computedAt,
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [record("a:mas", "Alpha", "MASTER", 1_007_000, 16.8)],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.1,
          records: [record("a:mas", "Alpha", "MASTER", 1_007_000, 16.85)],
        },
        {
          jobId: 3,
          playedAt: "2026-05-03T12:00:00.000Z",
          rating: 16.2,
          records: [record("b:mas", "Beta", "MASTER", 1_006_000, 16.9)],
        },
      ],
    });

    expect(analysis.highestTimeline).toHaveLength(2);
    expect(analysis.highestTimeline[0]).toMatchObject({
      chartKey: "a:mas",
      startJobId: 1,
      endJobId: 3,
      durationMs: 2 * 86_400_000,
      ongoing: false,
    });
    expect(analysis.highestTimeline[1]).toMatchObject({
      chartKey: "b:mas",
      startJobId: 3,
      endJobId: null,
      durationMs: 2 * 86_400_000,
      ongoing: true,
    });
  });

  it("keeps chart top duration continuous while splitting improved score intervals", () => {
    const analysis = buildRatingAnalysis({
      computedAt: "2026-05-04T12:00:00.000Z",
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          playCount: 100,
          overpower: 1000,
          records: [record("a:mas", "Alpha", "MASTER", 1_006_000, 16.7)],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.1,
          playCount: 108,
          overpower: 1004.5,
          records: [record("a:mas", "Alpha", "MASTER", 1_007_000, 16.8)],
        },
      ],
    });

    expect(analysis.highestTimeline).toHaveLength(2);
    expect(analysis.songDurations[0]).toMatchObject({
      chartKey: "a:mas",
      topDurationMs: 3 * 86_400_000,
      topScoreDurationMs: 2 * 86_400_000,
      isCurrentTop: true,
    });
  });

  it("tracks old and new contribution durations separately and as a union", () => {
    const analysis = buildRatingAnalysis({
      computedAt: "2026-05-04T12:00:00.000Z",
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_006_000, 16.7, "old"),
            record("b:exp", "Beta", "EXPERT", 1_005_000, 16.2, "new"),
          ],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.1,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_006_000, 16.7, "old"),
            record("a:mas", "Alpha", "MASTER", 1_006_000, 16.7, "new"),
          ],
        },
      ],
    });

    const alpha = analysis.songDurations.find(
      (duration) => duration.chartKey === "a:mas",
    );
    expect(alpha).toMatchObject({
      oldContributionMs: 3 * 86_400_000,
      newContributionMs: 2 * 86_400_000,
      contributionMs: 3 * 86_400_000,
      isCurrentContributor: true,
    });
  });

  it("builds daily gains from consecutive game-day snapshots", () => {
    const analysis = buildRatingAnalysis({
      computedAt,
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          playCount: 100,
          overpower: 1000,
          records: [record("a:mas", "Alpha", "MASTER", 1_006_000, 16.7)],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.1,
          playCount: 108,
          overpower: 1004.5,
          records: [record("a:mas", "Alpha", "MASTER", 1_007_000, 16.8)],
        },
      ],
    });

    expect(analysis.dailyGains).toHaveLength(2);
    expect(analysis.dailyGains[0]).toMatchObject({
      dayKey: "2026-05-02",
      ratingBefore: 16,
      ratingAfter: 16.1,
      gain: 0.10000000000000142,
      playCountBefore: 100,
      playCountAfter: 108,
      playCountGain: 8,
      overpowerBefore: 1000,
      overpowerAfter: 1004.5,
      overpowerGain: 4.5,
      roi: 0.012500000000000178,
    });
  });

  it("does not attribute initial snapshots or order-only rating-list movement", () => {
    const analysis = buildRatingAnalysis({
      computedAt,
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_006_000, 16.7, "old", 1),
            record("b:exp", "Beta", "EXPERT", 1_005_000, 16.2, "old", 2),
          ],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16,
          records: [
            record("b:exp", "Beta", "EXPERT", 1_005_000, 16.2, "old", 1),
            record("a:mas", "Alpha", "MASTER", 1_006_000, 16.7, "old", 2),
          ],
        },
      ],
    });

    expect(analysis.dailyGains).toHaveLength(2);
    expect(analysis.dailyGains[0]).toMatchObject({
      dayKey: "2026-05-02",
      contributions: [],
    });
    expect(analysis.dailyGains[1]).toMatchObject({
      dayKey: "2026-05-01",
      contributions: [],
    });
  });

  it("matches daily contributions to same-day play history", () => {
    const analysis = buildRatingAnalysis({
      computedAt,
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [record("a:mas", "Alpha", "MASTER", 1_006_000, 16.7)],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.1,
          records: [record("a:mas", "Alpha", "MASTER", 1_007_000, 16.8)],
        },
      ],
      histories: [
        {
          chartKey: "a:mas",
          title: "Alpha",
          chartLabel: "MASTER",
          score: 1_007_000,
          playedAt: "2026-05-02T09:00:00.000Z",
        },
      ],
    });

    expect(analysis.dailyGains[0].contributions[0]).toMatchObject({
      chartKey: "a:mas",
      score: 1_007_000,
      previousScore: 1_006_000,
      attribution: "matched",
      matchedHistoryAt: "2026-05-02T09:00:00.000Z",
    });
  });

  it("keeps inferred attribution when play history does not match", () => {
    const analysis = buildRatingAnalysis({
      computedAt,
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [record("a:mas", "Alpha", "MASTER", 1_006_000, 16.7)],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.1,
          records: [record("a:mas", "Alpha", "MASTER", 1_007_000, 16.8)],
        },
      ],
    });

    expect(analysis.dailyGains[0].contributions[0]).toMatchObject({
      previousScore: 1_006_000,
      attribution: "inferred",
      matchedHistoryAt: null,
    });
  });
});
