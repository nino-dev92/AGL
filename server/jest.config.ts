import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  roots: ["<rootDir>/src"],

  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],

  moduleFileExtensions: ["ts", "js", "json"],

  clearMocks: true,

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/app.ts",
    "!src/types/**",
    "!src/config/**",
  ],

  coverageDirectory: "coverage",

  coverageReporters: ["text", "lcov", "html"],
};

export default config;
