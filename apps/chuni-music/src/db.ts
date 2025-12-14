import { createClient } from "@repo/database/client";

import { environment } from "./environment";

export const db = createClient(environment.DATABASE_URL);
