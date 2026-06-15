/** @type {import('jest').Config} */
// Integration / contract tests that exercise the REAL FitConnect backend.
// Run with: `yarn test:integration` (sets RUN_INTEGRATION=1). Requires network
// access to the backend in src/config/env.ts (EXPO_PUBLIC_API_BASE_URL).
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/*.integration.test.ts'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
};
