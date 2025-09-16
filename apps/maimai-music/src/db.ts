import { createClient } from "@repo/db-maimai/client";

import { environment } from "./environment";

export const db = createClient(environment.DATABASE_URL);
