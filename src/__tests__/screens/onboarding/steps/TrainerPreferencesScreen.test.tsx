import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { TrainerPreferencesScreen } from '../../../../screens/onboarding/steps/TrainerPreferencesScreen';
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
  useAppStore.getState().setUserRole('client');
});

describe('TrainerPreferencesScreen', () => {
  it('gender is single-select; a second pick replaces the first', async () => {
    await render(<TrainerPreferencesScreen />);

    await press('Female');
    expect(useOnboardingStore.getState().preferredTrainerGender).toBe('Female');
    await press('Male');
    expect(useOnboardingStore.getState().preferredTrainerGender).toBe('Male');
  });

  it('format is multi-select', async () => {
    await render(<TrainerPreferencesScreen />);

    await press('Online');
    await press('In-person');
    expect(useOnboardingStore.getState().preferredFormat).toEqual([
      'Online',
      'In-person',
    ]);
  });

  it('advances to ProfilePhoto on Next', async () => {
    await render(<TrainerPreferencesScreen />);
    await press('Next step');
    expect(mockNavigate).toHaveBeenCalledWith('ProfilePhoto');
  });
});
