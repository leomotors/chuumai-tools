# Instruction for Chuumai Tools Monorepo

## Linting

In each app/package or root level, `pnpm lint` and `pnpm format` can be used.
However, you don't have to run those command to save time, human will do that.

## Website Part (apps/chuni-web)

The application is written using SvelteKit.

### UI Library

It also uses shadcn-svelte as UI library and all UI components are located in `packages/ui` package.

**Important**: to add a new component if not exists,
you can use `pnpm dlx shadcn-svelte add ...` inside `packages/ui` folder.
Since the folder structure is not standard to shadcn, the added components will be
located in `src/components/ui` which is not expected location.
Please move it to under either `src/atom` or `src/molecule` etc to match the design system structure.
Then make sure you fix the utils imports (`$lib/utils.js` should be `@repo/ui/utils`).
Finally, cleanup empty `src/components` folder.

## Database Schema

`apps/chuni-*` will uses `packages/db-chuni` as database schema.

Database is PostgreSQL with Drizzle ORM.

Please note that it may import and re-export some of shared table in `packages/db-shared`.

## Available MCP: Svelte

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
