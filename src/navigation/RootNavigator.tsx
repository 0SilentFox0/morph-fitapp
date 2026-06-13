import React from 'react';
import { useAppStore } from '../store/appStore';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ClientTabNavigator } from './ClientTabNavigator';

export function RootNavigator() {
  const isOnboarded = useAppStore((state) => state.isOnboarded);
  const userRole = useAppStore((state) => state.userRole);

  if (!isOnboarded) {
    return <OnboardingNavigator />;
  }

  // Clients and trainers get entirely separate tab trees so the two experiences
  // can evolve independently while sharing components, theme and stores.
  return userRole === 'client' ? <ClientTabNavigator /> : <MainTabNavigator />;
}
