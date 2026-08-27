import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],

    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    rules: {
      // We'll enable these later
      "@typescript-eslint/no-explicit-any": "off",

      // Warn instead of failing CI
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Required for Express Request augmentation
      "@typescript-eslint/no-namespace": "off",

      // Allow String, Number, Boolean for now
      "@typescript-eslint/no-wrapper-object-types": "off",

      // Don't complain about CommonJS files like jest.config.cjs
      "no-undef": "off",
    },
  },
]);
