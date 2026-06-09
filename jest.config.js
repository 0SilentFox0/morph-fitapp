/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(test|spec).{ts,tsx}'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  // jest-expo's default transformIgnorePatterns already whitelists the RN/Expo
  // ESM packages (including expo-modules-core) that need transforming. Don't
  // override it — doing so drops those whitelists and breaks the preset setup.
};
