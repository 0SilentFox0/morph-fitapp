// Global test setup. Runs before each test file (see jest.config.js setupFiles).

// Persisted Zustand stores (e.g. draftProgramStore) write through AsyncStorage.
// Swap in the official in-memory mock so persistence works in the test runner.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
