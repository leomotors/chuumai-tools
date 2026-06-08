# Changelog

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
