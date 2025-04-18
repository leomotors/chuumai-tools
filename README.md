# Chuumai Tools

## Chunithm

(For Internation Ver.)

### Requirements

- [Docker](https://www.docker.com/)

### Simple Usage

```
docker run --rm \
 -v ./outputs:/app/outputs \
 -e USERNAME=YOUR_SEGA_ID \
 -e PASSWORD=YOUR_SEGA_PASSWORD \
 -e VERSION=VRS \
 -e IMAGE_GEN_URL=https://chuni.wonderhoy.me \
 -e TZ=Asia/Bangkok \
 -e LANG=th_TH.UTF-8 \
 ghcr.io/leomotors/chunithm-scraper:v4
```

You will have to change `USERNAME` and `PASSWORD` to your own,
`TZ` and `LANG` so that the image show timezone and time format correctly.

This basic command will scrape your data and save both json and image into `outputs` folder.

### Advanced Usage

- Add `-e DISCORD_TOKEN=YOUR_BOT_TOKEN -e CHANNEL_ID=DISCORD_CHANNEL_ID` to send the rendered image to Discord, or send screenshot if the scraper ran into error.
- Add `-e DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB` to save the scraped data into PostgreSQL database. You need to migrate database by using `packages/db-chuni` (Seeding is not required).

### Technical Details

packages:

- db-chuni: Database Schema
- types-chuni: Shared type and schema
- utils-chuni: Shared utils

apps:

- chuni-music: Seeding data into database and music jacket into S3
- chuni-web: Web for generating Music for Rating Image
- chunithm-scraper: Web scraper

## maimai

todo
