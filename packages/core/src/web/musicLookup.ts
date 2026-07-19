/**
 * Versions to probe when looking up a single song on the detail page.
 *
 * Music data lists are built per version (a song only appears when it has
 * level rows for that version), so new songs during a version transition
 * only exist in the latest enabled version. Probing just the default and
 * the latest version keeps the fallback cheap.
 */
export function getMusicLookupVersions(
  defaultVersion: string,
  newestToOldestVersions: string[],
): string[] {
  const latestVersion = newestToOldestVersions[0];

  if (latestVersion && latestVersion !== defaultVersion) {
    return [defaultVersion, latestVersion];
  }

  return [defaultVersion];
}

/**
 * Find a song's music data, probing each version in order and returning the
 * matches from the first version that has any. Returns an empty array when
 * the song exists in none of the given versions.
 */
export async function findMusicDataWithVersionFallback<T>(
  versions: string[],
  getMusicDataForVersion: (version: string) => Promise<T[]>,
  matches: (item: T) => boolean,
): Promise<T[]> {
  for (const version of versions) {
    const found = (await getMusicDataForVersion(version)).filter(matches);

    if (found.length > 0) {
      return found;
    }
  }

  return [];
}
