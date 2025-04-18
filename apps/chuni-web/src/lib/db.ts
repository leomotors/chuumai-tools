import { env } from "$env/dynamic/private";

import { createClient } from "@repo/db-chuni/client";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const db = createClient(env.DATABASE_URL);
