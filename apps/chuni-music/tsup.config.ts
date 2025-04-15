import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm", // Output ESM
  minify: false, // No minification needed for CLI
  sourcemap: true,
  clean: true, // Clean output folder before build
  platform: "node",
  target: "esnext", // Target latest Node.js version
});
