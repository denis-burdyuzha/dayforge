import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";

import eslintConfigPrettier from "eslint-config-prettier";

import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "dist",
    "coverage",
    "node_modules",
  ]),

  {
    files: ["**/*.{ts,tsx}"],

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],

    languageOptions: {
      globals: globals.browser,
    },

    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },

    rules: {
      // -------------------------
      // Console
      // -------------------------

      "no-console": [
        "error",
        {
          allow: ["warn", "error"],
        },
      ],

      "no-debugger": "error",

      // -------------------------
      // Imports
      // -------------------------

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      "unused-imports/no-unused-imports": "error",

      "@typescript-eslint/no-unused-vars": "off",

      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // -------------------------
      // TypeScript
      // -------------------------

      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
        },
      ],
    },
  },
]);