type TimeLike = Date | string | number | null | undefined;

export type ImprovementTimelineEntry<TImprovement, THistory> = {
  id: string;
  improvement: TImprovement;
  matchedHistory: THistory | null;
  displayDate: Date | null;
  historyRecords: THistory[];
};

export type ImprovementTimeline<TImprovement, THistory> = {
  topHistoryRecords: THistory[];
  entries: ImprovementTimelineEntry<TImprovement, THistory>[];
};

export type BuildImprovementTimelineOptions<TImprovement, THistory> = {
  improvements: TImprovement[];
  historyRecords: THistory[];
  getImprovementTime: (improvement: TImprovement) => TimeLike;
  getHistoryTime: (historyRecord: THistory) => TimeLike;
  isSamePlay: (improvement: TImprovement, historyRecord: THistory) => boolean;
  getId?: (improvement: TImprovement, index: number) => string;
};

function toTime(value: TimeLike) {
  if (value === null || value === undefined) {
    return null;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function toDate(value: TimeLike) {
  const time = toTime(value);
  return time === null ? null : new Date(time);
}

function getLatestHistoryIndexBefore<TImprovement, THistory>(
  improvement: TImprovement,
  historyRecords: THistory[],
  usedHistoryIndexes: Set<number>,
  getHistoryTime: (historyRecord: THistory) => TimeLike,
  isSamePlay: (improvement: TImprovement, historyRecord: THistory) => boolean,
  maxTime: number | null,
  minTime: number | null,
) {
  let bestIndex = -1;
  let bestTime = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < historyRecords.length; index += 1) {
    if (usedHistoryIndexes.has(index)) {
      continue;
    }

    const historyRecord = historyRecords[index];
    if (!isSamePlay(improvement, historyRecord)) {
      continue;
    }

    const historyTime = toTime(getHistoryTime(historyRecord));
    if (historyTime === null) {
      continue;
    }

    if (maxTime !== null && historyTime > maxTime) {
      continue;
    }

    if (minTime !== null && historyTime <= minTime) {
      continue;
    }

    if (historyTime > bestTime) {
      bestIndex = index;
      bestTime = historyTime;
    }
  }

  return bestIndex;
}

export function buildImprovementTimeline<TImprovement, THistory>({
  improvements,
  historyRecords,
  getImprovementTime,
  getHistoryTime,
  isSamePlay,
  getId,
}: BuildImprovementTimelineOptions<
  TImprovement,
  THistory
>): ImprovementTimeline<TImprovement, THistory> {
  const usedHistoryIndexes = new Set<number>();

  const matchedHistoryIndexes = improvements.map((improvement, index) => {
    const improvementTime = toTime(getImprovementTime(improvement));
    const nextImprovementTime = toTime(
      improvements[index + 1]
        ? getImprovementTime(improvements[index + 1])
        : null,
    );

    const scopedMatchIndex = getLatestHistoryIndexBefore(
      improvement,
      historyRecords,
      usedHistoryIndexes,
      getHistoryTime,
      isSamePlay,
      improvementTime,
      nextImprovementTime,
    );
    const canFallbackOutsideScopedWindow =
      nextImprovementTime === null || improvementTime === nextImprovementTime;
    const matchIndex =
      scopedMatchIndex === -1 && canFallbackOutsideScopedWindow
        ? getLatestHistoryIndexBefore(
            improvement,
            historyRecords,
            usedHistoryIndexes,
            getHistoryTime,
            isSamePlay,
            improvementTime,
            null,
          )
        : scopedMatchIndex;

    if (matchIndex !== -1) {
      usedHistoryIndexes.add(matchIndex);
    }

    return matchIndex;
  });

  const entries = improvements.map((improvement, index) => {
    const matchedHistoryIndex = matchedHistoryIndexes[index];
    const matchedHistory =
      matchedHistoryIndex === -1 ? null : historyRecords[matchedHistoryIndex];
    const displayDate = matchedHistory
      ? toDate(getHistoryTime(matchedHistory))
      : toDate(getImprovementTime(improvement));

    return {
      id: getId?.(improvement, index) ?? String(index),
      improvement,
      matchedHistory,
      displayDate,
      historyRecords: [] as THistory[],
    };
  });

  const entryTimes = entries.map((entry) => toTime(entry.displayDate));
  const topHistoryRecords: THistory[] = [];

  for (let index = 0; index < historyRecords.length; index += 1) {
    if (usedHistoryIndexes.has(index)) {
      continue;
    }

    const historyRecord = historyRecords[index];
    const historyTime = toTime(getHistoryTime(historyRecord));

    if (historyTime === null) {
      entries.at(-1)?.historyRecords.push(historyRecord);
      continue;
    }

    const firstTime = entryTimes[0] ?? null;
    if (firstTime === null || historyTime > firstTime) {
      topHistoryRecords.push(historyRecord);
      continue;
    }

    const entryIndex = entryTimes.findIndex((currentTime, currentIndex) => {
      const nextTime = entryTimes[currentIndex + 1] ?? null;

      if (currentTime === null) {
        return false;
      }

      return (
        historyTime <= currentTime &&
        (nextTime === null || historyTime > nextTime)
      );
    });

    if (entryIndex === -1) {
      entries.at(-1)?.historyRecords.push(historyRecord);
      continue;
    }

    entries[entryIndex].historyRecords.push(historyRecord);
  }

  return {
    topHistoryRecords,
    entries,
  };
}
