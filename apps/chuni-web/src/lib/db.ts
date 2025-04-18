import { createClient } from "@repo/db-chuni/client";

import { environment } from "./environment.js";

export const db = createClient(environment.DATABASE_URL);
