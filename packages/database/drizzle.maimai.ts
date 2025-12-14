import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/maimai",
  schema: "./src/maimai/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.MAIMAI_DATABASE_URL!,
  },
});
