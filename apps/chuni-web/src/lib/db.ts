import { env } from "$env/dynamic/private";

import { createClient } from "@repo/db-chuni/client";

export const db = createClient(env.DATABASE_URL);
