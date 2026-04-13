import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ScreenBackground } from './src/components/layout';
import { ThemeProvider } from './src/theme/ThemeContext';
import { colors } from './src/theme/colors';

const AppTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.screenBg,
    card: colors.screenBg,
    text: colors.text,
    border: colors.border,
  },
};

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.screenBg }}>
          <ScreenBackground>
            <NavigationContainer theme={AppTheme}>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </ScreenBackground>
        </View>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
