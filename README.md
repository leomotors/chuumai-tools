# Chuumai Tools

## Chunithm

(Internation Ver.)

packages:

- db-chuni: Database Schema

apps:

- chuni-music: Seeding data into database and music jacket into S3
- chuni-web: Web for generating Music for Rating Image
- chunithm-scraper: Web scraper

### Database

PostgreSQL and S3-compatible storage is needed, use `apps/chuni-music` to see the data

If you don't use minio, you may have to modify some code (`forcePathStyle`)

### Scraper

**Requires**: Docker (to run the image)

**Optional**: Saving to database (Requires seeding), Sending Image to Discord (requires Discord Bot Client)

todo: add publish docker image

## maimai

todo
