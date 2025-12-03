import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: "esm", // Output ESM
  minify: false, // No minification needed for CLI
  sourcemap: true,
  clean: true, // Clean output folder before build
  platform: "node",
  target: "esnext", // Target latest Node.js version
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version || "unknown"),
  },
});
