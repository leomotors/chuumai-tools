const JST_GAME_DAY_SHIFT_MS = 2 * 60 * 60 * 1000;
const RATING_ANALYSIS_PAYLOAD_VERSION = 10;
const RECORD_KEY_SEPARATOR = "@";

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

// One score the chart held while it was #1. A reign keeps the full ordered list
// so the UI can show the score range and, on demand, the whole progression.
export type RatingAnalysisScoreStep = {
  score: number;
  rating: number;
  startJobId: number;
  endJobId: number | null;
  startAt: string;
  endAt: string | null;
  durationMs: number;
};

// A continuous run at #1 by a single chart, carrying the latest score in the
// top-level fields and every score improvement in `steps` (oldest first).
export type RatingAnalysisTopReign = RatingAnalysisTopInterval & {
  steps: RatingAnalysisScoreStep[];
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

export type RatingAnalysisContributionScoreStep = {
  slot: RatingAnalysisSlot;
  score: number;
  rating: number;
  startJobId: number;
  endJobId: number | null;
  startAt: string;
  endAt: string | null;
  durationMs: number;
};

export type RatingAnalysisContributionInterval = {
  id: string;
  chartKey: string;
  songKey: string;
  image: string | null;
  slot: RatingAnalysisSlot;
  score: number;
  rating: number;
  startJobId: number;
  endJobId: number | null;
  startAt: string;
  endAt: string | null;
  durationMs: number;
  ongoing: boolean;
  steps: RatingAnalysisContributionScoreStep[];
};

export type RatingAnalysisDailyContribution = RatingAnalysisRecord & {
  previousRating: number | null;
  previousScore: number | null;
  // For a new entry (previousRating === null) this is the rating of the floor it
  // displaced from the list, so `delta` is the real gain it added rather than its
  // whole play rating. 0 means it filled a slot left empty by a not-yet-full
  // list. null for improved entries, which were already in the list.
  replacedFloorRating: number | null;
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
  highestTimeline: RatingAnalysisTopReign[];
  songDurations: RatingAnalysisSongDuration[];
  contributionIntervals: RatingAnalysisContributionInterval[];
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

function hasContributionIntervalShape(value: unknown) {
  if (!isObject(value) || !("image" in value) || !Array.isArray(value.steps)) {
    return false;
  }
  return value.steps.every(
    (step) => isObject(step) && "slot" in step && "score" in step,
  );
}

function hasReignShape(value: unknown) {
  return isObject(value) && "image" in value && Array.isArray(value.steps);
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

export function chuniRatingChartKey(
  musicId: number,
  difficulty: string,
): string {
  return `${musicId}:${difficulty}`;
}

export function maimaiRatingChartKey(
  title: string,
  chartType: string,
  difficulty: string,
): string {
  return `${title}:${chartType}:${difficulty}`;
}

export function indexSongDurationsByChartKey(
  songDurations: RatingAnalysisSongDuration[],
): Map<string, RatingAnalysisSongDuration> {
  return new Map(
    songDurations.map((duration) => [duration.chartKey, duration]),
  );
}

export function formatRatingAnalysisDuration(ms: number): string {
  if (ms <= 0) return "same day";
  const days = Math.floor(ms / 86_400_000);
  if (days < 1) return "<1 day";
  if (days < 60) return `${days}d`;
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  return remainingDays > 0 ? `${months}mo ${remainingDays}d` : `${months}mo`;
}

export function sanitizeJsonbValue<T>(value: T): T {
  if (typeof value === "string") {
    return value.split("\0").join("") as T;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeJsonbValue(entry)) as T;
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sanitizeJsonbValue(entry),
      ]),
    ) as T;
  }
  return value;
}

export function filterContributionIntervalsForChart(
  intervals: RatingAnalysisContributionInterval[],
  chartKey: string,
): RatingAnalysisContributionInterval[] {
  return intervals
    .filter((interval) => interval.chartKey === chartKey)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export function filterTopIntervalsForChart(
  intervals: RatingAnalysisTopInterval[],
  chartKey: string,
): RatingAnalysisTopInterval[] {
  return intervals
    .filter((interval) => interval.chartKey === chartKey)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export type RatingAnalysisTopTimelineSpan = {
  score: number;
  rating: number;
  startAt: string;
  endAt: string | null;
  durationMs: number;
  ongoing: boolean;
};

export function topTimelineSpansForChart(
  reigns: RatingAnalysisTopReign[],
  chartKey: string,
): RatingAnalysisTopTimelineSpan[] {
  return reigns
    .filter((reign) => reign.chartKey === chartKey)
    .flatMap((reign) =>
      reign.steps.map((step) => ({
        score: step.score,
        rating: step.rating,
        startAt: step.startAt,
        endAt: step.endAt,
        durationMs: step.durationMs,
        ongoing: step.endAt === null,
      })),
    );
}

export type TimelineSpanLayout = {
  leftPercent: number;
  widthPercent: number;
};

export function layoutTimelineSpans<
  T extends {
    startAt: string;
    endAt: string | null;
  },
>(spans: T[], rangeEndAt: string): Array<T & TimelineSpanLayout> {
  if (spans.length === 0) return [];

  const rangeEndMs = new Date(rangeEndAt).getTime();
  const starts = spans.map((span) => new Date(span.startAt).getTime());
  const ends = spans.map((span) =>
    span.endAt ? new Date(span.endAt).getTime() : rangeEndMs,
  );
  const rangeStartMs = Math.min(...starts);
  const rangeEndBoundMs = Math.max(rangeEndMs, ...ends);
  const totalMs = Math.max(rangeEndBoundMs - rangeStartMs, 1);

  return spans.map((span, index) => {
    const startMs = starts[index];
    const endMs = ends[index];
    const widthMs = Math.max(endMs - startMs, 0);

    return {
      ...span,
      leftPercent: ((startMs - rangeStartMs) / totalMs) * 100,
      widthPercent: (widthMs / totalMs) * 100,
    };
  });
}

export function contributionStepsForSlot(
  intervals: RatingAnalysisContributionInterval[],
  slot: RatingAnalysisSlot,
): RatingAnalysisContributionScoreStep[] {
  return intervals.flatMap((interval) =>
    interval.steps.filter((step) => step.slot === slot),
  );
}

export function ratingAnalysisPayloadIsCurrent(
  payload: unknown,
): payload is RatingAnalysisPayload {
  if (!isObject(payload)) return false;
  if (payload.schemaVersion !== RATING_ANALYSIS_PAYLOAD_VERSION) return false;

  const { highestTimeline, songDurations, contributionIntervals, dailyGains } =
    payload;
  if (
    !Array.isArray(highestTimeline) ||
    !Array.isArray(songDurations) ||
    !Array.isArray(contributionIntervals) ||
    !Array.isArray(dailyGains)
  ) {
    return false;
  }

  return (
    highestTimeline.every(hasReignShape) &&
    songDurations.every(hasImageProperty) &&
    contributionIntervals.every(hasContributionIntervalShape) &&
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
  return `${record.chartKey}${RECORD_KEY_SEPARATOR}${record.score}`;
}

function contributionSlotKey(record: {
  chartKey: string;
  slot: RatingAnalysisSlot;
}): string {
  return `${record.chartKey}${RECORD_KEY_SEPARATOR}${record.slot}`;
}

function toContributionStep(
  snapshot: NormalizedSnapshot,
  record: RatingAnalysisRecord,
  endAt: Date,
  endJobId: number | null,
): RatingAnalysisContributionScoreStep {
  return {
    slot: record.slot,
    score: record.score,
    rating: record.rating,
    startJobId: snapshot.jobId,
    endJobId,
    startAt: toIso(snapshot.playedAt),
    endAt: endJobId === null ? null : toIso(endAt),
    durationMs: Math.max(0, endAt.getTime() - snapshot.playedAt.getTime()),
  };
}

function contributionStepKey(step: {
  slot: RatingAnalysisSlot;
  score: number;
}) {
  return `${step.slot}${RECORD_KEY_SEPARATOR}${step.score}`;
}

function primaryRecordForChart(
  records: RatingAnalysisRecord[],
  chartKey: string,
): RatingAnalysisRecord | null {
  const chartRecords = records.filter((record) => record.chartKey === chartKey);
  if (chartRecords.length === 0) return null;
  return (
    chartRecords.find((record) => record.slot === "new") ??
    chartRecords.find((record) => record.slot === "old") ??
    chartRecords[0]
  );
}

function finalizeContributionStep(
  step: RatingAnalysisContributionScoreStep,
  endAt: Date,
  endJobId: number,
) {
  step.endAt = toIso(endAt);
  step.endJobId = endJobId;
  step.durationMs = Math.max(
    0,
    endAt.getTime() - new Date(step.startAt).getTime(),
  );
}

function extendContributionStep(
  step: RatingAnalysisContributionScoreStep,
  endAt: Date,
  endJobId: number | null,
) {
  step.endJobId = endJobId;
  step.endAt = endJobId === null ? null : toIso(endAt);
  step.durationMs = Math.max(
    0,
    endAt.getTime() - new Date(step.startAt).getTime(),
  );
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

// Splits the run of #1 snapshots into intervals that break whenever the exact
// top record (chart + score) changes. Used for per-score duration accounting.
function buildScoreIntervals(
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

function toScoreStep(
  interval: RatingAnalysisTopInterval,
): RatingAnalysisScoreStep {
  return {
    score: interval.score,
    rating: interval.rating,
    startJobId: interval.startJobId,
    endJobId: interval.endJobId,
    startAt: interval.startAt,
    endAt: interval.endAt,
    durationMs: interval.durationMs,
  };
}

// Collapses consecutive score intervals held by the same chart into a single
// reign. The timeline answers "what was #1 and for how long", so a chart that
// keeps #1 while its score improves stays one entry: the top-level fields carry
// the latest score while `steps` retains every score it climbed through.
function mergeChartReigns(
  intervals: RatingAnalysisTopInterval[],
): RatingAnalysisTopReign[] {
  const reigns: RatingAnalysisTopReign[] = [];

  for (const interval of intervals) {
    const previous = reigns.at(-1);

    if (previous && previous.chartKey === interval.chartKey) {
      previous.recordKey = interval.recordKey;
      previous.score = interval.score;
      previous.rating = interval.rating;
      previous.endJobId = interval.endJobId;
      previous.endAt = interval.endAt;
      previous.durationMs += interval.durationMs;
      previous.ongoing = interval.ongoing;
      previous.steps.push(toScoreStep(interval));
      continue;
    }

    reigns.push({ ...interval, steps: [toScoreStep(interval)] });
  }

  return reigns;
}

function buildContributionIntervals(
  snapshots: NormalizedSnapshot[],
  computedAt: Date,
): RatingAnalysisContributionInterval[] {
  const intervals: RatingAnalysisContributionInterval[] = [];
  const activeIndexByKey = new Map<string, number>();

  for (let index = 0; index < snapshots.length; index += 1) {
    const snapshot = snapshots[index];
    const nextSnapshot = snapshots[index + 1] ?? null;
    const endAt = nextSnapshot?.playedAt ?? computedAt;
    const chartKeysPresent = new Set(
      snapshot.records.map((record) => record.chartKey),
    );

    for (const chartKey of chartKeysPresent) {
      const record = primaryRecordForChart(snapshot.records, chartKey);
      if (!record) continue;

      const activeIndex = activeIndexByKey.get(chartKey);
      const active =
        activeIndex !== undefined ? intervals[activeIndex] : undefined;

      if (active && activeIndexByKey.has(chartKey)) {
        const lastStep = active.steps.at(-1);

        if (
          lastStep &&
          contributionStepKey(lastStep) !== contributionStepKey(record)
        ) {
          finalizeContributionStep(lastStep, snapshot.playedAt, snapshot.jobId);
          active.steps.push(
            toContributionStep(
              snapshot,
              record,
              endAt,
              nextSnapshot?.jobId ?? null,
            ),
          );
        } else if (lastStep) {
          extendContributionStep(lastStep, endAt, nextSnapshot?.jobId ?? null);
        }

        active.slot = record.slot;
        active.score = record.score;
        active.rating = record.rating;
        active.endJobId = nextSnapshot?.jobId ?? null;
        active.endAt = nextSnapshot ? toIso(nextSnapshot.playedAt) : null;
        active.durationMs = Math.max(
          0,
          endAt.getTime() - new Date(active.startAt).getTime(),
        );
        active.ongoing = nextSnapshot === null;
        continue;
      }

      activeIndexByKey.set(chartKey, intervals.length);
      intervals.push({
        id: `${snapshot.jobId}-${chartKey.replaceAll(RECORD_KEY_SEPARATOR, "-")}`,
        chartKey: record.chartKey,
        songKey: record.songKey,
        image: record.image,
        slot: record.slot,
        score: record.score,
        rating: record.rating,
        startJobId: snapshot.jobId,
        endJobId: nextSnapshot?.jobId ?? null,
        startAt: toIso(snapshot.playedAt),
        endAt: nextSnapshot ? toIso(nextSnapshot.playedAt) : null,
        durationMs: Math.max(0, endAt.getTime() - snapshot.playedAt.getTime()),
        ongoing: nextSnapshot === null,
        steps: [
          toContributionStep(
            snapshot,
            record,
            endAt,
            nextSnapshot?.jobId ?? null,
          ),
        ],
      });
    }

    for (const [chartKey, activeIndex] of activeIndexByKey) {
      if (chartKeysPresent.has(chartKey)) continue;

      const active = intervals[activeIndex];
      if (active?.ongoing) {
        const lastStep = active.steps.at(-1);
        if (lastStep) {
          finalizeContributionStep(lastStep, snapshot.playedAt, snapshot.jobId);
        }
        active.endJobId = snapshot.jobId;
        active.endAt = toIso(snapshot.playedAt);
        active.durationMs = Math.max(
          0,
          snapshot.playedAt.getTime() - new Date(active.startAt).getTime(),
        );
        active.ongoing = false;
      }
      activeIndexByKey.delete(chartKey);
    }
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

// A new rating-list entry displaces the lowest surviving entry (the "floor").
// The floor rises through the day as higher scores land, so the displaced floors
// are consumed lowest-first. We replay that order using real play times where
// history pinned them, and fall back to ascending rating (a stable sorted
// pairing) for entries we could not match. Matched entries come first because we
// know they were played that day; unmatched ones trail by ascending rating.
function compareNewEntryConsumption(
  a: RatingAnalysisDailyContribution,
  b: RatingAnalysisDailyContribution,
) {
  if (a.matchedHistoryAt && b.matchedHistoryAt) {
    return (
      a.matchedHistoryAt.localeCompare(b.matchedHistoryAt) ||
      a.rating - b.rating ||
      a.chartKey.localeCompare(b.chartKey)
    );
  }
  if (a.matchedHistoryAt) return -1;
  if (b.matchedHistoryAt) return 1;
  return a.rating - b.rating || a.chartKey.localeCompare(b.chartKey);
}

function buildDailyContributions(
  snapshot: NormalizedSnapshot,
  previousRecords: Map<string, RatingAnalysisRecord>,
  removedBySlot: Map<RatingAnalysisSlot, RatingAnalysisRecord[]>,
  dayKey: string,
  histories: ReturnType<typeof normalizeHistories>,
): RatingAnalysisDailyContribution[] {
  const contributions: RatingAnalysisDailyContribution[] = [];
  const newBySlot = new Map<
    RatingAnalysisSlot,
    RatingAnalysisDailyContribution[]
  >();

  for (const record of snapshot.records) {
    const previousRecord =
      previousRecords.get(contributionSlotKey(record)) ?? null;
    // Only count records that actually raised the rating. A pure score gain that
    // leaves the rating unchanged does not move the total, so it is not a rating
    // contribution.
    const increasedRating =
      previousRecord === null || record.rating > previousRecord.rating;
    if (!increasedRating) continue;

    const matchedHistory = findMatchedHistory(record, dayKey, histories);
    const contribution: RatingAnalysisDailyContribution = {
      ...record,
      previousRating: previousRecord?.rating ?? null,
      previousScore: previousRecord?.score ?? null,
      // Improved entries were already in the list, so their gain is their own
      // rating increase and they displace nothing. New entries get their floor
      // and gain finalised in the second pass below.
      replacedFloorRating: previousRecord ? null : 0,
      delta: previousRecord
        ? record.rating - previousRecord.rating
        : record.rating,
      matchedHistoryAt: matchedHistory ? toIso(matchedHistory.playedAt) : null,
      attribution: matchedHistory ? "matched" : "inferred",
    };
    contributions.push(contribution);

    if (previousRecord === null) {
      const list = newBySlot.get(record.slot) ?? [];
      list.push(contribution);
      newBySlot.set(record.slot, list);
    }
  }

  // Attribute each new entry to the floor it displaced. Pairing the new entries
  // to the displaced floors is a bijection, so the per-entry gains always sum to
  // the slot's true net change however individual pairs line up.
  for (const [slot, newEntries] of newBySlot) {
    const floors = (removedBySlot.get(slot) ?? [])
      .map((floor) => floor.rating)
      .sort((a, b) => a - b);
    // A new entry that filled a slot left empty by a not-yet-full list replaced
    // nothing, modelled as a floor of 0 (full-rating credit).
    while (floors.length < newEntries.length) floors.unshift(0);

    newEntries.sort(compareNewEntryConsumption);
    newEntries.forEach((entry, index) => {
      const floor = floors[index] ?? 0;
      entry.replacedFloorRating = floor;
      entry.delta = entry.rating - floor;
    });
  }

  return contributions.sort(
    (a, b) =>
      Number(b.attribution === "matched") -
        Number(a.attribution === "matched") ||
      b.delta - a.delta ||
      a.order - b.order,
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

    // Entries present yesterday but gone today are the displaced floors. New
    // rating-list entries are attributed against them in buildDailyContributions.
    const todayKeys = new Set(snapshot.records.map(contributionSlotKey));
    const removedBySlot = new Map<RatingAnalysisSlot, RatingAnalysisRecord[]>();
    for (const record of previous?.records ?? []) {
      if (todayKeys.has(contributionSlotKey(record))) continue;
      const list = removedBySlot.get(record.slot) ?? [];
      list.push(record);
      removedBySlot.set(record.slot, list);
    }

    const contributions =
      previous === null
        ? []
        : buildDailyContributions(
            snapshot,
            previousRecords,
            removedBySlot,
            dayKey,
            normalizedHistories,
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
  const normalizedSnapshots = normalizeSnapshots(
    snapshots.filter((snapshot) => snapshot.records.length > 0),
  );
  const latestJobId = normalizedSnapshots.at(-1)?.jobId ?? null;
  const scoreIntervals = buildScoreIntervals(
    normalizedSnapshots,
    computedAtDate,
  );
  const contributionIntervals = buildContributionIntervals(
    normalizedSnapshots,
    computedAtDate,
  );
  const highestTimeline = mergeChartReigns(scoreIntervals);
  const durations = new Map<string, DurationDraft>();

  addDurationSummaries(durations, normalizedSnapshots, computedAtDate);
  addTopScoreDurations(durations, scoreIntervals);

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
    contributionIntervals,
    dailyGains: buildDailyGains(normalizedSnapshots, histories).sort((a, b) =>
      b.dayKey.localeCompare(a.dayKey),
    ),
  };
}
