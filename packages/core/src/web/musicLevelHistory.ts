export type VersionedLevelSnapshot<TData> = {
  version: string;
  data: TData;
};

export type CompressedLevelHistoryRow<TData> = {
  fromVersion: string;
  toVersion: string;
  versions: string[];
  data: TData;
};

export function compressLevelHistory<TData>(
  snapshots: VersionedLevelSnapshot<TData>[],
): CompressedLevelHistoryRow<TData>[] {
  const rows: CompressedLevelHistoryRow<TData>[] = [];

  for (const snapshot of snapshots) {
    const previous = rows.at(-1);

    if (
      previous &&
      JSON.stringify(previous.data) === JSON.stringify(snapshot.data)
    ) {
      previous.toVersion = snapshot.version;
      previous.versions.push(snapshot.version);
      continue;
    }

    rows.push({
      fromVersion: snapshot.version,
      toVersion: snapshot.version,
      versions: [snapshot.version],
      data: snapshot.data,
    });
  }

  return rows;
}

export function getOldestToNewestVersions(newestToOldestVersions: string[]) {
  return [...newestToOldestVersions].reverse();
}
