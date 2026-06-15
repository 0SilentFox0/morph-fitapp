import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ClientTypesScreen } from '../../../../screens/onboarding/steps/ClientTypesScreen';
import { useAppStore } from '../../../../store/appStore';
import { useOnboardingStore } from '../../../../store/onboardingStore';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

const press = async (label: string) => {
  await act(async () => {
    fireEvent.press(screen.getByLabelText(label));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  useOnboardingStore.getState().reset();
  useAppStore.getState().reset();
});

describe('ClientTypesScreen', () => {
  it('client role: single-select self level (a second pick replaces the first)', async () => {
    useAppStore.getState().setUserRole('client');
    await render(<ClientTypesScreen />);

    expect(screen.getByText('How would you classify yourself?')).toBeTruthy();

    await press('Beginner');
    expect(useOnboardingStore.getState().selfLevel).toBe('Beginner');
    await press('Amateur');
    expect(useOnboardingStore.getState().selfLevel).toBe('Amateur');
    expect(useOnboardingStore.getState().clientTypes).toEqual([]);
  });

  it('trainer role: multi-select client types', async () => {
    useAppStore.getState().setUserRole('trainer');
    await render(<ClientTypesScreen />);

    expect(screen.getByText('Who do you usually train?')).toBeTruthy();

    await press('Beginners');
    await press('Pro');
    expect(useOnboardingStore.getState().clientTypes).toEqual([
      'Beginners',
      'Pro',
    ]);
  });

  it('advances to WhereTrain on Next', async () => {
    useAppStore.getState().setUserRole('client');
    await render(<ClientTypesScreen />);
    await press('Next step');
    expect(mockNavigate).toHaveBeenCalledWith('WhereTrain');
  });
});
