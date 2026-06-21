# Database

PostgreSQL + Drizzle ORM. This package holds the schema and migrations for two
separate databases: **chuni** and **maimai**. Each has its own database URL,
drizzle config, and migration folder.

## Layout

- `src/chuni/` — schema for the chuni database (exported as `@repo/database/chuni`)
- `src/maimai/` — schema for the maimai database (exported as `@repo/database/maimai`)
- `src/shared/` — tables shared by both DBs (`jobTable`, `apiKey`); re-exported
  from each DB's schema (e.g. `src/chuni/user/user.ts` re-exports `apiKey`).
  Edit a shared table and you change **both** databases — generate migrations for
  both.
- `src/client.ts` — `createClient(databaseUrl)` (exported as `@repo/database/client`)
- `drizzle.chuni.ts` / `drizzle.maimai.ts` — drizzle-kit configs
- `drizzle/chuni/` & `drizzle/maimai/` — generated SQL migrations + meta. Never
  hand-edit generated files.

The schema entrypoints (`src/chuni/index.ts`, `src/maimai/index.ts`) are what the
drizzle configs point at — a new table file must be re-exported from there or it
won't be picked up by codegen.

## Migrations

### Convention

Every migration **must be named**. Use the `--name` flag so drizzle generates a
named file; **never** create a name by renaming the generated file manually, and
never edit a committed migration's SQL.

> Note: some existing migrations (e.g. `0011_bored_butterfly.sql`) have
> auto-generated random names from before this convention — leave them as-is.

### Commands (run from this package dir)

All commands load `.env` via `dotenv-cli`, so `CHUNI_DATABASE_URL` /
`MAIMAI_DATABASE_URL` must be set (see `.env.template`).

```bash
# Generate a NAMED migration after editing the schema
pnpm chuni:generate --name my_migration_name
pnpm maimai:generate --name my_migration_name

# Apply pending migrations
pnpm chuni:migrate
pnpm maimai:migrate

# Export the full schema SQL
pnpm chuni:export
pnpm maimai:export
```

Workflow: edit schema → `<db>:generate --name ...` → review the generated SQL →
`<db>:migrate`. If you touched a `src/shared` table, do this for **both** dbs.

## Checks

- `pnpm check` — typecheck (`tsc`)
- `pnpm lint` / `pnpm format` — eslint (no need to run; human handles it, per
  root AGENTS.md)
