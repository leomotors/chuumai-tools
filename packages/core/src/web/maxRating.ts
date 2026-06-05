export type RatingPoint = {
  rating: number;
};

export type WithMaxRating<T extends RatingPoint> = T & {
  maxRating: number;
};

export function withMaxRating<T extends RatingPoint>(
  records: T[],
): WithMaxRating<T>[] {
  let maxRating = 0;

  return records.map((record) => {
    maxRating = Math.max(maxRating, record.rating);
    return {
      ...record,
      maxRating,
    };
  });
}
