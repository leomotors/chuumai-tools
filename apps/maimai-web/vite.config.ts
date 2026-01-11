import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import devtoolsJson from "vite-plugin-devtools-json";
import { defineConfig } from "vitest/config";

const disableBrowserTests = process.env.DISABLE_BROWSER_TESTS === "true";

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
  define: {
    WEB_VERSION: JSON.stringify(
      command === "serve" ? "dev" : process.env.npm_package_version || "dev",
    ),
  },
  server: {
    port: 5174,
  },
  test: {
    passWithNoTests: true,
    projects: [
      ...(disableBrowserTests
        ? []
        : [
            {
              extends: "./vite.config.ts",

              test: {
                name: "client",

                browser: {
                  enabled: true,
                  provider: playwright(),
                  instances: [{ browser: "chromium" as const, headless: true }],
                },

                include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
                exclude: ["src/lib/server/**"],
              },
            },
          ]),

      {
        extends: "./vite.config.ts",

        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          passWithNoTests: true,
        },
      },
    ],
  },
}));
