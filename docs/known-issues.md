# Known Issues

Bugs we've identified but deferred. Pick up and fix when scoped.

## NUL char (U+0000) in scraped strings crashes the rating-analysis cache refresh (jsonb)

- **Status:** fixed — NUL characters are stripped before writing `rating_analysis_cache.payload`, and internal record keys no longer embed `\u0000`
- **Discovered:** 2026-06-21 (seen in maimai-web; the same code path exists in chuni-web)
- **Severity:** low — the scrape save itself still succeeds; only a cache refresh was skipped before the fix

### Symptom

During `POST /api/jobs/data`, the server logs an error like:

```
Error recomputing rating analysis cache: ... unsupported Unicode escape sequence
DETAIL:  (the NUL code point) cannot be converted to text.
```

The job's player/record/raw-scrape data (including `full_play_data`) is saved
normally; only the `rating_analysis_cache` row fails to update for that user.

### Cause

`recomputeRatingAnalysis()` writes the analysis into the **jsonb** column
`rating_analysis_cache.payload`. PostgreSQL's `jsonb` type cannot represent the
NUL code point (U+0000). When a scraped string (e.g. a song title) contains a raw
NUL character, inserting the jsonb payload throws. The error is caught and
swallowed by the `try { await recomputeRatingAnalysis(...) } catch` block in
`api/jobs/data/+server.ts`, so the request still returns success.

Relevant files:

- `apps/{chuni,maimai}-web/src/lib/functions/ratingAnalysis.ts`
- `apps/{chuni,maimai}-web/src/routes/api/jobs/data/+server.ts` (the swallow)

Note: the `text` columns (`raw_scrape_data.data_for_image_gen`,
`raw_scrape_data.full_play_data`) are **not** affected — those values are
`JSON.stringify`'d, which escapes a NUL char into its 6-character backslash-u
escape, which is valid in `text`.

### Fix direction

Strip/replace the NUL code point (U+0000) from scraped strings before they reach
the jsonb payload. Cleanest at the scraper/parser boundary so the rest of the
pipeline stays NUL-free; alternatively sanitize the analysis object right before
the insert (regex out the backslash-u-0000 escape from
`JSON.stringify(payload)`, then `JSON.parse` it back).
