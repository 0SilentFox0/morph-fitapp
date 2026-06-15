import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ClientTabNavigator } from './ClientTabNavigator';
import { AuthNavigator } from './AuthNavigator';
import { ConnectionErrorScreen } from '../screens/ConnectionErrorScreen';
import theme from '../theme';
const { colors } = theme;

export function RootNavigator() {
  const status = useAuthStore((state) => state.status);
  const isOnboarded = useAppStore((state) => state.isOnboarded);
  const userRole = useAppStore((state) => state.userRole);

  if (status === 'loading') {
    return (
      <View testID="root-loading" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  // A stored session that couldn't be verified due to a network/server error —
  // offer a retry instead of bouncing the user to login (the token is intact).
  if (status === 'offline') {
    return <ConnectionErrorScreen />;
  }

  if (status === 'unauthenticated') {
    return <AuthNavigator />;
  }

  // Authenticated. Existing onboarding flow still gates first-run setup.
  if (!isOnboarded) {
    return <OnboardingNavigator />;
  }

  // Clients and trainers get entirely separate tab trees so the two experiences
  // can evolve independently while sharing components, theme and stores.
  return userRole === 'client' ? <ClientTabNavigator /> : <MainTabNavigator />;
}
