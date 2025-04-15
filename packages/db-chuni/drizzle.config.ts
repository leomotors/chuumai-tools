import { defineConfig } from "drizzle-kit";

import { environment } from "./src/environment";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: environment.DATABASE_URL,
  },
});
