const JST_GAME_DAY_SHIFT_MS = 2 * 60 * 60 * 1000;
const RATING_ANALYSIS_PAYLOAD_VERSION = 3;

export type RatingAnalysisSlot = "old" | "new";

export type RatingAnalysisSnapshotRecordInput = {
  chartKey: string;
  songKey: string;
  title: string;
  image: string | null;
  difficulty: string;
  level: string;
  chartLabel: string;
  score: number;
  rating: number;
  slot: RatingAnalysisSlot;
  order: number;
};

export type RatingAnalysisSnapshotInput = {
  jobId: number;
  playedAt: Date | string;
  rating: number;
  playCount?: number | null;
  overpower?: number | null;
  records: RatingAnalysisSnapshotRecordInput[];
};

export type RatingAnalysisHistoryInput = {
  chartKey: string;
  title: string;
  chartLabel: string;
  score: number;
  playedAt: Date | string;
};

export type RatingAnalysisRecord = RatingAnalysisSnapshotRecordInput & {
  recordKey: string;
};

export type RatingAnalysisTopInterval = {
  id: string;
  chartKey: string;
  recordKey: string;
  songKey: string;
  title: string;
  image: string | null;
  difficulty: string;
  level: string;
  chartLabel: string;
  score: number;
  rating: number;
  startJobId: number;
  endJobId: number | null;
  startAt: string;
  endAt: string | null;
  durationMs: number;
  ongoing: boolean;
};

export type RatingAnalysisSongDuration = {
  chartKey: string;
  songKey: string;
  title: string;
  image: string | null;
  difficulty: string;
  level: string;
  chartLabel: string;
  topDurationMs: number;
  topScoreDurationMs: number;
  oldContributionMs: number;
  newContributionMs: number;
  contributionMs: number;
  isCurrentTop: boolean;
  isCurrentContributor: boolean;
};

export type RatingAnalysisDailyContribution = RatingAnalysisRecord & {
  previousRating: number | null;
  previousScore: number | null;
  delta: number;
  matchedHistoryAt: string | null;
  attribution: "matched" | "inferred";
};

export type RatingAnalysisDailyGain = {
  dayKey: string;
  date: string;
  jobId: number;
  ratingBefore: number | null;
  ratingAfter: number;
  gain: number;
  playCountBefore: number | null;
  playCountAfter: number | null;
  playCountGain: number | null;
  overpowerBefore: number | null;
  overpowerAfter: number | null;
  overpowerGain: number | null;
  roi: number | null;
  contributions: RatingAnalysisDailyContribution[];
};

export type RatingAnalysisPayload = {
  schemaVersion: number;
  computedAt: string;
  latestJobId: number | null;
  snapshotCount: number;
  highestTimeline: RatingAnalysisTopInterval[];
  songDurations: RatingAnalysisSongDuration[];
  dailyGains: RatingAnalysisDailyGain[];
};

export type BuildRatingAnalysisOptions = {
  snapshots: RatingAnalysisSnapshotInput[];
  histories?: RatingAnalysisHistoryInput[];
  computedAt?: Date | string;
};

type NormalizedSnapshot = {
  jobId: number;
  playedAt: Date;
  rating: number;
  playCount: number | null;
  overpower: number | null;
  records: RatingAnalysisRecord[];
};

type DurationDraft = RatingAnalysisSongDuration;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasImageProperty(value: unknown) {
  return isObject(value) && "image" in value;
}

function hasCurrentDailyMetrics(value: unknown) {
  return (
    isObject(value) &&
    "playCountBefore" in value &&
    "playCountAfter" in value &&
    "playCountGain" in value &&
    "overpowerBefore" in value &&
    "overpowerAfter" in value &&
    "overpowerGain" in value &&
    "roi" in value
  );
}

export function ratingAnalysisPayloadIsCurrent(
  payload: unknown,
): payload is RatingAnalysisPayload {
  if (!isObject(payload)) return false;
  if (payload.schemaVersion !== RATING_ANALYSIS_PAYLOAD_VERSION) return false;

  const { highestTimeline, songDurations, dailyGains } = payload;
  if (
    !Array.isArray(highestTimeline) ||
    !Array.isArray(songDurations) ||
    !Array.isArray(dailyGains)
  ) {
    return false;
  }

  return (
    highestTimeline.every(hasImageProperty) &&
    songDurations.every(hasImageProperty) &&
    dailyGains.every(
      (day) =>
        isObject(day) &&
        hasCurrentDailyMetrics(day) &&
        Array.isArray(day.contributions) &&
        day.contributions.every(hasImageProperty),
    )
  );
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function toIso(value: Date): string {
  return value.toISOString();
}

function recordKey(record: { chartKey: string; score: number }): string {
  return `${record.chartKey}\u0000${record.score}`;
}

function contributionSlotKey(record: {
  chartKey: string;
  slot: RatingAnalysisSlot;
}): string {
  return `${record.chartKey}\u0000${record.slot}`;
}

function normalizeSnapshots(
  snapshots: RatingAnalysisSnapshotInput[],
): NormalizedSnapshot[] {
  return snapshots
    .map((snapshot) => ({
      ...snapshot,
      playedAt: toDate(snapshot.playedAt),
      playCount: snapshot.playCount ?? null,
      overpower: snapshot.overpower ?? null,
      records: snapshot.records.map((record) => ({
        ...record,
        recordKey: recordKey(record),
      })),
    }))
    .sort(
      (a, b) =>
        a.playedAt.getTime() - b.playedAt.getTime() || a.jobId - b.jobId,
    );
}

function compareRecords(
  a: RatingAnalysisRecord | undefined,
  b: RatingAnalysisRecord | undefined,
) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return (
    b.rating - a.rating ||
    b.score - a.score ||
    a.chartKey.localeCompare(b.chartKey)
  );
}

function topRecord(snapshot: NormalizedSnapshot) {
  return [...snapshot.records].sort(compareRecords)[0] ?? null;
}

function ensureDuration(
  durations: Map<string, DurationDraft>,
  record: RatingAnalysisRecord,
): DurationDraft {
  const existing = durations.get(record.chartKey);
  if (existing) return existing;

  const duration: DurationDraft = {
    chartKey: record.chartKey,
    songKey: record.songKey,
    title: record.title,
    image: record.image,
    difficulty: record.difficulty,
    level: record.level,
    chartLabel: record.chartLabel,
    topDurationMs: 0,
    topScoreDurationMs: 0,
    oldContributionMs: 0,
    newContributionMs: 0,
    contributionMs: 0,
    isCurrentTop: false,
    isCurrentContributor: false,
  };
  durations.set(record.chartKey, duration);
  return duration;
}

function buildHighestTimeline(
  snapshots: NormalizedSnapshot[],
  computedAt: Date,
): RatingAnalysisTopInterval[] {
  const intervals: RatingAnalysisTopInterval[] = [];

  for (let index = 0; index < snapshots.length; index += 1) {
    const snapshot = snapshots[index];
    const record = topRecord(snapshot);
    if (!record) continue;

    const previous = intervals.at(-1);
    const sameRecord = previous?.recordKey === record.recordKey;
    const nextSnapshot = snapshots[index + 1] ?? null;
    const endAt = nextSnapshot?.playedAt ?? computedAt;

    if (sameRecord && previous) {
      previous.endJobId = nextSnapshot?.jobId ?? null;
      previous.endAt = nextSnapshot ? toIso(nextSnapshot.playedAt) : null;
      previous.durationMs = Math.max(
        0,
        endAt.getTime() - new Date(previous.startAt).getTime(),
      );
      previous.ongoing = nextSnapshot === null;
      continue;
    }

    intervals.push({
      id: `${snapshot.jobId}-${record.recordKey}`,
      chartKey: record.chartKey,
      recordKey: record.recordKey,
      songKey: record.songKey,
      title: record.title,
      image: record.image,
      difficulty: record.difficulty,
      level: record.level,
      chartLabel: record.chartLabel,
      score: record.score,
      rating: record.rating,
      startJobId: snapshot.jobId,
      endJobId: nextSnapshot?.jobId ?? null,
      startAt: toIso(snapshot.playedAt),
      endAt: nextSnapshot ? toIso(nextSnapshot.playedAt) : null,
      durationMs: Math.max(0, endAt.getTime() - snapshot.playedAt.getTime()),
      ongoing: nextSnapshot === null,
    });
  }

  return intervals;
}

function addDurationSummaries(
  durations: Map<string, DurationDraft>,
  snapshots: NormalizedSnapshot[],
  computedAt: Date,
) {
  const lastSnapshot = snapshots.at(-1);
  const currentTop = lastSnapshot ? topRecord(lastSnapshot) : null;

  for (let index = 0; index < snapshots.length; index += 1) {
    const snapshot = snapshots[index];
    const nextAt = snapshots[index + 1]?.playedAt ?? computedAt;
    const durationMs = Math.max(
      0,
      nextAt.getTime() - snapshot.playedAt.getTime(),
    );
    const top = topRecord(snapshot);

    if (top) {
      const duration = ensureDuration(durations, top);
      duration.topDurationMs += durationMs;
      duration.topScoreDurationMs += durationMs;
    }

    const recordsByChart = new Map<string, RatingAnalysisRecord[]>();
    for (const record of snapshot.records) {
      const list = recordsByChart.get(record.chartKey) ?? [];
      list.push(record);
      recordsByChart.set(record.chartKey, list);
    }

    for (const records of recordsByChart.values()) {
      const duration = ensureDuration(durations, records[0]);
      const old = records.some((record) => record.slot === "old");
      const next = records.some((record) => record.slot === "new");

      if (old) duration.oldContributionMs += durationMs;
      if (next) duration.newContributionMs += durationMs;
      if (old || next) duration.contributionMs += durationMs;
    }
  }

  if (currentTop) {
    ensureDuration(durations, currentTop).isCurrentTop = true;
  }

  for (const record of lastSnapshot?.records ?? []) {
    ensureDuration(durations, record).isCurrentContributor = true;
  }
}

function addTopScoreDurations(
  durations: Map<string, DurationDraft>,
  timeline: RatingAnalysisTopInterval[],
) {
  const bestScoreDurations = new Map<string, number>();

  for (const interval of timeline) {
    bestScoreDurations.set(
      interval.chartKey,
      Math.max(
        bestScoreDurations.get(interval.chartKey) ?? 0,
        interval.durationMs,
      ),
    );
  }

  for (const [chartKey, durationMs] of bestScoreDurations) {
    const duration = durations.get(chartKey);
    if (duration) duration.topScoreDurationMs = durationMs;
  }
}

function gameDayKey(date: Date): string {
  const shifted = new Date(date.getTime() + JST_GAME_DAY_SHIFT_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function gameDayDateIso(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00.000Z`).toISOString();
}

function latestSnapshotsByGameDay(snapshots: NormalizedSnapshot[]) {
  const byDay = new Map<string, NormalizedSnapshot>();

  for (const snapshot of snapshots) {
    byDay.set(gameDayKey(snapshot.playedAt), snapshot);
  }

  return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function normalizeHistories(histories: RatingAnalysisHistoryInput[]) {
  return histories.map((history) => ({
    ...history,
    playedAt: toDate(history.playedAt),
  }));
}

function findMatchedHistory(
  record: RatingAnalysisRecord,
  dayKey: string,
  histories: ReturnType<typeof normalizeHistories>,
) {
  return histories.find(
    (history) =>
      history.chartKey === record.chartKey &&
      history.score === record.score &&
      gameDayKey(history.playedAt) === dayKey,
  );
}

function buildDailyGains(
  snapshots: NormalizedSnapshot[],
  histories: RatingAnalysisHistoryInput[],
): RatingAnalysisDailyGain[] {
  const normalizedHistories = normalizeHistories(histories);
  const days = latestSnapshotsByGameDay(snapshots);
  const result: RatingAnalysisDailyGain[] = [];

  for (let index = 0; index < days.length; index += 1) {
    const [dayKey, snapshot] = days[index];
    const previous = days[index - 1]?.[1] ?? null;
    const previousRecords = new Map(
      (previous?.records ?? []).map((record) => [
        contributionSlotKey(record),
        record,
      ]),
    );
    const gain = previous === null ? 0 : snapshot.rating - previous.rating;
    const playCountGain =
      previous?.playCount == null || snapshot.playCount == null
        ? null
        : snapshot.playCount - previous.playCount;
    const overpowerGain =
      previous?.overpower == null || snapshot.overpower == null
        ? null
        : snapshot.overpower - previous.overpower;
    const roi =
      playCountGain == null || playCountGain <= 0 ? null : gain / playCountGain;

    const contributions =
      previous === null
        ? []
        : snapshot.records
            .map((record): RatingAnalysisDailyContribution | null => {
              const previousRecord =
                previousRecords.get(contributionSlotKey(record)) ?? null;
              const isChanged =
                previousRecord === null ||
                previousRecord.recordKey !== record.recordKey ||
                previousRecord.rating !== record.rating;

              if (!isChanged) return null;

              const matchedHistory = findMatchedHistory(
                record,
                dayKey,
                normalizedHistories,
              );

              return {
                ...record,
                previousRating: previousRecord?.rating ?? null,
                previousScore: previousRecord?.score ?? null,
                delta: record.rating - (previousRecord?.rating ?? 0),
                matchedHistoryAt: matchedHistory
                  ? toIso(matchedHistory.playedAt)
                  : null,
                attribution: matchedHistory ? "matched" : "inferred",
              };
            })
            .filter(
              (record): record is RatingAnalysisDailyContribution => !!record,
            )
            .sort(
              (a, b) =>
                Number(b.attribution === "matched") -
                  Number(a.attribution === "matched") ||
                b.delta - a.delta ||
                a.order - b.order,
            );

    result.push({
      dayKey,
      date: gameDayDateIso(dayKey),
      jobId: snapshot.jobId,
      ratingBefore: previous?.rating ?? null,
      ratingAfter: snapshot.rating,
      gain,
      playCountBefore: previous?.playCount ?? null,
      playCountAfter: snapshot.playCount,
      playCountGain,
      overpowerBefore: previous?.overpower ?? null,
      overpowerAfter: snapshot.overpower,
      overpowerGain,
      roi,
      contributions,
    });
  }

  return result;
}

export function buildRatingAnalysis({
  snapshots,
  histories = [],
  computedAt = new Date(),
}: BuildRatingAnalysisOptions): RatingAnalysisPayload {
  const computedAtDate = toDate(computedAt);
  const normalizedSnapshots = normalizeSnapshots(snapshots);
  const latestJobId = normalizedSnapshots.at(-1)?.jobId ?? null;
  const highestTimeline = buildHighestTimeline(
    normalizedSnapshots,
    computedAtDate,
  );
  const durations = new Map<string, DurationDraft>();

  addDurationSummaries(durations, normalizedSnapshots, computedAtDate);
  addTopScoreDurations(durations, highestTimeline);

  return {
    schemaVersion: RATING_ANALYSIS_PAYLOAD_VERSION,
    computedAt: toIso(computedAtDate),
    latestJobId,
    snapshotCount: normalizedSnapshots.length,
    highestTimeline,
    songDurations: [...durations.values()].sort(
      (a, b) =>
        b.topDurationMs - a.topDurationMs ||
        b.contributionMs - a.contributionMs ||
        a.title.localeCompare(b.title) ||
        a.chartLabel.localeCompare(b.chartLabel),
    ),
    dailyGains: buildDailyGains(normalizedSnapshots, histories).sort((a, b) =>
      b.dayKey.localeCompare(a.dayKey),
    ),
  };
}
