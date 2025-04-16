import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function createClient(databaseUrl: string) {
  const pgClient = postgres(databaseUrl);
  const db = drizzle(pgClient);
  return db;
}
