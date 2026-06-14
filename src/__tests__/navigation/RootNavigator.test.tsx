import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { RootNavigator } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

jest.mock('../../navigation/AuthNavigator', () => ({ AuthNavigator: () => null }));
jest.mock('../../navigation/OnboardingNavigator', () => ({ OnboardingNavigator: () => null }));
jest.mock('../../navigation/MainTabNavigator', () => ({ MainTabNavigator: () => null }));
jest.mock('../../navigation/ClientTabNavigator', () => ({ ClientTabNavigator: () => null }));

describe('RootNavigator gate', () => {
  it('renders a loading indicator while status is loading', async () => {
    useAuthStore.setState({ status: 'loading', user: null });
    await render(<RootNavigator />);
    expect(screen.getByTestId('root-loading')).toBeTruthy();
  });

  it('renders without crashing when unauthenticated', async () => {
    useAuthStore.setState({ status: 'unauthenticated', user: null });
    await expect(render(<RootNavigator />)).resolves.not.toThrow();
  });

  it('renders without crashing when authenticated and onboarded', async () => {
    useAuthStore.setState({ status: 'authenticated', user: null });
    useAppStore.setState({ isOnboarded: true, userRole: 'trainer' });
    await expect(render(<RootNavigator />)).resolves.not.toThrow();
  });
});
