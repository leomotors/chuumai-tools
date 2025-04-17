import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss(), sveltekit()],
  define: {
    WEB_VERSION: JSON.stringify(
      command === "serve" ? "dev" : process.env.npm_package_version || "dev",
    ),
  },
}));
