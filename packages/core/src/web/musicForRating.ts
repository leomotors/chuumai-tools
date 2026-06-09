export type RatedRecord = {
  rating: number | null | undefined;
};

export type RatingRangeSummary = {
  count: number;
  avg: number | null;
  min: number | null;
  max: number | null;
};

export function summarizeRatings<T extends RatedRecord>(
  records: T[],
  options: {
    limit?: number;
    divisor?: number;
  } = {},
): RatingRangeSummary {
  const scoped = records
    .slice(0, options.limit ?? records.length)
    .filter((record) => typeof record.rating === "number");
  const divisor = options.divisor ?? scoped.length;

  if (scoped.length === 0 || divisor === 0) {
    return {
      count: scoped.length,
      avg: null,
      min: null,
      max: null,
    };
  }

  const ratings = scoped.map((record) => record.rating as number);
  const sum = ratings.reduce((total, rating) => total + rating, 0);

  return {
    count: scoped.length,
    avg: sum / divisor,
    min: Math.min(...ratings),
    max: Math.max(...ratings),
  };
}

export function sortByRatingDesc<T extends RatedRecord>(records: T[]): T[] {
  return [...records].sort(
    (a, b) => (b.rating ?? -Infinity) - (a.rating ?? -Infinity),
  );
}

export function sortByRatingAsc<T extends RatedRecord>(records: T[]): T[] {
  return [...records].sort(
    (a, b) => (a.rating ?? Infinity) - (b.rating ?? Infinity),
  );
}

export function takeRatingWindow<T extends RatedRecord>(
  records: T[],
  options: {
    limit: number;
    bottom?: boolean;
  },
): T[] {
  return (
    options.bottom ? sortByRatingAsc(records) : sortByRatingDesc(records)
  ).slice(0, options.limit);
}
