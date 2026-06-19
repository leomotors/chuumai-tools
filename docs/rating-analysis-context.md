# Rating Analysis Handoff

Status as of 2026-06-20: implemented and committed on
`feature/dashboard-rating-analysis`.

## What Changed

- Added `/dashboard/rating-analysis` to both `apps/chuni-web` and
  `apps/maimai-web`.
- Added a per-user `rating_analysis_cache` table in both app schemas.
- Added shared pure analysis logic in `packages/core/src/web/ratingAnalysis.ts`
  and exported it through `@repo/core/web`.
- Added app-specific loaders in each web app that read completed snapshots,
  rating-list rows, chart metadata, levels, and play history, then upsert the
  cache.
- Recomputes cache after successful scraper `/api/jobs/data` uploads.
- Page loaders rebuild missing or stale cache at request time instead of
  returning a 500.
- Added dashboard nav entries and swap-url preservation for the shared route.
- Added unreleased changelog entries for both apps.

## Core Analysis Logic

- `highestTimeline` is a list of `RatingAnalysisTopReign`: consecutive snapshots
  where the same chart holds #1 are merged into a single reign (regardless of
  score), so the timeline answers "what was #1 and how long". Each reign carries
  the latest score in its top-level fields plus a `steps`
  (`RatingAnalysisScoreStep[]`, oldest first) list of every score it climbed
  through, with per-step start/end/duration.
- Per-score top durations are still tracked separately via internal score
  intervals, so `topScoreDurationMs` keeps its exact-score meaning.
- Daily contributions only include records whose **rating increased** (or new
  rating-list entries). A pure score gain that does not move the rating is
  excluded.

## Current UI Behavior

- The page has two tabs: Timeline and Daily.
- Timeline renders as a vertical timeline (newest/current first) with a dot/line
  rail. Each reign card shows cover art, difficulty/level chips, score, rating,
  start -> end, and duration; the ongoing reign is accented with a `Current #1`
  badge. Reigns spanning multiple scores expose an expandable score history
  (`<details>`), summarized as a score range.
- Daily: each day header puts the date plus rating gain, play-count gain, and
  overpower gain (when present) inline with Lucide icons, and a ROI badge on the
  right.
- Daily "Rating records" is an expandable block (`<details>`). Collapsed shows a
  brief jacket strip per pool; expanded shows full per-song cards. Records are
  split into the two rating pools, labeled per each app's rating card:
  - chuni: `BEST` / `CURRENT`
  - maimai: `OLD` / `NEW`
  - Pools use amber (best/old) and sky (current/new) accent chips.
- Brief tiles show the rating delta; a new rating-list entry shows a Sparkles
  icon with the new rating value instead.
- A contribution whose previous score/rating is missing (entered from outside
  the rating list) renders a `CircleDashed` icon with an
  `Outside rating list` tooltip instead of long text.
- The ROI heat-map color scales to the 90th percentile of positive ROI days so a
  single outlier (e.g. the gain right after a rating reset) does not flatten the
  range. Negative ROI is shown as `--` with a neutral background.
- maimai `remaster` difficulty is displayed as `Re:MASTER`.

## Cache Notes

- Payload schema version is currently `5`.
- Existing cache rows with older payloads rebuild automatically because
  `ratingAnalysisPayloadIsCurrent` rejects old schema versions and now also
  requires the per-reign `steps` array.
- Manual rating uploads are still excluded because they do not include per-song
  rating-list breakdowns.

## Verification

The following checks passed after the latest UI and payload changes:

```sh
pnpm --filter @repo/core test -- ratingAnalysis
pnpm --filter @repo/core check
pnpm --filter chuni-web check
pnpm --filter maimai-web check
pnpm --filter chuni-web lint
pnpm --filter maimai-web lint
git diff --check
```
