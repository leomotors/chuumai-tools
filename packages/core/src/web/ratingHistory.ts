export type DatedRatingRecord = {
  date: Date;
  rating: number;
};

export type ManualRatingRecordInput = {
  rating: number | string;
  timestamp: Date | string;
};

export type ManualRatingRecord = DatedRatingRecord & {
  isManual: true;
};

export function mergeManualRatingRecords<T extends DatedRatingRecord>(
  records: T[],
  manualRatings: ManualRatingRecordInput[] | undefined,
): Array<T | ManualRatingRecord> {
  const manualRecords: ManualRatingRecord[] = (manualRatings ?? []).map(
    (record) => ({
      date: new Date(record.timestamp),
      rating:
        typeof record.rating === "number"
          ? record.rating
          : Number(record.rating),
      isManual: true,
    }),
  );

  return [...records, ...manualRecords].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
}
