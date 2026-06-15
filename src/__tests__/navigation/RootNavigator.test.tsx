import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { RootNavigator } from '../../navigation/RootNavigator';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';

jest.mock('../../navigation/AuthNavigator', () => ({
  AuthNavigator: () => null,
}));
jest.mock('../../navigation/OnboardingNavigator', () => ({
  OnboardingNavigator: () => null,
}));
jest.mock('../../navigation/MainTabNavigator', () => ({
  MainTabNavigator: () => null,
}));
jest.mock('../../navigation/ClientTabNavigator', () => ({
  ClientTabNavigator: () => null,
}));

describe('RootNavigator gate', () => {
  it('renders a loading indicator while status is loading', async () => {
    useAuthStore.setState({ status: 'loading', user: null });
    await render(<RootNavigator />);
    expect(screen.getByTestId('root-loading')).toBeTruthy();
  });

  it('renders without crashing when unauthenticated', () => {
    useAuthStore.setState({ status: 'unauthenticated', user: null });
    expect(() => render(<RootNavigator />)).not.toThrow();
  });

  it('renders the connection-error retry screen when offline', async () => {
    useAuthStore.setState({ status: 'offline', user: null });
    await render(<RootNavigator />);
    expect(screen.getByTestId('connection-error')).toBeTruthy();
  });

  it('renders without crashing when authenticated and onboarded', () => {
    useAuthStore.setState({ status: 'authenticated', user: null });
    useAppStore.setState({ isOnboarded: true, userRole: 'trainer' });
    expect(() => render(<RootNavigator />)).not.toThrow();
  });
});
