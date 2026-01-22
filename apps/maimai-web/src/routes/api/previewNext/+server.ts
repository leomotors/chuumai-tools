import { json } from "@sveltejs/kit";

import { previewNextRequestSchema } from "$lib/api/schemas";
import { db } from "$lib/db";
import { getMusicDataCached } from "$lib/functions/musicData";
import {
  addForRenderInfo,
  calculateRatingTotals,
} from "$lib/functions/ratingCalculation";
import { getEnabledVersions } from "$lib/version";

import { musicVersionTable } from "@repo/database/maimai";
import { chartSchema } from "@repo/types/maimai";

import type { RequestHandler } from "./$types";

type Record = ReturnType<typeof addForRenderInfo>;

function compareRecord(a: Record, b: Record) {
  const ratingA = a.rating ?? 0;
  const ratingB = b.rating ?? 0;
  if (ratingA !== ratingB) {
    return ratingB - ratingA;
  }
  return b.score - a.score;
}

export const POST: RequestHandler = async ({ request }) => {
  const enabledVersions = getEnabledVersions();

  const body = await request.json();
  const parseResult = previewNextRequestSchema.safeParse(body);

  if (!parseResult.success) {
    return new Response(JSON.stringify(parseResult.error), {
      status: 400,
    });
  }

  const { data, nextVersion, currentVersion, intlVersion } = parseResult.data;

  if (
    !enabledVersions.includes(nextVersion) ||
    !enabledVersions.includes(currentVersion)
  ) {
    return new Response(
      `Invalid version, valid versions are: ${enabledVersions.join(", ")}`,
      { status: 400 },
    );
  }

  const musicData = await getMusicDataCached(nextVersion);

  const { profile, allRecords } = data;

  // Process all records
  const processed = allRecords.map((record) => {
    try {
      return addForRenderInfo(record, musicData);
    } catch (_) {
      return null;
    }
  });

  // Filter old/new songs
  const rawVersionData = await db.select().from(musicVersionTable);
  const versionData = intlVersion
    ? rawVersionData.map((d) => ({
        ...d,
        version: d.versionIntl || d.version,
      }))
    : rawVersionData;

  const newSongs = processed
    .filter((record) => record !== null)
    .filter((record) =>
      versionData.some(
        (v) =>
          v.title === record.title &&
          (v.version === currentVersion || v.version === nextVersion),
      ),
    );

  const oldSongs = processed
    .filter((record) => record !== null)
    .filter((record) => !newSongs.some((nc) => nc.title === record.title));

  const new15 = newSongs.sort(compareRecord).slice(0, 15);
  const old35 = oldSongs.sort(compareRecord).slice(0, 35);

  const rating = calculateRatingTotals(old35, new15);

  return json({
    profile: {
      ...profile,
      rating: rating.total,
    },
    best: old35.map((d) => chartSchema.parse(d)),
    current: new15.map((d) => chartSchema.parse(d)),
  });
};
