// @ts-check

import { createESLintConfig } from "@leomotors/config";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...createESLintConfig(),
  {
    files: ["**/*.ts", "**/*.svelte", "**/*.mts"],
    rules: {
      "no-undef": "off",
    },
  },
]);
