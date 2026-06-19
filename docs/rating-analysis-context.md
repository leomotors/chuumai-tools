# Rating Analysis Handoff

Status as of 2026-06-19: implemented and committed on
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

## Current UI Behavior

- The page has two tabs: Timeline and Daily.
- Timeline sorts newest/current first and shows cover art, difficulty chip,
  level, score, rating, start, end, and duration.
- Daily shows play count gain, rating gain, overpower gain when available, ROI,
  and changed rating-list contributors.
- Daily contributor cards show cover art, difficulty chip, level, score change,
  rating change, and attribution.
- Missing previous score/rating in a contribution is displayed as
  `Outside rating list`.
- maimai `remaster` difficulty is displayed as `Re:MASTER`.

## Cache Notes

- Payload schema version is currently `3`.
- Existing cache rows with older payloads should rebuild automatically because
  `ratingAnalysisPayloadIsCurrent` rejects old schema versions.
- Manual rating uploads are still excluded because they do not include per-song
  rating-list breakdowns.

## Verification

The following checks passed after the latest UI and payload changes:

```sh
pnpm --filter @repo/core test -- ratingAnalysis
pnpm --filter @repo/core check
pnpm --filter chuni-web check
pnpm --filter maimai-web check
git diff --check
```
