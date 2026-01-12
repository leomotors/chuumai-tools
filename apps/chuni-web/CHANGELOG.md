# Changelog

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
