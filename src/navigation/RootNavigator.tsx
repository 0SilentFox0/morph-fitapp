import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { ConnectionErrorScreen } from '../screens/ConnectionErrorScreen';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import theme from '../theme';
import { AuthNavigator } from './AuthNavigator';
import { ClientTabNavigator } from './ClientTabNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';

const { colors } = theme;

export function RootNavigator() {
  const status = useAuthStore((state) => state.status);

  const isOnboarded = useAppStore((state) => state.isOnboarded);

  const signupMode = useAppStore((state) => state.signupMode);

  const userRole = useAppStore((state) => state.userRole);

  if (status === 'loading') {
    return (
      <View
        testID="root-loading"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  // A stored session that couldn't be verified due to a network/server error —
  // offer a retry instead of bouncing the user to login (the token is intact).
  if (status === 'offline') {
    return <ConnectionErrorScreen />;
  }

  // A brand-new user signing up runs onboarding before the account exists; the
  // account is created at the end. Rendering OnboardingNavigator here (and again
  // in the authenticated-but-not-onboarded branch below) keeps the SAME component
  // mounted across the register-driven auth transition, so there's no flash/remount.
  if (status === 'unauthenticated') {
    return signupMode ? <OnboardingNavigator /> : <AuthNavigator />;
  }

  // Authenticated. Existing onboarding flow still gates first-run setup.
  if (!isOnboarded) {
    return <OnboardingNavigator />;
  }

  // Clients and trainers get entirely separate tab trees so the two experiences
  // can evolve independently while sharing components, theme and stores.
  return userRole === 'client' ? <ClientTabNavigator /> : <MainTabNavigator />;
}
