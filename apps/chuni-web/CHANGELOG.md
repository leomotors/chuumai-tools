# Changelog

## [3.28.0] - 2026-06-28

- fix(dashboard): only load API keys and manual rating history on pages that use them instead of every dashboard route
- qol(data): add JP/Intl toggle on the Release column header to switch release-date sorting; missing release dates always sort last when newest-first
- qol(dashboard): combine Rating and Max Rating into one Activity chart chip with an inline mode toggle (defaults to Max Rating)
- feat(dashboard): add optional linear regression on the Activity progression chart for Rating and Max Rating, with next-milestone prediction based on the selected timeframe
- qol(dashboard): add an all-milestones switch to expand linear regression predictions for every unreached milestone
- fix(data): ignore failed rating-list scrapes when building Music for Rating timelines so empty snapshots no longer split stints
- feat(data): add hover tooltips on timeline markers showing the date and event at each point
- qol(data): show Music for Rating periods list with latest stint first
- feat(data): merge consecutive rating-list stints with score changes into one period, with expandable score history
- feat(data): add a separate Music for Rating card on song detail pages with a visual timeline and exact date ranges for each rating-list stint
- fix(dashboard): strip NUL characters from rating analysis cache payloads so jsonb inserts no longer fail on scraped titles

## [3.27.0] - 2026-06-21

- qol(dashboard): in the rating daily view, show a new rating-list entry's gain as its play rating minus the floor it displaced (and surface the replaced floor in the record details) instead of its full play rating; when several entries enter the same day each is attributed to a distinct displaced floor, ordered by play time where known

## [3.26.0] - 2026-06-21

- feat(dashboard): add a JSON download button on the job list to export the full play data captured by the scraper (usable with the Preview Next tool)
- fix(nav): preserve the Preview Next tool page URL when swapping applications

## [3.25.2] - 2026-06-21

- fix(deps): pin adapter-node to 5.5.4 to avoid the upstream 5.5.5 startup deadlock that emits an unsettled top-level await warning

## [3.25.1] - 2026-06-21

- qol(dashboard): show Rating and Max Rating with 4 decimal places in the progression chart tooltip
- qol(data): default the music data table sort to Release date descending (newest first)

## [3.25.0] - 2026-06-20

- feat(dashboard): add cached rating analysis with a #1 rating timeline (reigns with score history) and a tabbed daily breakdown splitting rating gains into BEST/CURRENT records
- refactor(dashboard): group rating composition, daily gains, #1 timeline, and milestones under a single tabbed Rating section
- feat(dashboard): collapse the Composition Selection pool behind a click-to-show card
- perf(dashboard): reduce initial job history payload and load older jobs on demand
- perf(dashboard): reduce the initial History tab to 30 recent plays and load more on demand

## [3.24.0] - 2026-06-12

- feat(dashboard): add admin-only cache clearing settings
- fix(ci): build web Docker assets on the native Buildx platform before assembling target images

## [3.23.0] - 2026-06-09

- feat(dashboard): add Music for Rating and History dashboard pages with compact record cards
- feat(dashboard): mark rating records achieved within the last seven days
- fix(ui): use the runtime locale for displayed dates

## [3.22.0] - 2026-06-09

- feat(dashboard): show the current Overpower percentage on the summary card
- feat(dashboard): add lower-color rating milestones with a starting point marker
- feat(dashboard): show play-count progress between rating milestones
- qol(dashboard): keep milestone previous-progress rows visible with empty states
- fix(dashboard): align rating and player-level metric colors with maimai
- fix(dashboard): match next milestone highlight color with maimai
- fix(dashboard): phrase zero-play milestone deltas as same play
- fix(dashboard): keep Overpower percentage from increasing KPI card height
- fix(dashboard): keep primary KPI value typography aligned with other cards
- refactor(dashboard): reuse the CHUNITHM rating component for milestones
- fix(nav): preserve dashboard subpage URLs when swapping applications

## [3.21.0] - 2026-06-08

- feat(dashboard): add manual rating CSV upload with inferred preview on Settings
- feat(dashboard): add UTC/local timezone selection and local-offset preview for manual rating uploads
- feat(dashboard): show elapsed time from previous rating milestone
- feat(dashboard): show elapsed time since previous milestone on next target card
- fix(dashboard): align milestone rating digits with Render profile rating layout
- feat(dashboard): move API key settings into a dashboard Settings tab
- fix(dashboard): improve milestone scope selector spacing and current-version icon
- feat(dashboard): include manual rating history in rating and max rating graph and heatmap views

## [3.20.0] - 2026-06-05

- feat(dashboard): add Max Rating progression chart with muted below-peak segments

## [3.19.0] - 2026-06-04

- feat(dashboard): split dashboard analytics into shared top summary with Activity and Milestones tabs
- feat(dashboard): add rating milestones with all-time/current-version progress and next-target highlighting
- feat(dashboard): add scraper job list with zoomable rating breakdown image preview and download
- qol(dashboard): replace truncated job log column with full log dialog and copy action
- feat(api): add authenticated rating breakdown image status and retrieval endpoints
- fix(api): use database time for job finish timestamps to avoid timezone skew
- refactor(dashboard): move milestone progress calculation into shared core web helpers for future reuse

## [3.18.1] - 2026-05-29

- fix(api): support authenticated multipart rating breakdown image uploads to S3-compatible storage

## [3.18.0] - 2026-05-29

- feat(data): move song record detail pages under public data routes with login-gated play records
- feat(data): add per-song level history and expandable play history timeline
- feat(api): add app info, play history, and rating breakdown image upload endpoints
- feat: store scraper rating breakdown images in S3-compatible storage

## [3.17.0] - 2026-05-20

- feat: add application swap button next to title to switch to Maimai, preserving interchangeable paths (/data, /about, /dashboard) with a custom tooltip

## [3.16.0] - 2026-05-10

- chore: bump deps
- feat: responsive mobile navbar
- feat(dashboard): use calculated rating for higher precision when consistent with source-of-truth value
- qol(dashboard): heatmap tooltip is now real-time and shows daily gain for all metrics
- qol(dashboard): heatmap reset legend/color only shows for rating
- qol(dashboard): chart y-axis auto-fits data range; longest streak replaces current streak

## [3.15.0] - 2026-04-26

- feat: show release date in data page
- qol(data page): now reset to first page when sorting

## [3.14.0] - 2026-04-21

- api: support saving this version play count

## [3.13.0] - 2026-04-20

- feat: support x-verse-x all justice honor background

## [3.12.0] - 2026-04-04

- fix(api): play count since logic

## [3.11.0] - 2026-03-28

- chore: bump deps
- upgrade to lucide icon v1

## [3.10.0] - 2026-03-06

- fix invalid logic in AoT mode

## [3.9.0] - 2026-03-01

- feat: add AoT mode in preview next calculation
- add logo scale to fix logo scale in some version

## [3.8.0] - 2026-01-15

- Update music card UI allowing for more space for long titles
- Save history data

## [3.7.0] - 2026-01-14

- accept field scraperVersion in input json

## [3.6.0] - 2026-01-13

- refactor

## [3.5.0] - 2025-01-10

- feat: endpoint for uploading scraping job result

## [3.4.0] - 2025-12-30

- feat: new page /dashboard/musicRecord/{musicId}

## [3.3.0] - 2025-12-15

- refactor: remove coerce from zod to get accurate api docs

## [3.2.0] - 2025-12-14

- fix: wrong styling in music tile
- fix all UI bug
- feat: two api endpoints to get user data

## [3.1.0] - 2025-12-13

- feat: play statistics in user profile and api endpoint to get them (no upload yet)
- refactor website, adding about page

## [3.0.1] - 2025-12-12

- feat: support for X-VERSE-X
- feat: new /data page that show all data
- feat: API with OpenAPI docs
- misc refactor for consistency
- feat: login with discord (no usecase yet, coming soon...)

## [2.3.0] - 2025-12-03

- feat: support for X-VERSE team colours

## [2.2.0] - 2025-10-29

- fix: preview next small fix
- feat: for music that does not exist, it will return empty/placeholder value instead of failing the render
- feat: node 24 (lts)

## [2.1.0] - 2025-07-20

- feat: preview best ratings of next version feature (not enabled yet)
- refactor: new UI by sonnet 4

## [2.0.0] - 2025-07-03

- breaking changes: env schema changed
- feat: add support for new version
- fix: hidden songs data not found
- feat: now show `+` on level
- feat: misc improvements and changes
- feat: add caching on data when calculate rating

## [1.6.0] - 2025-05-24

- feat: support for class emblem: band

## [1.5.1] - 2025-05-11

- update default hidden songs list (need to make this dynamically configurable soon)
- fix: show actual rating when calculation mismatch

## [1.5.0] - 2025-05-06

- fix: rounding error in rating display
- feat: 3rd and 4th rating digits now have color

## [1.4.0] - 2025-05-02

- feat: add support for hidden songs
- feat: move honor text to the top for メズマライザー meme

## [1.3.0] - 2025-04-28

- fix: rating formula for A-AAA, updated formula is from `https://reiwa.f5.si/newbestimg/chunithm_int/` by [Qman](https://github.com/Qman11010101)
- feat: change favicon because why not

## [1.2.0] - 2025-04-19

- fix: japanese font (Noto Sans JP)
- feat: add separator between Best and Current section
- chore: bump deps

## [1.1.1] - 2025-04-18

- fix: font

## [1.1.0] - 2025-04-18

- feat: enforce font for consistency across OS
- feat: add more details to how to use

## [1.0.2] - 2025-04-18

- fix: attempt to fix image loading when rendering
- feat: show chart constant version

## [1.0.0] - 2025-04-17

- feat: initial release
