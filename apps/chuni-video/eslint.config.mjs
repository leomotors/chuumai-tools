// @ts-check

import { config } from "@remotion/eslint-config-flat";
import { defineConfig } from "eslint/config";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([...config, eslintPluginPrettierRecommended]);
