// Importing the store registers the API client's connectivity bridge.
import './src/store/connectivityStore';

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/layout';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { colors } from './src/theme/colors';
import { ThemeProvider } from './src/theme/ThemeContext';

const AppTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    // Transparent so the app-wide ScreenBackground gradient shows through every scene.
    background: 'transparent',
    card: 'transparent',
    text: colors.text,
    border: colors.border,
  },
};

export default function App() {
  useEffect(() => {
    void useAuthStore.getState().loadSession();
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.screenBg }}>
          <ErrorBoundary>
            <NavigationContainer theme={AppTheme}>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
            <OfflineBanner />
          </ErrorBoundary>
        </View>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
