// Global test setup. Runs before each test file (see jest.config.js setupFiles).

// React 19 requires this flag for act() to flush updates correctly; without it
// async renders leak "overlapping act()" warnings and corrupt later tests.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Persisted Zustand stores (e.g. draftProgramStore) write through AsyncStorage.
// Swap in the official in-memory mock so persistence works in the test runner.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// @expo/vector-icons pulls in expo-font -> expo-asset, which isn't resolvable
// under the test runner. Render every icon set as a lightweight stub so screen
// tests can mount without loading the native font/asset chain.
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Icon = (props) => React.createElement(Text, props, props.name ?? null);
  return new Proxy({}, { get: () => Icon });
});

// The native date/time picker has no JS fallback under the test runner; stub it.
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Provide stable safe-area insets so screens wrapped in OnboardingLayout can
// render without a real SafeAreaProvider.
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = { top: 0, bottom: 0, left: 0, right: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});
