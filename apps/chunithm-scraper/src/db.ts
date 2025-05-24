import { createClient } from "@repo/db-chuni/client";

import { environment } from "./environment.js";
import { logger } from "./logger.js";

if (!environment.DATABASE_URL) {
  logger.warn("Database Mode disabled");
}

export const db = environment.DATABASE_URL
  ? createClient(environment.DATABASE_URL)
  : null;

export type Db = NonNullable<typeof db>;
