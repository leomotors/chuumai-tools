import { describe, expect, it } from "vitest";

import {
  buildRatingAnalysis,
  chuniRatingChartKey,
  formatRatingAnalysisDuration,
  indexSongDurationsByChartKey,
  maimaiRatingChartKey,
  ratingAnalysisPayloadIsCurrent,
  sanitizeJsonbValue,
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
    expect(
      ratingAnalysisPayloadIsCurrent({
        ...analysis,
        highestTimeline: analysis.highestTimeline.map((interval) => {
          const clone: Record<string, unknown> = { ...interval };
          delete clone.steps;
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

  it("merges one chart's #1 reign across score improvements while tracking score durations separately", () => {
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

    expect(analysis.highestTimeline).toHaveLength(1);
    expect(analysis.highestTimeline[0]).toMatchObject({
      chartKey: "a:mas",
      startJobId: 1,
      endJobId: null,
      score: 1_007_000,
      rating: 16.8,
      durationMs: 3 * 86_400_000,
      ongoing: true,
    });
    expect(analysis.highestTimeline[0].steps).toMatchObject([
      {
        score: 1_006_000,
        rating: 16.7,
        startJobId: 1,
        durationMs: 1 * 86_400_000,
      },
      {
        score: 1_007_000,
        rating: 16.8,
        startJobId: 2,
        endJobId: null,
        durationMs: 2 * 86_400_000,
      },
    ]);
    expect(analysis.songDurations[0]).toMatchObject({
      chartKey: "a:mas",
      topDurationMs: 3 * 86_400_000,
      topScoreDurationMs: 2 * 86_400_000,
      isCurrentTop: true,
    });
    expect(analysis.contributionIntervals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          chartKey: "a:mas",
          slot: "old",
          score: 1_007_000,
          startAt: "2026-05-01T12:00:00.000Z",
          endAt: null,
          ongoing: true,
          steps: [
            expect.objectContaining({
              slot: "old",
              score: 1_006_000,
              startAt: "2026-05-01T12:00:00.000Z",
              endAt: "2026-05-02T12:00:00.000Z",
            }),
            expect.objectContaining({
              slot: "old",
              score: 1_007_000,
              startAt: "2026-05-02T12:00:00.000Z",
              endAt: null,
            }),
          ],
        }),
      ]),
    );
    expect(
      analysis.contributionIntervals.filter(
        (interval) => interval.chartKey === "a:mas",
      ),
    ).toHaveLength(1);
    expect(analysis.contributionIntervals[0]?.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slot: "old",
          score: 1_006_000,
          startAt: "2026-05-01T12:00:00.000Z",
          endAt: "2026-05-02T12:00:00.000Z",
        }),
        expect.objectContaining({
          slot: "old",
          score: 1_007_000,
          startAt: "2026-05-02T12:00:00.000Z",
          endAt: null,
        }),
      ]),
    );
  });

  it("keeps non-consecutive reigns of the same chart as separate timeline entries", () => {
    const analysis = buildRatingAnalysis({
      computedAt: "2026-05-04T12:00:00.000Z",
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
          records: [
            record("a:mas", "Alpha", "MASTER", 1_006_000, 16.7),
            record("b:mas", "Beta", "MASTER", 1_007_000, 16.85),
          ],
        },
        {
          jobId: 3,
          playedAt: "2026-05-03T12:00:00.000Z",
          rating: 16.2,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_009_000, 16.95),
            record("b:mas", "Beta", "MASTER", 1_007_000, 16.85),
          ],
        },
      ],
    });

    expect(analysis.highestTimeline.map((reign) => reign.chartKey)).toEqual([
      "a:mas",
      "b:mas",
      "a:mas",
    ]);
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

  it("excludes records whose score rose without raising the rating", () => {
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
          rating: 16,
          records: [record("a:mas", "Alpha", "MASTER", 1_006_500, 16.7)],
        },
      ],
    });

    expect(analysis.dailyGains[0]).toMatchObject({
      dayKey: "2026-05-02",
      contributions: [],
    });
  });

  it("attributes a new entry to the single floor it displaced", () => {
    const analysis = buildRatingAnalysis({
      computedAt,
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_007_000, 16.7, "old", 1),
            record("b:exp", "Beta", "EXPERT", 1_004_000, 16.0, "old", 2),
          ],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.05,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_007_000, 16.7, "old", 1),
            record("c:mas", "Gamma", "MASTER", 1_006_000, 16.5, "old", 2),
          ],
        },
      ],
    });

    expect(analysis.dailyGains[0].contributions).toHaveLength(1);
    expect(analysis.dailyGains[0].contributions[0]).toMatchObject({
      chartKey: "c:mas",
      previousRating: null,
      replacedFloorRating: 16,
    });
    // Gain is the play rating minus the displaced floor, not the whole rating.
    expect(analysis.dailyGains[0].contributions[0].delta).toBeCloseTo(0.5, 5);
  });

  it("splits the gain across multiple displaced floors by ascending rating", () => {
    const analysis = buildRatingAnalysis({
      computedAt,
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [
            record("c:mas", "Gamma", "MASTER", 1_009_000, 17.0, "old", 1),
            record("a:mas", "Alpha", "MASTER", 1_004_000, 16.1, "old", 2),
            record("b:exp", "Beta", "EXPERT", 1_003_000, 16.0, "old", 3),
          ],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.2,
          records: [
            record("c:mas", "Gamma", "MASTER", 1_009_000, 17.0, "old", 1),
            record("e:mas", "Epsilon", "MASTER", 1_006_500, 16.5, "old", 2),
            record("d:mas", "Delta", "MASTER", 1_005_500, 16.3, "old", 3),
          ],
        },
      ],
    });

    const byChart = Object.fromEntries(
      analysis.dailyGains[0].contributions.map((c) => [c.chartKey, c]),
    );
    // Removed floors {16.0, 16.1}; with no play history the new entries pair by
    // ascending rating: 16.3 -> 16.0 floor, 16.5 -> 16.1 floor.
    expect(byChart["d:mas"].replacedFloorRating).toBe(16);
    expect(byChart["d:mas"].delta).toBeCloseTo(0.3, 5);
    expect(byChart["e:mas"].replacedFloorRating).toBeCloseTo(16.1, 5);
    expect(byChart["e:mas"].delta).toBeCloseTo(0.4, 5);
  });

  it("orders new entries by play time so the earliest takes the lowest floor", () => {
    const analysis = buildRatingAnalysis({
      computedAt,
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [
            record("c:mas", "Gamma", "MASTER", 1_009_000, 17.0, "old", 1),
            record("a:mas", "Alpha", "MASTER", 1_004_000, 16.1, "old", 2),
            record("b:exp", "Beta", "EXPERT", 1_003_000, 16.0, "old", 3),
          ],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.2,
          records: [
            record("c:mas", "Gamma", "MASTER", 1_009_000, 17.0, "old", 1),
            record("e:mas", "Epsilon", "MASTER", 1_006_500, 16.5, "old", 2),
            record("d:mas", "Delta", "MASTER", 1_005_500, 16.3, "old", 3),
          ],
        },
      ],
      histories: [
        {
          chartKey: "e:mas",
          title: "Epsilon",
          chartLabel: "MASTER",
          score: 1_006_500,
          playedAt: "2026-05-02T09:00:00.000Z",
        },
        {
          chartKey: "d:mas",
          title: "Delta",
          chartLabel: "MASTER",
          score: 1_005_500,
          playedAt: "2026-05-02T10:00:00.000Z",
        },
      ],
    });

    const byChart = Object.fromEntries(
      analysis.dailyGains[0].contributions.map((c) => [c.chartKey, c]),
    );
    // Epsilon was played first, so it displaced the lowest floor (16.0) even
    // though it is the higher-rated new entry; Delta then took the 16.1 floor.
    expect(byChart["e:mas"].replacedFloorRating).toBe(16);
    expect(byChart["e:mas"].delta).toBeCloseTo(0.5, 5);
    expect(byChart["d:mas"].replacedFloorRating).toBeCloseTo(16.1, 5);
    expect(byChart["d:mas"].delta).toBeCloseTo(0.2, 5);
  });

  it("credits a new entry that fills an empty slot with its full rating", () => {
    const analysis = buildRatingAnalysis({
      computedAt,
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_007_000, 16.7, "old", 1),
            record("x:exp", "Xi", "EXPERT", 1_000_000, 15.5, "old", 2),
          ],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.3,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_007_000, 16.7, "old", 1),
            record("b:mas", "Beta", "MASTER", 1_006_000, 16.5, "old", 2),
            record("c:mas", "Gamma", "MASTER", 1_005_000, 16.2, "old", 3),
          ],
        },
      ],
    });

    const byChart = Object.fromEntries(
      analysis.dailyGains[0].contributions.map((c) => [c.chartKey, c]),
    );
    // The list grew from 2 to 3 entries: one new entry takes the freed 15.5
    // floor, the other fills a brand-new slot (floor 0 -> full-rating credit).
    expect(byChart["c:mas"].replacedFloorRating).toBe(0);
    expect(byChart["c:mas"].delta).toBeCloseTo(16.2, 5);
    expect(byChart["b:mas"].replacedFloorRating).toBeCloseTo(15.5, 5);
    expect(byChart["b:mas"].delta).toBeCloseTo(1.0, 5);
  });

  it("handles an improved floor entry and a brand-new entry on the same day", () => {
    const analysis = buildRatingAnalysis({
      computedAt,
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_009_000, 17.0, "old", 1),
            record("b:exp", "Beta", "EXPERT", 1_006_000, 16.5, "old", 2),
            record("f:mas", "Floor", "MASTER", 1_004_000, 16.0, "old", 3),
          ],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.4,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_009_000, 17.0, "old", 1),
            record("x:mas", "Xenon", "MASTER", 1_008_000, 16.8, "old", 2),
            record("f:mas", "Floor", "MASTER", 1_006_500, 16.7, "old", 3),
          ],
        },
      ],
    });

    const contributions = analysis.dailyGains[0].contributions;
    const byChart = Object.fromEntries(
      contributions.map((c) => [c.chartKey, c]),
    );

    // The floor song improved in place: it keeps its own rating gain and
    // displaces nothing.
    expect(byChart["f:mas"]).toMatchObject({
      previousRating: 16,
      replacedFloorRating: null,
    });
    expect(byChart["f:mas"].delta).toBeCloseTo(0.7, 5);

    // The brand-new entry is attributed to the entry actually pushed out of the
    // list (Beta, 16.5), not to the floor song it sat next to.
    expect(byChart["x:mas"]).toMatchObject({
      previousRating: null,
      replacedFloorRating: 16.5,
    });
    expect(byChart["x:mas"].delta).toBeCloseTo(0.3, 5);

    // Unchanged top entry is not a contribution; the two gains reconcile to the
    // slot's net change: (17.0 + 16.8 + 16.7) - (17.0 + 16.5 + 16.0) = 1.0.
    expect(contributions).toHaveLength(2);
    const totalDelta = contributions.reduce((sum, c) => sum + c.delta, 0);
    expect(totalDelta).toBeCloseTo(1.0, 5);
  });
});

describe("rating analysis display helpers", () => {
  it("builds stable chart keys for chuni and maimai", () => {
    expect(chuniRatingChartKey(123, "master")).toBe("123:master");
    expect(maimaiRatingChartKey("Song", "dx", "expert")).toBe("Song:dx:expert");
    expect(formatRatingAnalysisDuration(0)).toBe("same day");
    expect(formatRatingAnalysisDuration(86_400_000)).toBe("1d");
    expect(formatRatingAnalysisDuration(60 * 86_400_000)).toBe("2mo");

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

    const indexed = indexSongDurationsByChartKey(analysis.songDurations);
    expect(indexed.get("a:mas")?.topDurationMs).toBeGreaterThan(0);
  });

  it("tracks rating-list stints with exact start and end dates", () => {
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
        {
          jobId: 3,
          playedAt: "2026-05-03T12:00:00.000Z",
          rating: 16.2,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_009_000, 16.95, "new"),
          ],
        },
      ],
    });

    const alphaIntervals = analysis.contributionIntervals.filter(
      (interval) => interval.chartKey === "a:mas",
    );

    expect(alphaIntervals).toHaveLength(1);
    expect(alphaIntervals[0]).toMatchObject({
      chartKey: "a:mas",
      slot: "new",
      score: 1_009_000,
      startAt: "2026-05-01T12:00:00.000Z",
      endAt: null,
      ongoing: true,
    });
    expect(alphaIntervals[0].steps).toEqual([
      expect.objectContaining({
        slot: "old",
        score: 1_006_000,
        startAt: "2026-05-01T12:00:00.000Z",
        endAt: "2026-05-02T12:00:00.000Z",
      }),
      expect.objectContaining({
        slot: "new",
        score: 1_006_000,
        startAt: "2026-05-02T12:00:00.000Z",
        endAt: "2026-05-03T12:00:00.000Z",
      }),
      expect.objectContaining({
        slot: "new",
        score: 1_009_000,
        startAt: "2026-05-03T12:00:00.000Z",
        endAt: null,
      }),
    ]);
  });

  it("ignores failed scrapes with empty rating-list snapshots", () => {
    const analysis = buildRatingAnalysis({
      computedAt: "2026-05-04T12:00:00.000Z",
      snapshots: [
        {
          jobId: 1,
          playedAt: "2026-05-01T12:00:00.000Z",
          rating: 16,
          records: [record("a:mas", "Alpha", "MASTER", 1_006_000, 16.7, "old")],
        },
        {
          jobId: 2,
          playedAt: "2026-05-02T12:00:00.000Z",
          rating: 16.1,
          records: [],
        },
        {
          jobId: 3,
          playedAt: "2026-05-03T12:00:00.000Z",
          rating: 16.2,
          records: [
            record("a:mas", "Alpha", "MASTER", 1_009_000, 16.95, "old"),
          ],
        },
      ],
    });

    const alphaIntervals = analysis.contributionIntervals.filter(
      (interval) => interval.chartKey === "a:mas",
    );

    expect(alphaIntervals).toHaveLength(1);
    expect(alphaIntervals[0]).toMatchObject({
      startAt: "2026-05-01T12:00:00.000Z",
      endAt: null,
      ongoing: true,
    });
    expect(analysis.snapshotCount).toBe(2);
  });

  it("strips NUL characters so payloads can be stored in jsonb", () => {
    const dirty = {
      title: "Song\u0000Title",
      nested: [{ note: "a\u0000b" }],
    };

    expect(sanitizeJsonbValue(dirty)).toEqual({
      title: "SongTitle",
      nested: [{ note: "ab" }],
    });
  });
});
