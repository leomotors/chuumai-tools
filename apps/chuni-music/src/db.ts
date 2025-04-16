import { createClient } from "@repo/db-chuni/client";

import { environment } from "./environment";

export const db = createClient(environment.DATABASE_URL);
