/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  roots: ["<rootDir>/tests"],

  setupFiles: ["<rootDir>/tests/setup/env.ts"],

  setupFilesAfterEnv: ["<rootDir>/tests/setup/setup.ts"],

  testMatch: ["**/*.test.ts"],

  clearMocks: true,

  collectCoverageFrom: ["src/**/*.ts", "!src/server.ts"],

  coverageDirectory: "coverage",

  coverageReporters: ["text", "lcov", "html"],
};
