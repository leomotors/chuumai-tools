// @ts-check

import { defineConfig } from "eslint/config";
import eslintPluginSvelte from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import tseslint from "typescript-eslint";

import baseConfig from "./eslint-base.js";

export default defineConfig(
  ...baseConfig,
  ...eslintPluginSvelte.configs.recommended,
  ...eslintPluginSvelte.configs.prettier,
  // https://github.com/sveltejs/eslint-plugin-svelte/issues/732
  {
    files: ["**/*.svelte"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".svelte"],
      },
    },
    rules: {
      "svelte/no-navigation-without-resolve": [
        "error",
        {
          ignoreGoto: false,
          // https://github.com/sveltejs/eslint-plugin-svelte/issues/1353
          ignoreLinks: true,
          ignorePushState: false,
          ignoreReplaceState: false,
        },
      ],
    },
  },
);
