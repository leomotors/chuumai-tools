import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { environment } from "./environment.js";

export const pgClient = postgres(environment.DATABASE_URL as string);
export const db = drizzle(pgClient);
