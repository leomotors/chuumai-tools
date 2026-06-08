export type RatingMilestoneDefinition = {
  id: string;
  label: string;
  rating: number;
  isStartingPoint?: boolean;
};

export type RatingMilestoneRecord = {
  date: Date;
  rating: number;
  jobId?: number | null;
  playCount?: number | null;
};

export type RatingMilestoneAchievement = RatingMilestoneDefinition & {
  achievedAt: Date | null;
  achievedRating: number | null;
  achievedPlayCount: number | null;
  jobId: number | null;
  previousAchievedAt: Date | null;
  previousAchievedPlayCount: number | null;
  playCountFromPrevious: number | null;
  playCountSincePrevious: number | null;
};

export type RatingMilestoneProgress = {
  allTime: RatingMilestoneAchievement[];
  currentVersion: RatingMilestoneAchievement[];
  currentVersionStart: Date | null;
};

export type RatingMilestoneProgressOptions = {
  resetRecords?: RatingMilestoneRecord[];
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function sortRecords(
  records: RatingMilestoneRecord[],
): RatingMilestoneRecord[] {
  return [...records].sort((a, b) => a.date.getTime() - b.date.getTime());
}

function latestRecordPerDay(
  records: RatingMilestoneRecord[],
): RatingMilestoneRecord[] {
  const byDay = new Map<string, RatingMilestoneRecord>();

  for (const record of sortRecords(records)) {
    const key = dayKey(record.date);
    const current = byDay.get(key);
    if (!current || current.date.getTime() <= record.date.getTime()) {
      byDay.set(key, record);
    }
  }

  return sortRecords([...byDay.values()]);
}

export function findLatestRatingReset(
  records: RatingMilestoneRecord[],
): RatingMilestoneRecord | null {
  const dailyLatest = latestRecordPerDay(records);
  let latestReset: RatingMilestoneRecord | null = null;

  for (let i = 1; i < dailyLatest.length; i++) {
    const previous = dailyLatest[i - 1];
    const current = dailyLatest[i];
    if (current.rating < previous.rating) {
      latestReset = current;
    }
  }

  return latestReset;
}

function buildAchievements(
  milestones: RatingMilestoneDefinition[],
  records: RatingMilestoneRecord[],
): RatingMilestoneAchievement[] {
  const sortedRecords = sortRecords(records);
  const latestRecordWithPlayCount =
    sortedRecords.findLast((record) => record.playCount != null) ?? null;
  let previousAchievedAt: Date | null = null;
  let previousAchievedPlayCount: number | null = null;

  return [...milestones]
    .sort((a, b) => a.rating - b.rating)
    .map((milestone) => {
      const record = sortedRecords.find((r) => r.rating >= milestone.rating);
      const achievedAt = record?.date ?? null;
      const achievedPlayCount = record?.playCount ?? null;
      const playCountFromPrevious =
        achievedPlayCount != null && previousAchievedPlayCount != null
          ? Math.max(0, achievedPlayCount - previousAchievedPlayCount)
          : null;
      const playCountSincePrevious =
        !record &&
        latestRecordWithPlayCount?.playCount != null &&
        previousAchievedPlayCount != null
          ? Math.max(
              0,
              latestRecordWithPlayCount.playCount - previousAchievedPlayCount,
            )
          : null;

      const achievement = {
        ...milestone,
        achievedAt,
        achievedRating: record?.rating ?? null,
        achievedPlayCount,
        jobId: record?.jobId ?? null,
        previousAchievedAt,
        previousAchievedPlayCount,
        playCountFromPrevious,
        playCountSincePrevious,
      };

      if (achievedAt) {
        previousAchievedAt = achievedAt;
        previousAchievedPlayCount = achievedPlayCount;
      }

      return achievement;
    });
}

function plural(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

export function formatRatingMilestoneElapsed(
  previousAchievedAt: Date | null,
  achievedAt: Date | null,
): string | null {
  if (!previousAchievedAt || !achievedAt) return null;

  const elapsedDays = Math.max(
    0,
    Math.round(
      (achievedAt.getTime() - previousAchievedAt.getTime()) /
        (24 * 60 * 60 * 1000),
    ),
  );

  if (elapsedDays === 0) return "same day";
  if (elapsedDays < 60) return plural(elapsedDays, "day");

  if (elapsedDays < 365) {
    return plural(Math.round(elapsedDays / 30), "month");
  }

  const years = Math.floor(elapsedDays / 365);
  const months = Math.round((elapsedDays % 365) / 30);
  if (months === 0) return plural(years, "year");
  return `${plural(years, "year")} ${plural(months, "month")}`;
}

export function buildRatingMilestoneProgress(
  milestones: RatingMilestoneDefinition[],
  records: RatingMilestoneRecord[],
  options: RatingMilestoneProgressOptions = {},
): RatingMilestoneProgress {
  const sortedRecords = sortRecords(records);
  const latestReset = findLatestRatingReset(
    options.resetRecords ?? sortedRecords,
  );
  const currentVersionRecords = latestReset
    ? sortedRecords.filter(
        (record) => record.date.getTime() >= latestReset.date.getTime(),
      )
    : sortedRecords;

  return {
    allTime: buildAchievements(milestones, sortedRecords),
    currentVersion: buildAchievements(milestones, currentVersionRecords),
    currentVersionStart: latestReset?.date ?? null,
  };
}
