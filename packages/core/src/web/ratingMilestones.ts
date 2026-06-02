export type RatingMilestoneDefinition = {
  id: string;
  label: string;
  rating: number;
};

export type RatingMilestoneRecord = {
  date: Date;
  rating: number;
  jobId?: number | null;
};

export type RatingMilestoneAchievement = RatingMilestoneDefinition & {
  achievedAt: Date | null;
  achievedRating: number | null;
  jobId: number | null;
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

  return [...milestones]
    .sort((a, b) => a.rating - b.rating)
    .map((milestone) => {
      const record = sortedRecords.find((r) => r.rating >= milestone.rating);

      return {
        ...milestone,
        achievedAt: record?.date ?? null,
        achievedRating: record?.rating ?? null,
        jobId: record?.jobId ?? null,
      };
    });
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
