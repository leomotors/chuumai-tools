import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: "esm", // Output CJS
  minify: false, // No minification needed for CLI
  sourcemap: true,
  clean: true, // Clean output folder before build
  platform: "node",
  target: "esnext", // Target latest Node.js version
});
