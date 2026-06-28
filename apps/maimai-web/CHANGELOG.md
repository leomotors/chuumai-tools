# Changelog

## [patch]

- fix(data): ignore failed rating-list scrapes when building Music for Rating timelines so empty snapshots no longer split stints
- feat(data): add hover tooltips on timeline markers showing the date and event at each point
- qol(data): show Music for Rating periods list with latest stint first
- feat(data): merge consecutive rating-list stints with score changes into one period, with expandable score history
- feat(data): add a separate Music for Rating card on song detail pages with a visual timeline and exact date ranges for each rating-list stint
- fix(dashboard): strip NUL characters from rating analysis cache payloads so jsonb inserts no longer fail on scraped titles

## [1.19.0] - 2026-06-21

- qol(dashboard): in the rating daily view, show a new rating-list entry's gain as its play rating minus the floor it displaced (and surface the replaced floor in the record details) instead of its full play rating; when several entries enter the same day each is attributed to a distinct displaced floor, ordered by play time where known

## [1.18.0] - 2026-06-21

- feat(dashboard): add a JSON download button on the job list to export the full play data captured by the scraper (usable with the Preview Next tool)
- fix(nav): preserve the Preview Next tool page URL when swapping applications

## [1.17.0] - 2026-06-20

- feat(dashboard): add cached rating analysis with a #1 rating timeline (reigns with score history) and a tabbed daily breakdown splitting rating gains into OLD/NEW records
- refactor(dashboard): group rating composition, daily gains, #1 timeline, and milestones under a single tabbed Rating section
- feat(dashboard): collapse the Composition Selection pool behind a click-to-show card
- perf(dashboard): reduce initial job history payload and load older jobs on demand
- perf(dashboard): reduce the initial History tab to 30 recent plays and load more on demand

## [1.16.0] - 2026-06-12

- feat(dashboard): add admin-only cache clearing settings

## [1.15.0] - 2026-06-09

- feat(dashboard): add Music for Rating and History dashboard pages with compact record cards
- feat(dashboard): mark rating records achieved within the last seven days
- fix(ci): build web Docker assets on the native Buildx platform before assembling target images
- fix(data): use the Re:MASTER color for the Re:MAS column
- fix(ui): use the runtime locale for displayed dates

## [1.14.0] - 2026-06-09

- feat(dashboard): add lower-color rating milestones with a starting point marker
- feat(dashboard): show play-count progress between rating milestones
- qol(dashboard): keep milestone previous-progress rows visible with empty states
- fix(dashboard): read dashboard metric colors from shared core palette
- fix(dashboard): phrase zero-play milestone deltas as same play
- fix(nav): preserve dashboard subpage URLs when swapping applications

## [1.13.0] - 2026-06-08

- feat(dashboard): add manual rating CSV upload with inferred preview on Settings
- feat(dashboard): add UTC/local timezone selection and local-offset preview for manual rating uploads
- feat(dashboard): show elapsed time from previous rating milestone
- feat(dashboard): show elapsed time since previous milestone on next target card
- fix(dashboard): render milestone ratings via scaled profile Rating for correct digit alignment
- feat(dashboard): move API key settings into a dashboard Settings tab
- fix(dashboard): improve milestone scope selector spacing and current-version icon
- feat(dashboard): split analytics into Activity and Jobs tabs
- feat(dashboard): add bronze-and-above rating milestones with star tiers through Ultimate Rainbow
- feat(dashboard): add scraper job list with zoomable rating breakdown image preview and download
- qol(dashboard): add full job log dialog with copy action
- feat(dashboard): include manual rating history in rating and max rating graph and heatmap views
- qol(dashboard): align progression chart styling with CHUNITHM by removing point markers

## [1.12.0] - 2026-06-05

- feat(dashboard): add Max Rating progression chart with muted below-peak segments

## [1.11.0] - 2026-06-03

- feat(data): move song record detail pages under public data routes with login-gated play records
- feat(data): add per-song level history and expandable play history timeline
- feat(api): add app info, play history, and rating breakdown image upload endpoints
- feat(api): add authenticated rating breakdown image status and retrieval endpoints
- feat: store scraper rating breakdown images in S3-compatible storage
- fix(api): support authenticated multipart rating breakdown image uploads to S3-compatible storage
- fix(db): migrate timestamp columns to timezone-aware storage

## [1.10.0] - 2026-05-20

- feat: add application swap button next to title to switch to Chunithm, preserving interchangeable paths (/data, /about, /dashboard) with a custom tooltip

## [1.9.0] - 2026-05-10

- chore: bump deps
- feat: responsive mobile navbar
- qol(dashboard): heatmap tooltip is now real-time and shows daily gain for all metrics
- qol(dashboard): heatmap reset legend only shows for rating
- qol(dashboard): chart y-axis auto-fits data range; longest streak replaces current streak
- fix(dashboard): chart no longer overflows vertically

## [1.8.0] - 2026-04-26

- qol(data page): now reset to first page when sorting

## [1.7.0] - 2026-04-04

- fix(api): play count since logic

## [1.6.0] - 2026-03-28

- chore: bump deps
- upgrade to lucide icon v1
- fix: calculated rating override actual rating in profile data

## [1.5.0] - 2026-03-19

- feat: assets for CiRCLE+
- update database constraint to allow null in some column and handle that
- chore: bump deps

## [1.4.0] - 2026-03-02

- show release date for intl version

## [1.3.0] - 2026-01-22

- feat: fix styling on music record page
- update table to show release date and version
- feat: preview next page

## [1.2.0] - 2026-01-19

- feat: user dashboard page
- update rating formula to include AP bonus
- add sum of old and new in render image

## [1.1.0] - 2026-01-17

- feat: support utage in history

## [1.0.0] - 2026-01-15

- Initial Release
