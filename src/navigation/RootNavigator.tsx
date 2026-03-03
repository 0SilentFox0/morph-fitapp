import React from 'react';
import { useAppStore } from '../store/appStore';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';

export function RootNavigator() {
  const isOnboarded = useAppStore((state) => state.isOnboarded);

  return isOnboarded ? (
    <MainTabNavigator />
  ) : (
    <OnboardingNavigator />
  );
}
