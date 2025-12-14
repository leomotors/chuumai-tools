import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/chuni",
  schema: "./src/chuni/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.CHUNI_DATABASE_URL!,
  },
});
