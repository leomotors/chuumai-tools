import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
  define: {
    WEB_VERSION: JSON.stringify(
      command === "serve" ? "dev" : process.env.npm_package_version || "dev",
    ),
  },
}));
