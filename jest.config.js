/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(test|spec).{ts,tsx}'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Integration tests hit the live backend and run only via `yarn test:integration`
  // (jest.integration.config.js). Keep them out of the default unit run.
  testPathIgnorePatterns: ['/node_modules/', '\\.integration\\.test\\.'],
  // jest-expo's default transformIgnorePatterns already whitelists the RN/Expo
  // ESM packages (including expo-modules-core) that need transforming. Don't
  // override it — doing so drops those whitelists and breaks the preset setup.
};
